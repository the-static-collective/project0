# Canonical Addressing v0.1

This specification defines the deterministic byte serialization and hashing rules for Project 0. All implementations must adhere strictly to these rules to guarantee stable cryptographic identities for nodes, edges, receipts, requests, and artifacts.

## 1. Addressing Equations

Project 0 defines two distinct addressing equations.

### ArtifactAddress
Raw binary or textual artifacts (media, blobs, raw files) are addressed by the lowercase hex encoding of their raw SHA-256 digest. **Raw artifact bytes must never be base64url-wrapped, JSON-canonicalized, or domain-prefixed before hashing.**

```text
ArtifactAddress = lowercase_hex(SHA-256(exactRawArtifactBytes))
```

### SemanticAddress
Meaning-bearing JSON objects (Nodes, Edges, Receipts, Requests) use a typed textual encoding derived from a domain-prefixed JCS canonicalization.

```text
SemanticAddress(type, body) = typed textual encoding of SHA-256(UTF8(registeredDomainSeparator(type)) || RFC8785(body))
```

## 2. Pre-Canonicalization Validation

Before `RFC8785` serialization occurs, the object MUST pass a recursive validation phase. The system MUST explicitly reject objects containing:
- `undefined` in object properties
- `undefined` and holes in arrays
- `NaN`
- positive and negative `Infinity`
- `bigint`, `symbol`, `function`, and unsupported object types
- lone Unicode surrogates
- cyclic objects
- values beyond the canonicalization traversal-depth limit

Canonicalization traversal uses one shared convention across implementations: the root semantic payload is depth `0`, and each object-property value or array element increases depth by `1`. The maximum accepted depth is `100`; any value encountered at depth `101` or greater MUST reject with the stable error code `DEPTH_LIMIT_EXCEEDED`.

This limit is pre-canonicalization validation only. It does not alter RFC 8785 bytes, domain prefixes, textual address syntax, or the identity of any payload that was already accepted within the bound.

Rejection must happen explicitly before calling the `json-canonicalize` library.

## 3. Timestamp Representation

All timestamps (`createdAt`, `issuedAt`, etc.) MUST be strictly formatted as ISO-8601 UTC strings ending in `Z`. They MUST include exactly three digits of millisecond precision if fractional seconds are present, and MUST omit the fractional segment entirely if zero (e.g., `"2026-08-01T22:17:39Z"` vs `"2026-08-01T22:17:39.123Z"`). Timezone offsets (e.g., `+00:00`) are strictly prohibited prior to canonicalization.

## 4. Explicit Hashed-Body Schemas

To prevent hidden data via generic exclusion, we do NOT generically delete every root field named `id`, `signature`, or `canonicalHash`. Instead, each semantic type defines an exact explicit constructor for its hashed body.

### Node Hashed Body
```json
{
  "kind": "string",
  "body": "any",
  "createdAt": "string",
  "createdBy": "string",
  "provenance": "array",
  "disclosure": "string"
}
```

### Edge Hashed Body
```json
{
  "type": "string",
  "from": "string",
  "to": "string",
  "assertedBy": "string",
  "createdAt": "string",
  "scopeId": "string",
  "basis": "string | null",
  "disclosure": "string",
  "validFrom": "string | null",
  "validUntil": "string | null"
}
```

### Receipt Hashed Body
```json
{
  "receiptType": "string",
  "issuedAt": "string",
  "issuer": "string",
  "subject": "string",
  "inputs": "object",
  "outputs": "object",
  "authorityRef": "string | null",
  "policyRefs": "array",
  "previousReceiptRefs": "array"
}
```

### Request Hashed Body
```json
{
  "requester": "string",
  "actor": "string",
  "purpose": "string",
  "destinationScopeId": "string",
  "status": "string"
}
```

## 5. Domain Separators

| Semantic Type | Prefix String (UTF-8) |
|---|---|
| Node | `Project0-Node-v1|` |
| Edge | `Project0-Edge-v1|` |
| Receipt | `Project0-Receipt-v1|` |
| Request | `Project0-Request-v1|` |

## 6. Textual Encoding (base58btc)

The output `SemanticAddress` uses raw `base58btc` encoding. It is **not** multibase-prefixed (do not arbitrarily prepend `z` or assume `Qm...` semantics unless explicitly wrapping a multihash).

The raw base58 alphabet is: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`.

The final textual address prepends the exact type prefix:
- Node: `node-<raw_base58btc_hash>`
- Edge: `edge-<raw_base58btc_hash>`
- Receipt: `rect-<raw_base58btc_hash>`
- Request: `reqt-<raw_base58btc_hash>`

Implementations MUST rigorously enforce format, length, exact alphabet, and prefix matching. Malformed addresses must be explicitly rejected.
