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

The following adversarial examples and fixtures ensure the edge laws and invariants cannot be silently bypassed:

1. **observation → inference → claim**: Demonstrates that an `observation` does not automatically become a human `claim` without an explicitly attributable intervening `inference` node carrying a `derived_from` edge. (Defends Invariants 2 and 15).
2. **rejected proposal remains queryable**: Proves that a `rejection` node functions as a substantive target, not merely an administrative receipt, allowing subsequent nodes to refer back to the *grounds* of the rejection. (Defends Invariant 3).
3. **duplicate relationship assertions by different authors**: Confirms that identical edges asserted by different authors are not silently collapsed; authorship and disclosure scopes remain distinct. (Defends Invariant 4).
4. **disputed edge excluded from active evidence**: Ensures that when an edge is disputed (e.g., using a dispute receipt or superseding edge), it is excluded from active evidence traversal without being deleted from the graph. (Defends Invariants 1, 14, and 20).
5. **competing current harvests**: Validates that plural, valid `harvest` nodes can exist concurrently over the same sources, without a deterministic engine forcing a single "canonical truth." (Defends Invariant 3).
6. **cycle and cross-scope rejection**: Tests that Derivation and Temporal edge families reject cyclic paths at admission, and that rejections spanning different disclosure scopes respect boundary preservation. (Defends Invariants 2, 8, and 9).

## Change rule

Changing an invariant requires:

- a written rationale
- an adversarial example
- a migration consequence
- updated canonical fixtures
- an explicit version boundary
