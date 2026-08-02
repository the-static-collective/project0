# Ecosystem Map

Project 0 prevents shared concepts from drifting while preserving project identity.

| Project | Role | Relationship to Project 0 |
|---|---|---|
| TranchNode | Meaning and continuity substrate | Implements storage, lineage, retrieval lanes, and conformance |
| Full Measure World Layer | D&D-like gamified life/world layer | Consumes shared identity, receipts, quests/actions, witnesses, and lineage |
| NanaSpork | Field instrument | Captures seeds and media while preserving local-held drafts and disclosure |
| BananaGram | Participatory gift/need network | Uses bounded disclosure, authority, fulfillment, and witness semantics |
| Haunted Toaster | Local-first video receipt maker | Produces media artifacts and timing/edit lineage; does not become the world layer |
| Autodiscography tools | Creative production and archive | Emit sources, transformations, relationships, and releases |
| Project 0 | Shared contract | Defines portable semantics and fixtures; owns no product experience |

## The Full Measure naming boundary

**Full Measure World Layer** is the gamified life layer and inherent Dungeon Master system.

The haunted-toaster/video-receipt lineage is a separate media tool. It must not use `Full Measure` as its unqualified repository, package, or protocol name.

## Dependency direction

Downstream products depend on a versioned Project 0 contract. Project 0 may cite downstream projects as test cases, but it must not import their UI, database, or product-specific workflow.

## Integration rule

A product integration should declare:

- Project 0 contract version
- implemented invariants
- extensions and namespaces
- known deviations
- import/export mapping
- conformance fixture results

## TranchNode v0.1 compatibility

The executable classification is [`contract/edge-law.v0.1.json`](contract/edge-law.v0.1.json). It expands every valid Project 0 tuple and assigns exactly one TranchNode v0.1 outcome:

- `direct`: the same named TranchNode `EdgeKind`;
- `renamed`: a named relation with demonstrably equivalent semantics;
- `operation`: one accepted-operation translation with every required field bound;
- `lossy`: one named destination plus an explicit statement of what is lost;
- `unavailable`: no honest v0.1 representation.

The adapter contract has four global boundaries:

1. Every cross-scope Project 0 edge is unavailable to TranchNode v0.1. Deliberately revealed material becomes a new destination-scope `source`; the cross-scope edge itself is not smuggled into the graph.
2. Every tuple containing Project 0 `rejection` is unavailable because TranchNode v0.1 has no `rejection` node kind.
3. Node-to-node relations may map only to TranchNode's nine actual `EdgeKind` values: `derived_from`, `supports`, `contradicts`, `qualifies`, `depends_on`, `supersedes`, `responds_to`, `witnesses`, and `harvests`.
4. Edge endpoints are unavailable except for the two explicit accepted-operation translations below.

| Project 0 tuple | TranchNode operation | Required bindings |
|---|---|---|
| `(answers, tension, edge)` | `dispute_edge` | `edgeId=edge.to`, `tensionId=edge.from`; both objects must exist in the same scope |
| `(supersedes, edge, edge)` | `supersede_edge` | `edgeId=edge.to`, `replacementEdgeId=edge.from`, `reasonNodeId=edge.basis`; all three objects must exist in the same scope and `basis` must resolve to a node |

No adapter may invent a “nearest” edge kind. If it cannot name the destination and the exact semantic loss, the tuple is unavailable. The JSON matrix is exhaustive and is checked in CI against the canonical tuple set and TranchNode's frozen vocabulary.

## Canonical versus local

Project 0 defines canonical semantics. Each product may maintain local projections optimized for its purpose. A local projection is disposable only when the canonical meaning and necessary relationships remain recoverable.

