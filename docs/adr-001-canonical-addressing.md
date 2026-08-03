# ADR 001: Canonical Serialization and Hashing for Project 0

## Status
Proposed

## Context
Project 0 requires an exact, deterministic canonicalization format to compute cryptographic IDs for nodes, edges, receipts, and requests. Since artifacts cross administrative domains (like TranchNode and Full Measure Layer), any ambiguity in byte-level representation (e.g., dictionary key ordering, numeric precision, string encoding, or whitespace) will cause hash fragmentation, breaking the `isCrossScopeBridged` predicates and cryptographic linkage laws.

We must select a canonical format that:
1. Is deterministic across languages.
2. Supports the complex, schema-less (or loosely schema'd) object envelopes required by Project 0.
3. Provides a clean mechanism to construct hashable bodies strictly.

We evaluated three options:
1. **RFC 8785 (JSON Canonicalization Scheme - JCS)**
2. **Deterministic CBOR (RFC 8949)**
3. **Project-Specific Canonical JSON Profile**

## Decision
We choose **RFC 8785 (JCS)**.

## Tradeoffs

### RFC 8785 (JSON Canonicalization Scheme)
*   **Pros**:
    *   Explicitly designed for cryptographic operations on JSON.
    *   Standardizes lexicographical key sorting (UTF-16 code units), precise numeric formatting, and strict unicode escaping.
    *   Widely supported in multiple languages.
    *   Human-readable, aligning with the "inspectable" requirements of Project 0 receipts.
*   **Cons**:
    *   Larger byte footprint than binary formats like CBOR.
    *   JSON natively lacks explicit type tags (e.g., differentiating between a string timestamp and an integer timestamp without a schema).

### Deterministic CBOR (RFC 8949 Core Deterministic Encoding)
*   **Pros**:
    *   Extremely compact binary representation.
    *   Native tagging for dates, big integers, and byte strings.
*   **Cons**:
    *   Not human-readable (requires tooling to inspect). Project 0 places a high premium on human inspectability for receipts and tensions.
    *   CBOR map key sorting rules are notoriously complex (sorting by length first, then by byte value), which leads to implementation errors across different languages.

### Custom Canonical JSON Profile
*   **Pros**:
    *   Could be tailored exactly to Project 0's ontology, ignoring irrelevant edge cases.
*   **Cons**:
    *   "Silently inventing a hybrid" leads to specification drift. Maintaining a custom spec for numeric precision and unicode escaping is an anti-pattern when an IETF standard exists.

## TranchNode Compatibility Consequences
TranchNode v0.1 does not natively enforce an explicit hashing specification. Adopting RFC 8785 means TranchNode adapters MUST parse TranchNode payloads, canonicalize them to JCS, and hash them to verify Project 0 identity. If TranchNode stores floating-point numbers differently than the JCS specification formats them, the adapter must absorb this translation losslessly.
