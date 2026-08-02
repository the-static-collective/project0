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

## Candidate invariant for the next version boundary

21. **Resonance preserves difference** — Evaluation may discover more coherent relationships among participating nodes, but it must not erase attributable disagreement, provenance, disclosure boundaries, or unresolved remainder. A resonance result is a proposal or receipt, not authority to mutate or adopt.

This invariant remains explicitly provisional until its fixtures, receipt envelope, migration consequence, and version boundary are implemented. See `docs/resonant-tension.md`.

## Adversarial Examples & Required Fixtures

The following deterministic adversarial examples and fixtures ensure the edge laws and invariants cannot be silently bypassed. Expected evaluation results are strict.

1. **observation → inference → claim**:
   - *Inputs*:
     - Node A (`id`: nA, `kind`: observation, `scopeId`: S1, `disclosure`: public)
     - Node B (`id`: nB, `kind`: inference, `scopeId`: S1, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: derived_from, `from`: nB, `to`: nA, `assertedBy`: modelX, `createdAt`: t1, `scopeId`: S1, `basis`: null, `disclosure`: public)
     - Node C (`id`: nC, `kind`: claim, `scopeId`: S1, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: derived_from, `from`: nC, `to`: nB, `assertedBy`: humanY, `createdAt`: t2, `scopeId`: S1, `basis`: null, `disclosure`: public)
   - *Expected Result*: Node B remains inactive pending E1. Node C evaluates successfully upon admission; it does not remain inactive simply because it is a claim. Traversal correctly amplifies C via B to A. A direct `derived_from` from C to A without B fails validation per the tuple table (Defends Invariants 2 and 15).

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
     - Node A (`id`: nA, `kind`: claim, `scopeId`: pubScope, `disclosure`: public)
     - Node B (`id`: nB, `kind`: claim, `scopeId`: pubScope, `disclosure`: public)
     - Edge E1 (`id`: e1, `type`: supports, `from`: nA, `to`: nB, `assertedBy`: humanX, `createdAt`: t1, `scopeId`: pubScope, `basis`: null, `disclosure`: public)
     - Edge E2 (`id`: e2, `type`: supports, `from`: nA, `to`: nB, `assertedBy`: humanY, `createdAt`: t2, `scopeId`: pubScope, `basis`: null, `disclosure`: private)
     - *Query inputs*: Query Q1 (policy scope: `public`), Query Q2 (policy scope: `private`, authorized actor: `humanY`).
   - *Expected Result*: Graph admits both edges sequentially. E1 and E2 have distinct `id`s. Because both edges belong to `pubScope`, they do not require a cross-scope bridge. Query Q1 returns E1. Query Q2 returns E1 and E2. They do not silently collapse (Defends Invariant 4).

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
   - *Inputs (Cross-scope rejection)*:
     - Node X (`id`: nX, `kind`: claim, `scopeId`: privScope, `disclosure`: private)
     - Node Y (`id`: nY, `kind`: inference, `scopeId`: pubScope, `disclosure`: public)
     - Request to admit Edge E4 (`id`: e4, `type`: derived_from, `from`: nY, `to`: nX, `assertedBy`: humanX, `createdAt`: t4, `scopeId`: pubScope, `basis`: null, `disclosure`: public).
   - *Expected Result*: E3 is deterministically rejected at admission (cycle). E4 is deterministically rejected at admission (crosses scopes without a valid bridging `basis` resolving to a `RevelationReceipt`). (Defends Invariants 2, 8, and 9).

7. **positive cross-scope bridge**:
   - *Inputs*:
     - Node X (`id`: nX, `kind`: source, `scopeId`: privScope, `disclosure`: private)
     - Node Y (`id`: nY, `kind`: inference, `scopeId`: pubScope, `disclosure`: public)
     - Request Req1 (`id`: req1, `purpose`: 'explicitly_declared_audit_request', `scopeId`: pubScope) *(Independently declared request)*
     - Receipt Lease1 (`receiptId`: lease1, `receiptType`: LeaseGrant, `issuedAt`: t0, `issuer`: admin, `subject`: privScope, `inputs`: {}, `outputs`: { `recipient`: humanX, `capability`: cross_scope_read, `scopeId`: privScope, `logicalExpiry`: futureDate, `invocationsRemaining`: 10 }, `authorityRef`: null, `policyRefs`: [private], `previousReceiptRefs`: [], `canonicalHash`: hashL1)
     - Receipt R1 (`receiptId`: r1, `receiptType`: RevelationReceipt, `issuedAt`: t1, `issuer`: humanX, `subject`: e1, `inputs`: { `sourceScopeId`: privScope }, `outputs`: { `destinationScopeId`: pubScope, `purpose`: 'explicitly_declared_audit_request' }, `authorityRef`: lease1, `policyRefs`: [public], `previousReceiptRefs`: [], `canonicalHash`: hashR1)
     - Edge E1 (`id`: e1, `type`: derived_from, `from`: nY, `to`: nX, `assertedBy`: humanX, `createdAt`: t1, `scopeId`: pubScope, `basis`: r1, `disclosure`: public).
   - *Expected Result*: E1 is admitted. Traversal of E1 explicitly guards and resolves the `basis` ID via `getReceipt(r1)` and successfully evaluates `isCrossScopeBridged(E1)` to true (since `derived_from` pulls information from `nX` in `privScope` to `nY` in `pubScope`). This binds the exact `RECEIPTS.md` envelope, explicitly validates the receipt `purpose` against the independently declared `Req1`, and safely bridges bounds without silent exposure (Defends Invariant 9).

## Proposed resonance fixtures for the next version boundary

These fixtures are normative design requirements but are not yet part of the current frozen fixture set.

8. **resonance preserves source tension**:
   - *Inputs*: two attributable claims, one `tension` node linking their incompatibility, and a pure resonance evaluation producing a third `proposal` or `harvest`.
   - *Expected Result*: the proposal may be admitted when ordinary edge law permits it; both original claims and the tension remain queryable and unchanged. No evaluator output marks them resolved by deletion or replacement. (Defends Invariants 1, 3, 16, and proposed 21.)

9. **resonance cannot manufacture authority or disclosure**:
   - *Inputs*: a valid resonance candidate whose adoption would execute a capability or reveal material across scopes, but with no valid authority lease or revelation basis.
   - *Expected Result*: the evaluation receipt remains admissible as a proposal, while execution and cross-scope traversal fail deterministically. (Defends Invariants 6–10, 16, and proposed 21.)

10. **productive dissonance is a valid result**:
   - *Inputs*: an active tension whose participants retain incompatible purposes after all shared constraints are evaluated.
   - *Expected Result*: the deterministic disposition is `productive_dissonance`; no synthetic compromise is generated, and the unresolved remainder is explicit and attributable. (Defends Invariants 3, 11, 20, and proposed 21.)

## Change rule

Changing an invariant requires:

- a written rationale
- an adversarial example
- a migration consequence
- updated canonical fixtures
- an explicit version boundary
