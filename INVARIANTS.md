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
   - *Inputs*:
     - Node A (`id`: nA, `kind`: observation, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: inference, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: derived_from, `from`: nB, `to`: nA, `assertedBy`: modelX, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Node C (`id`: nC, `kind`: claim, `scopeId`: S1, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: derived_from, `from`: nC, `to`: nB, `assertedBy`: humanY, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
   - *Expected Result*: Nodes B and C remain inactive until E1 and E2 are admitted. Traversal amplifies C via B to A. A direct `derived_from` from C to A without B fails validation per the direction table (Defends Invariants 2 and 15).

2. **rejected proposal remains queryable**:
   - *Inputs*:
     - Node A (`id`: nA, `kind`: proposal, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: rejection, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: rebuttal_to, `from`: nB, `to`: nA, `assertedBy`: humanX, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Node C (`id`: nC, `kind`: inference, `scopeId`: S1, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: derived_from, `from`: nC, `to`: nB, `assertedBy`: modelY, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
   - *Expected Result*: Node C evaluates as valid and correctly decompresses the substantive grounds in B. (Defends Invariant 3).

3. **duplicate relationship assertions by different authors**:
   - *Inputs*:
     - Node A (`id`: nA, `kind`: claim, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: claim, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: supports, `from`: nA, `to`: nB, `assertedBy`: humanX, `createdAt`: t1, `scopeId`: pubScope, `basis`: null, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: supports, `from`: nA, `to`: nB, `assertedBy`: humanY, `createdAt`: t2, `scopeId`: privScope, `basis`: null, `disclosure`: private)
   - *Expected Result*: Graph admits both edges. E1 and E2 have distinct `id`s. Querying in `pubScope` returns E1. Querying in `privScope` returns E1 and E2. (Defends Invariant 4).

4. **disputed edge excluded from active evidence**:
   - *Inputs*:
     - Node A (`id`: nA, `kind`: inference, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: claim, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: supports, `from`: nA, `to`: nB, `assertedBy`: humanX, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Node C (`id`: nC, `kind`: tension, `scopeId`: S1, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: answers, `from`: nC, `to`: e1, `assertedBy`: humanY, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
   - *Expected Result*: E1 remains in the graph but its traversal polarity evaluates to `disputed`. Active evidence traversal from B strictly excludes A. (Defends Invariants 1, 14, and 20).

5. **competing current harvests**:
   - *Inputs*:
     - Node A (`id`: nA, `kind`: source, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: harvest, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: compresses, `from`: nB, `to`: nA, `assertedBy`: X, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Node C (`id`: nC, `kind`: harvest, `scopeId`: S1, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: compresses, `from`: nC, `to`: nA, `assertedBy`: Y, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
   - *Expected Result*: Both nodes and edges admit successfully. Both harvests remain current without forcing consensus, sorted deterministically by target `nA` then edge IDs `e1` and `e2`. (Defends Invariant 3).

6. **cycle and cross-scope rejection**:
   - *Inputs (Cycle)*:
     - Nodes A, B, C (`kind`: inference, `scopeId`: S1, `disclosure`: public).
     - Edge E1 (`id`: e1, `type`: derived_from, `from`: nB, `to`: nA, `assertedBy`: modelX, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: derived_from, `from`: nC, `to`: nB, `assertedBy`: modelX, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Request to admit Edge E3 (`id`: e3, `type`: derived_from, `from`: nA, `to`: nC, `assertedBy`: modelX, `createdAt`: t3, `scopeId`: S1, `basis`: null, `disclosure`: public).
   - *Inputs (Cross-scope)*:
     - Node X (`id`: nX, `kind`: claim, `scopeId`: privScope, `disclosure`: private)
     - Node Y (`id`: nY, `kind`: inference, `scopeId`: pubScope, `disclosure`: public)
     - Request to admit Edge E4 (`id`: e4, `type`: derived_from, `from`: nY, `to`: nX, `scopeId`: pubScope, `basis`: null).
   - *Expected Result*: E3 is deterministically rejected at admission (cycle). E4 is deterministically rejected at admission (crosses scopes without a valid bridging `basis`). (Defends Invariants 2, 8, and 9).

## Change rule

Changing an invariant requires:

- a written rationale
- an adversarial example
- a migration consequence
- updated canonical fixtures
- an explicit version boundary
