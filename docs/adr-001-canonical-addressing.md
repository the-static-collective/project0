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

## TranchNode Numeric Boundary Incompatibility
TranchNode v0.1 does not natively preserve exact RFC 8785 byte representations (e.g., it may not differentiate between floating point values or preserve exponent syntax bounds exactly as JCS demands in its storage layer).

**Resolution:** This is an explicit incompatibility. Adapters MUST strictly evaluate numeric values prior to graph admission. They MUST explicitly fail admission (reject) for any payload containing `-0`, `NaN`, `Infinity`, or numbers outside the IEEE-754 safe integer range (`[-(2^53 - 1), 2^53 - 1]`). Silently coercing numbers, discarding precision, or lossy round-tripping between TranchNode and Project 0 schemas is strictly prohibited.

## Acceptance Matrix for Issue #5

| Requirement | Implementation Validation |
|---|---|
| Split Artifact vs Semantic equations | Enforced via separate `computeArtifactAddress` vs `computeSemanticAddress` functions. |
| Reject Unsafe Native Transport States | Typescript tests explicitly reject `undefined`, `NaN`, `Infinity`, symbols, Maps, and sparse arrays via explicit getter/descriptor bounds. |
| Object-key & Array Ordering | Inherited from RFC 8785 via standard JCS wrapper. Explicitly tested. |
| Null vs Omitted Fields | Fixtures explicitly test and demonstrate hash differences. |
| Exponent/Numeric Boundaries | `exponent_boundaries.json` and `-0` negative zero serialization explicitly handled/tested via RFC 8785 specification. |
| Unicode constraints | Tested composed/decomposed vectors and non-BMP boundaries explicitly. Lone surrogates strictly rejected by pre-JCS iteration. |
| Explicit Typed Body Schemas | `constructNodeBody`, `constructEdgeBody` etc., strictly build dictionaries field by field, rejecting any absent required fields without `undefined`-to-`null` fallbacks. |
| Branded Addressing Functions | All callers must invoke `computeSemanticAddress` which internally determines the prefix strings based on strict semantic unions. |
