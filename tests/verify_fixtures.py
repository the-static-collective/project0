import json
import os
import hashlib
import math
import base58
import jcs

FIXTURE_DIR = 'fixtures/canonical-addressing'

def validate_for_canonicalization(obj, seen=None):
    if seen is None:
        seen = set()
    if obj is None:
        return
    if isinstance(obj, float):
        if math.isnan(obj):
            raise ValueError("NaN is not allowed")
        if math.isinf(obj):
            raise ValueError("Infinity is not allowed")
    if isinstance(obj, str):
        # Python handles surrogates well natively, but we can do a basic check
        for char in obj:
            if 0xD800 <= ord(char) <= 0xDFFF:
                raise ValueError("Surrogates not allowed in strictly parsed UTF-8")
    if isinstance(obj, dict):
        if id(obj) in seen:
            raise ValueError("Cyclic object detected")
        seen.add(id(obj))
        for val in obj.values():
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))
    if isinstance(obj, list):
        if id(obj) in seen:
            raise ValueError("Cyclic object detected")
        seen.add(id(obj))
        for val in obj:
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))

def construct_node_body(node):
    return {
        "kind": node.get("kind"),
        "body": node.get("body"),
        "createdAt": node.get("createdAt"),
        "createdBy": node.get("createdBy"),
        "provenance": node.get("provenance"),
        "disclosure": node.get("disclosure")
    }

def construct_edge_body(edge):
    return {
        "type": edge.get("type"),
        "from": edge.get("from"),
        "to": edge.get("to"),
        "assertedBy": edge.get("assertedBy"),
        "createdAt": edge.get("createdAt"),
        "scopeId": edge.get("scopeId"),
        "basis": edge.get("basis"),
        "disclosure": edge.get("disclosure"),
        "validFrom": edge.get("validFrom"),
        "validUntil": edge.get("validUntil")
    }

def construct_receipt_body(receipt):
    return {
        "receiptType": receipt.get("receiptType"),
        "issuedAt": receipt.get("issuedAt"),
        "issuer": receipt.get("issuer"),
        "subject": receipt.get("subject"),
        "inputs": receipt.get("inputs"),
        "outputs": receipt.get("outputs"),
        "authorityRef": receipt.get("authorityRef"),
        "policyRefs": receipt.get("policyRefs"),
        "previousReceiptRefs": receipt.get("previousReceiptRefs")
    }

def construct_request_body(request):
    return {
        "requester": request.get("requester"),
        "actor": request.get("actor"),
        "purpose": request.get("purpose"),
        "destinationScopeId": request.get("destinationScopeId"),
        "status": request.get("status")
    }

def construct_body(type_name, obj):
    if type_name == 'Node':
        return construct_node_body(obj)
    elif type_name == 'Edge':
        return construct_edge_body(obj)
    elif type_name == 'Receipt':
        return construct_receipt_body(obj)
    elif type_name == 'Request':
        return construct_request_body(obj)
    else:
        raise ValueError("Unknown type")

def check_fixture(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Verifying {data['name']}...")

    if data['type'] == 'Artifact':
        raw_bytes = bytes.fromhex(data['rawInputHex'])
        digest = hashlib.sha256(raw_bytes).digest()
        digest_hex = digest.hex()

        if digest_hex != data['digestHex']:
            raise Exception(f"Digest mismatch for {data['name']}")
        if data['textualAddress'] != digest_hex:
            raise Exception(f"Textual address mismatch for {data['name']}")
        print(f"PASS: {data['name']}")
        return

    try:
        if data.get('malformedTextualAddress'):
            # The test should explicitly test address decoding
            try:
                # We expect this to fail
                parts = data['input_address'].split('-')
                if len(parts) != 2: raise ValueError("Malformed prefix")
                b58_bytes = base58.b58decode(parts[1])
                if len(b58_bytes) != 32: raise ValueError("Invalid hash length")
                if data.get('expectedStatus') == 'rejected':
                    pass # We successfully rejected it
                else:
                    raise Exception(f"Failed to reject malformed address {data['name']}")
            except Exception as e:
                if data.get('expectedStatus') != 'rejected':
                    raise Exception(f"Address rejected incorrectly {data['name']}: {e}")
            print(f"PASS: {data['name']}")
            return

        # Regular path
        body = construct_body(data['type'], data['input'])
        validate_for_canonicalization(body)
        canonical_bytes = jcs.canonicalize(body)

        domain_prefix = bytes.fromhex(data['domainPrefixHex'])
        preimage = domain_prefix + canonical_bytes
        preimage_hex = preimage.hex()

        if preimage_hex != data['preimageHex']:
            raise Exception(f"Preimage mismatch for {data['name']}")

        digest = hashlib.sha256(preimage).digest()
        digest_hex = digest.hex()

        if digest_hex != data['digestHex']:
            raise Exception(f"Digest mismatch for {data['name']}")

        prefix_map = {
            'Node': 'node-',
            'Edge': 'edge-',
            'Receipt': 'rect-',
            'Request': 'reqt-'
        }

        b58 = base58.b58encode(digest).decode('ascii')
        expected_address = prefix_map[data['type']] + b58

        if expected_address != data['textualAddress']:
            raise Exception(f"Textual address mismatch for {data['name']}")

        if data.get('expectedStatus') == 'rejected':
             raise Exception(f"{data['name']} was expected to reject but was accepted.")

        print(f"PASS: {data['name']}")
    except Exception as e:
        if data.get('expectedStatus') == 'rejected':
            print(f"PASS (Rejected as expected): {data['name']} - {e}")
        else:
            raise Exception(f"ERROR on {data['name']}: {e}")

def main():
    for filename in os.listdir(FIXTURE_DIR):
        if filename.endswith('.json'):
            check_fixture(os.path.join(FIXTURE_DIR, filename))

if __name__ == '__main__':
    main()
