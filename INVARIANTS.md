# Invariants

A conforming implementation MUST preserve these properties.

## Meaning and history

1. **No silent rewrite** — Meaning-bearing nodes are immutable. Correction creates a new node and an explicit relationship.
2. **Provenance closure** — Every derived node cites sufficient ancestors to trace its derivation.
3. **No destructive consensus** — Synthesis never deletes dissent, tension, rejection, or uncertainty.
4. **Stable identity** — Identical-looking payloads with materially different provenance or disclosure are not silently collapsed.
5. **Relationship preservation** — Export, compression, and migration preserve typed relationships required to recover meaning.

## Authority and disclosure

6. **Retrieval is not authority** — Finding a node grants no right to mutate, disclose, execute, or treat it as canonical.
7. **Bounded authority** — Delegated powers identify issuer, recipient, capability, scope, duration or exhaustion, and lineage.
8. **Disclosure travels with the object** — Copying or deriving does not erase applicable disclosure constraints.
9. **Least revelation** — A participant reveals only what the declared purpose requires.
10. **Human boundary supremacy** — Agent convenience and model inference cannot enlarge a human-granted scope.

## Claims, witnesses, and receipts

11. **Confidence is not evidence** — Scores describe an evaluator, not reality.
12. **Witnessing is observation** — A witness receipt proves that an attributable witness reported an observation; it does not alone prove the underlying event.
13. **Hashing is identity and tamper evidence** — Hashing does not perform moral, semantic, or legal validation.
14. **Receipts are append-only** — A later receipt may supersede, consume, dispute, or revoke effects; it does not erase the earlier record.
15. **Claims remain attributable** — Model-generated and human-generated claims retain distinct authorship.

## System behavior

16. **Models propose** — Models may interpret, retrieve, rank, and propose. They do not silently rewrite canonical memory.
17. **Applications are replaceable** — No application UI is the sole carrier of shared semantics.
18. **Deterministic verification** — Canonical serialization, hashing, and fixture verification are model-independent.
19. **Offline survivability** — The core contract can be represented and verified without dependence on a proprietary inference service.
20. **Explicit uncertainty** — Unknown, withheld, disputed, and inapplicable are distinct states.

## Adversarial Examples & Required Fixtures

The following deterministic adversarial examples and fixtures ensure the edge laws and invariants cannot be silently bypassed. Expected evaluation results are strict.

1. **observation → inference → claim**:
   - *Inputs*: Node A (`observation`), Node B (`inference`, derived_from: A, assertedBy: model), Node C (`claim`, derived_from: B, assertedBy: human).
   - *Expected Result*: Traversal successfully traces human claim C back to observation A while preserving the model's intermediate inference boundary. Direct `derived_from` between C and A without B fails validation (Defends Invariants 2 and 15).

2. **rejected proposal remains queryable**:
   - *Inputs*: Node A (`proposal`), Node B (`rejection`, rebuttal_to: A), Node C (`inference`, derived_from: B).
   - *Expected Result*: Node C evaluates as valid and correctly decompresses the grounds in B. If B is purely a receipt or state, C fails admission due to missing derivation target (Defends Invariant 3).

3. **duplicate relationship assertions by different authors**:
   - *Inputs*: Edge E1 (`supports`, A -> B, assertedBy: humanX, disclosure: public), Edge E2 (`supports`, A -> B, assertedBy: humanY, disclosure: private).
   - *Expected Result*: The graph contains two distinct edge IDs. A public query returns only E1; a private query by humanY returns E1 and E2. They do not silently collapse (Defends Invariant 4).

4. **disputed edge excluded from active evidence**:
   - *Inputs*: Edge E1 (`supports`, A -> B), Node C (`tension`, answers: E1).
   - *Expected Result*: E1 remains in the graph with state `disputed`. An active evidence traversal from B excludes A. (Defends Invariants 1, 14, and 20).

5. **competing current harvests**:
   - *Inputs*: Node A (`source`), Node B (`harvest`, compresses: A, assertedBy: X), Node C (`harvest`, compresses: A, assertedBy: Y).
   - *Expected Result*: Both B and C are accepted atomically with their edges. A query for "current harvests of A" returns both deterministic records sorted by cryptographic ID, without forcing consensus (Defends Invariant 3).

6. **cycle and cross-scope rejection**:
   - *Inputs (Cycle)*: Edge E1 (`derived_from`, A -> B), Edge E2 (`derived_from`, B -> C). Request to admit Edge E3 (`derived_from`, C -> A).
   - *Inputs (Cross-scope)*: Node A (disclosure: private), Node B (disclosure: public), Edge E4 (`derived_from`, B -> A, disclosure: public).
   - *Expected Result*: E3 admission is deterministically rejected (Cycle check fails). E4 admission is rejected (Edge disclosure 'public' exceeds target node A's 'private' constraint) (Defends Invariants 2, 8, and 9).

## Change rule

Changing an invariant requires:

- a written rationale
- an adversarial example
- a migration consequence
- updated canonical fixtures
- an explicit version boundary
