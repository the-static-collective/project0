# Canonical Addressing v0.1

This specification defines the deterministic byte serialization and hashing rules for Project 0. All implementations must adhere strictly to these rules to guarantee stable cryptographic identities for nodes, edges, receipts, and requests.

## 1. Canonical Serialization Format

Project 0 uses **RFC 8785 JSON Canonicalization Scheme (JCS)** as the absolute byte-level representation prior to hashing.

### Formatting Rules
1. **Whitespace**: No whitespace (spaces, tabs, newlines) is permitted outside of string values.
2. **Object Key Ordering**: Object keys MUST be sorted lexicographically by their UTF-16 code units (as defined in RFC 8785).
3. **Array Ordering**: Arrays retain their original order.
4. **String Normalization**: Strings must be encoded in valid UTF-8. No Unicode normalization (e.g., NFC/NFD) is forced by the hashing layer; the exact codepoints provided are serialized. Characters must be escaped according to RFC 8785 rules.
5. **Numbers**: Numbers must be serialized according to the strict JSON number formatting rules of RFC 8785 (e.g., no trailing zeroes, no `e` notation for specific ranges, no `-0`).
6. **Timestamps**: All timestamps must be serialized as ISO-8601 string representations in UTC, ending in `Z` (e.g., `"2026-08-01T22:17:39Z"`).
7. **Omitted Fields vs. Null**: A field that is structurally omitted is absent from the byte array. A field explicitly set to `null` is serialized as `"field":null`. These two states hash differently.
8. **Binary Data**: Binary artifacts must be serialized as `base64url` (RFC 4648 without padding) strings.

## 2. Cryptographic Hashing and Domain Separation

To prevent collision attacks across different data types (e.g., crafting a node that parses identically to a receipt), Project 0 enforces strict **Domain Separation**.

### Domain Prefixes
Before hashing, the canonical JCS byte array is prefixed with a domain tag.

| Object Type | Prefix String (UTF-8) |
|---|---|
| Node | `Project0-Node-v1|` |
| Edge | `Project0-Edge-v1|` |
| Receipt | `Project0-Receipt-v1|` |
| Request | `Project0-Request-v1|` |
| Artifact | `Project0-Artifact-v1|` |

### Hashing Algorithm
The hashing algorithm is **SHA-256**.

The exact payload hashed is:
`HashInput = UTF8_Encode(DomainPrefix) + JCS_Serialize(Object)`

### Textual ID Format
The resulting hash is encoded using `base58btc`. The final textual identifier prepends the type domain in lowercase:

- Node: `node-<base58btc>`
- Edge: `edge-<base58btc>`
- Receipt: `rect-<base58btc>`
- Request: `reqt-<base58btc>`

*Example: `node-QmV8RkH...`*

## 3. Exclusion of Self-Reference and Signatures

Cryptographic IDs require hashing the object. To prevent recursive paradoxes, the object's own identifier and any cryptographic signatures covering the object must be removed from the object *before* canonical serialization.

Prior to computing the hash, an implementation MUST structurally remove:
1. The `id` or `receiptId` field.
2. The `canonicalHash` field.
3. Any `signature` or `signatures` array present at the root of the object.

## 4. Versioning and Migration

The prefixes end in `-v1|`. If the underlying canonicalization or hashing schema must change (e.g., migrating from SHA-256 to SHA-3), the prefix will be bumped (e.g., `Project0-Node-v2|`). This guarantees that older hashes never silently collide with newer schema hashes. Migration adapters must preserve the original `-v1` hash string as an immutable alias if the object is upgraded.

## 5. Compatibility Consequences

- **TranchNode**: TranchNode v0.1 does not enforce JCS or domain separation. Adapters MUST perform JCS canonicalization and SHA-256 hashing client-side before communicating with TranchNode, storing the Project 0 textual ID (`node-Qm...`) in TranchNode's string ID fields.
- **Project 0 Executable Contract**: Floor 1.1 implementation of the reference kernel relies completely on this addressing scheme for verifiable graph integrity.
