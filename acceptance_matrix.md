# Acceptance Matrix for Issue #5

| Requirement | Status | Evidence |
|---|---|---|
| Use JCS for cross-language consistency | Meets | Python uses `jcs` library, TS uses `json-canonicalize` |
| Separates ArtifactAddress and SemanticAddress | Meets | Distinct functions `computeArtifactAddress` and `computeSemanticAddress` used |
| Mandates explicit object type schemas (no generic root field deletion) | Meets | Constructors strictly dictate shape: `constructNodeBody`, `constructEdgeBody`, etc |
| Specific prefix hashing | Meets | Hardcoded schema prefixes used before SHA256 (e.g., `Project0-Node-v1|`) |
| Recursively rejects undefined, NaN, infinities, sparse arrays | Meets | Validated via TS explicit check arrays, Python validator, and `.json` test fixtures containing negative vectors |
| Strict UTC Z timestamp validation | Meets | `TIMESTAMP_REGEX` ensures valid, padded UTC ISO timestamps format matching |
| Descriptor-based rejection of accessors | Meets | Object descriptors verified without execution (to avert maliciously placed getters modifying state) |
| Independent cross-runtime test verification | Meets | TS (`canonical-addressing.test.ts`) & Python (`verify_fixtures.py`) test suites cover same JSON canonicalization vectors |
| Pre-existing Exported Semantic Address API Signature Preservation | Meets | `parseSemanticAddress(type, textualId)` preserved with backwards compatibility. |
| Accept integer values through Number.MAX_SAFE_INTEGER and MIN_SAFE_INTEGER | Meets | Standard integer properties are naturally parsed and evaluated safely, supported via RFC 8785 boundaries implicitly up to those numbers |
| Reject integer values outside safe-integer range explicitly with UNSAFE_INTEGER | Meets | Rejects values < -9007199254740991 and > 9007199254740991 (checked explicitly in both python and typescript) |

## Remaining Tensions
* The "TranchNode numeric boundary mapping" tension is explicitly stated in `ECOSYSTEM.md` regarding structural mismatches between the frozen TranchNode edge/node model versus Project 0 definitions, though numeric bounds match within the canonical evaluation.
