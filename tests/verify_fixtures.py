import json
import os
import hashlib
import math
import base58
import jcs
import re
import traceback
from datetime import datetime, timezone

FIXTURE_DIR = 'fixtures/canonical-addressing'
TIMESTAMP_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$')

def validate_timestamp(ts):
    if type(ts) is not str:
        raise Exception("INVALID_TYPE")
    if not TIMESTAMP_REGEX.match(ts):
        raise Exception("INVALID_TIMESTAMP")

    # Ensure calendar logic is valid (e.g. no Feb 29 in non-leap year, no Month 13)
    try:
        # Python fromisoformat expects +00:00 instead of Z in <= 3.10, but natively handles Z in 3.11+.
        # We replace Z with +00:00 just to be safe.
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        # We also want to verify it didn't silently wrap/clamp, though python fromisoformat is strict.
    except Exception:
        raise Exception("INVALID_TIMESTAMP")

def validate_for_canonicalization(obj, seen=None):
    if seen is None:
        seen = set()
    if obj is None:
        return

    if type(obj) is bool:
        return
    if type(obj) is int:
        return
    if type(obj) is float:
        if math.isnan(obj) or math.isinf(obj):
            raise Exception("NON_FINITE_NUMBER")
        return
    if type(obj) is str:
        for char in obj:
            if 0xD800 <= ord(char) <= 0xDFFF:
                raise Exception("LONE_SURROGATE")
        return

    # We explicitly test the Python undefined marker here to evaluate dictionary iteration safety
    if type(obj) is type and obj is type(None):
        raise Exception("UNDEFINED_VALUE")

    if type(obj) is dict:
        if id(obj) in seen:
            raise Exception("CYCLIC_VALUE")
        seen.add(id(obj))
        for key, val in obj.items():
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))
        return

    if type(obj) is list:
        if id(obj) in seen:
            raise Exception("CYCLIC_VALUE")
        seen.add(id(obj))
        for val in obj:
            validate_for_canonicalization(val, seen)
        seen.remove(id(obj))
        return

    # If it's not one of the explicit JSON primitives/composites, reject it
    raise Exception("CUSTOM_PROTOTYPE")

def construct_node_body(node):
    for field in ['kind', 'body', 'createdAt', 'createdBy', 'provenance', 'disclosure']:
        if field not in node: raise Exception("MISSING_FIELD")

    validate_timestamp(node["createdAt"])
    return {
        "kind": node["kind"],
        "body": node["body"],
        "createdAt": node["createdAt"],
        "createdBy": node["createdBy"],
        "provenance": node["provenance"],
        "disclosure": node["disclosure"]
    }

def construct_edge_body(edge):
    for field in ['type', 'from', 'to', 'assertedBy', 'createdAt', 'scopeId', 'disclosure']:
        if field not in edge: raise Exception("MISSING_FIELD")

    validate_timestamp(edge["createdAt"])
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
    if 'validFrom' in edge:
        if edge["validFrom"] is not None: validate_timestamp(edge["validFrom"])
        body["validFrom"] = edge["validFrom"]
    if 'validUntil' in edge:
        if edge["validUntil"] is not None: validate_timestamp(edge["validUntil"])
        body["validUntil"] = edge["validUntil"]
    return body

def construct_receipt_body(receipt):
    for field in ['receiptType', 'issuedAt', 'issuer', 'subject', 'inputs', 'outputs', 'policyRefs', 'previousReceiptRefs']:
         if field not in receipt: raise Exception("MISSING_FIELD")
    validate_timestamp(receipt["issuedAt"])
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
    for field in ['requester', 'actor', 'purpose', 'destinationScopeId', 'status']:
         if field not in request: raise Exception("MISSING_FIELD")
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

    if data.get('operation') == 'reject_transport_state':
        return # Handled separately in test_python_transport_rejection()

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

    expected_status = data.get('expectedStatus', 'accepted')

    try:
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

            if expected_status == 'rejected':
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

        if expected_status == 'rejected':
             raise Exception(f"FAIL (Accepted incorrectly): {data['name']} was expected to reject but was accepted.")

        print(f"PASS: {data['name']}")
    except Exception as e:
        error_msg = str(e)
        if expected_status == 'rejected':
            if error_msg == data.get('expectedErrorCode', ''):
                print(f"PASS (Rejected as expected with {error_msg}): {data['name']}")
            else:
                print(f"FAIL (Rejected with wrong code): Expected {data.get('expectedErrorCode')}, Got {error_msg} for {data['name']}")
                exit(1)
        else:
            print(f"FAIL (Unexpected error): {data['name']} - {error_msg}")
            exit(1)

def test_python_transport_rejection():
    print("Verifying Python Native Prohibited States...")

    # 1. NaN and Infinity
    try:
        validate_for_canonicalization({"a": float('nan')})
        raise Exception("Failed to reject NaN")
    except Exception as e:
        if str(e) != "NON_FINITE_NUMBER": raise Exception(f"Wrong code for NaN: {e}")

    try:
        validate_for_canonicalization({"a": float('inf')})
        raise Exception("Failed to reject Infinity")
    except Exception as e:
        if str(e) != "NON_FINITE_NUMBER": raise Exception(f"Wrong code for Infinity: {e}")

    # 2. Custom Prototype / Class Instance
    class CustomClass:
        def __init__(self):
            self.a = 1

    try:
        validate_for_canonicalization({"a": CustomClass()})
        raise Exception("Failed to reject custom prototype")
    except Exception as e:
         if str(e) != "CUSTOM_PROTOTYPE": raise Exception(f"Wrong code for custom prototype: {e}")

    # 3. Cyclic Object
    a = {}
    a['b'] = a
    try:
        validate_for_canonicalization(a)
        raise Exception("Failed to reject cyclic object")
    except Exception as e:
         if str(e) != "CYCLIC_VALUE": raise Exception(f"Wrong code for cyclic object: {e}")

    # 4. Undefined
    # Python dicts do not have "undefined". We mock it with type(None) class just to prove the recursive walker correctly errors out if it finds it.
    try:
        validate_for_canonicalization({"a": type(None)})
        raise Exception("Failed to reject undefined")
    except Exception as e:
         if str(e) != "UNDEFINED_VALUE": raise Exception(f"Wrong code for undefined: {e}")

    # 5. Sparse arrays
    # Python lists cannot be sparse. This state is strictly unrepresentable in native Python.
    print("Note: Sparse arrays have no native Python equivalent. Skipped.")

    print("PASS: Python Native Prohibited States")


def main():
    test_python_transport_rejection()
    for filename in os.listdir(FIXTURE_DIR):
        if filename.endswith('.json'):
            check_fixture(os.path.join(FIXTURE_DIR, filename))

if __name__ == '__main__':
    main()
