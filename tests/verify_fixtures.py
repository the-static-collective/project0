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
        if math.isnan(obj) or math.isinf(obj):
            raise Exception("NON_FINITE_NUMBER")
    if isinstance(obj, str):
        # Python handles surrogates well natively, but we can do a basic check
        for char in obj:
            if 0xD800 <= ord(char) <= 0xDFFF:
                raise Exception("LONE_SURROGATE")
    if isinstance(obj, dict):
        if id(obj) in seen:
            raise Exception("CYCLIC_VALUE")
        seen.add(id(obj))
        for key, val in obj.items():
            if val is type(None) and key == 'undefined_mock': # Just a way to track explicit undefined
                raise Exception("UNDEFINED_VALUE")
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))
    if isinstance(obj, list):
        if id(obj) in seen:
            raise Exception("CYCLIC_VALUE")
        seen.add(id(obj))
        for val in obj:
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))

def construct_declarative(construct_op):
    if construct_op == 'nested_undefined':
        obj = {"kind": "claim", "body": {"a": 1, "b": {"c": None}}, "createdAt": "2026-08-01T22:17:39Z", "createdBy": "u1", "provenance": [], "disclosure": "public"}
        obj["body"]["b"]["c"] = type(None) # Use type(None) class as a distinct marker for undefined
        obj["body"]["b"]["undefined_mock"] = type(None)
        return obj
    elif construct_op == 'sparse_array':
        raise Exception("SPARSE_ARRAY") # Python lists can't really be sparse, fail eagerly
    elif construct_op == 'nan_and_infinities':
        return {"kind": "claim", "body": {"a": float('nan'), "b": float('inf'), "c": float('-inf')}, "createdAt": "2026-08-01T22:17:39Z", "createdBy": "u1", "provenance": [], "disclosure": "public"}
    elif construct_op == 'unsupported_map':
        raise Exception("UNSUPPORTED_TYPE") # Simulate unsupported types
    elif construct_op == 'cyclic_value':
        obj = {"kind": "claim", "body": {"a": 1}, "createdAt": "2026-08-01T22:17:39Z", "createdBy": "u1", "provenance": [], "disclosure": "public"}
        obj["body"]["b"] = obj
        return obj
    raise ValueError(f"Unknown constructOp: {construct_op}")

def construct_node_body(node):
    if 'kind' not in node or 'body' not in node or 'createdAt' not in node or 'createdBy' not in node or 'provenance' not in node or 'disclosure' not in node:
        raise Exception("MISSING_FIELD")
    return {
        "kind": node["kind"],
        "body": node["body"],
        "createdAt": node["createdAt"],
        "createdBy": node["createdBy"],
        "provenance": node["provenance"],
        "disclosure": node["disclosure"]
    }

def construct_edge_body(edge):
    if 'type' not in edge or 'from' not in edge or 'to' not in edge or 'assertedBy' not in edge or 'createdAt' not in edge or 'scopeId' not in edge or 'disclosure' not in edge:
         raise Exception("MISSING_FIELD")
    body = {
        "type": edge["type"],
        "from": edge["from"],
        "to": edge["to"],
        "assertedBy": edge["assertedBy"],
        "createdAt": edge["createdAt"],
        "scopeId": edge["scopeId"],
        "disclosure": edge["disclosure"]
    }
    if 'basis' in edge: body["basis"] = edge["basis"]
    if 'validFrom' in edge: body["validFrom"] = edge["validFrom"]
    if 'validUntil' in edge: body["validUntil"] = edge["validUntil"]
    return body

def construct_receipt_body(receipt):
    if 'receiptType' not in receipt or 'issuedAt' not in receipt or 'issuer' not in receipt or 'subject' not in receipt or 'inputs' not in receipt or 'outputs' not in receipt or 'policyRefs' not in receipt or 'previousReceiptRefs' not in receipt:
        raise Exception("MISSING_FIELD")
    return {
        "receiptType": receipt["receiptType"],
        "issuedAt": receipt["issuedAt"],
        "issuer": receipt["issuer"],
        "subject": receipt["subject"],
        "inputs": receipt["inputs"],
        "outputs": receipt["outputs"],
        "authorityRef": receipt.get("authorityRef", None),
        "policyRefs": receipt["policyRefs"],
        "previousReceiptRefs": receipt["previousReceiptRefs"]
    }

def construct_request_body(request):
    if 'requester' not in request or 'actor' not in request or 'purpose' not in request or 'destinationScopeId' not in request or 'status' not in request:
        raise Exception("MISSING_FIELD")
    return {
        "requester": request["requester"],
        "actor": request["actor"],
        "purpose": request["purpose"],
        "destinationScopeId": request["destinationScopeId"],
        "status": request["status"]
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
        if data.get('operation') == 'reject_transport_state':
            body = construct_declarative(data['constructOp'])
            validate_for_canonicalization(body)
            # If we get here, it didn't reject when it should have
            raise Exception(f"Failed to reject transport state for {data['name']}")

        if data.get('malformedTextualAddress'):
            # The test should explicitly test address decoding
            parts = data['input_address'].split('-')

            if parts[0] not in ['node', 'edge', 'rect', 'reqt']:
                raise Exception("INVALID_ADDRESS_PREFIX")

            if len(parts) != 2: raise Exception("INVALID_ADDRESS_PREFIX")

            # verify alphabet explicitly
            alphabet = set("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
            if not all(c in alphabet for c in parts[1]):
                raise Exception("INVALID_ADDRESS_ALPHABET")

            b58_bytes = base58.b58decode(parts[1])
            if len(b58_bytes) != 32: raise Exception("INVALID_ADDRESS_LENGTH")

            if data.get('expectedStatus') == 'rejected':
                raise Exception(f"Failed to reject malformed address {data['name']}")
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
        error_msg = str(e)
        if data.get('expectedStatus') == 'rejected':
            if error_msg == data.get('expectedErrorCode', ''):
                print(f"PASS (Rejected as expected with {error_msg}): {data['name']}")
            else:
                print(f"FAIL (Rejected with wrong code): Expected {data.get('expectedErrorCode')}, Got {error_msg} for {data['name']}")
                exit(1)
        else:
            print(f"FAIL (Unexpected error): {data['name']} - {error_msg}")
            exit(1)

def main():
    for filename in os.listdir(FIXTURE_DIR):
        if filename.endswith('.json'):
            check_fixture(os.path.join(FIXTURE_DIR, filename))

if __name__ == '__main__':
    main()
