# ADR 001: Canonical Serialization and Hashing for Project 0

## Status
Proposed

## Context
Project 0 requires an exact, deterministic canonicalization format to compute cryptographic IDs for nodes, edges, receipts, and requests. Any ambiguity in byte-level representation (e.g., dictionary key ordering, numeric precision, string encoding, or whitespace) will cause hash fragmentation.

We must select a canonical format that:
1. Is deterministic across languages.
2. Supports the complex object envelopes required by Project 0.
3. Provides an explicit mechanism to construct hashable bodies strictly, rather than using generic field deletion rules.

We evaluated three options:
1. **RFC 8785 (JSON Canonicalization Scheme - JCS)**
2. **Deterministic CBOR (RFC 8949)**
3. **Project-Specific Canonical JSON Profile**

## Decision
We choose **RFC 8785 (JCS)**.

## Tradeoffs

### RFC 8785 (JSON Canonicalization Scheme)
*   **Pros**: Explicitly designed for cryptographic operations on JSON. Standardizes lexicographical key sorting (UTF-16 code units), precise numeric formatting, and strict unicode escaping. Widely supported. Human-readable.
*   **Cons**: JSON natively lacks explicit type tags (e.g., Date or Map), meaning non-plain objects must be explicitly rejected before canonicalization.

### Deterministic CBOR (RFC 8949 Core Deterministic Encoding)
*   **Pros**: Extremely compact. Native tagging.
*   **Cons**: Not human-readable. CBOR map key sorting rules are notoriously complex and error-prone across implementations.

### Custom Canonical JSON Profile
*   **Pros**: Could be tailored.
*   **Cons**: "Silently inventing a hybrid" leads to specification drift. Maintaining a custom spec for numerics and unicode is an anti-pattern.

## TranchNode Compatibility Consequences
TranchNode v0.1 does not enforce JCS or domain separation. TranchNode adapters MUST canonicalize payloads to JCS, and hash them to verify Project 0 identity. If TranchNode stores floating-point numbers differently than JCS formats them, the adapter must absorb this translation losslessly.
