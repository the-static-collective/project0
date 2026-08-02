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

## TranchNode Compatibility Mapping

TranchNode provides the meaning and continuity substrate, but its v0.1 evaluation contract is frozen and misaligned with Project 0 in specific ways. Implementers building adapters to TranchNode v0.1 must apply the following compatibility mapping:

- **`inference` node**: Added to Project 0 explicitly to meet TranchNode's frozen requirement for a computationally derived node. This maps perfectly.
- **`rejection` node**: Project 0 requires `rejection` to be a substantive, targetable node kind. TranchNode v0.1 does not represent rejection as a state, a receipt, or a node; it has no v0.1 representation at all.
  - **The Mismatch**: Project 0's `rejection` node has no representation in TranchNode v0.1.
  - **Resolution**: Resolving this requires either a future TranchNode v0.2 extension (to adopt `rejection` as a node) or an explicitly lossy adapter. Until then, this remains an explicit tension.
- **Edge Envelope and Traversal**: TranchNode uses a sequential accepted-event model. Project 0 follows this by admitting edges separately from nodes. However, TranchNode v0.1 has a highly constrained native edge schema (`id`, `kind`, `fromId`, `toId`, `scopeId`, `authorId`, `createdAt`), exactly 9 `EdgeKind` values (`derived_from`, `supports`, `contradicts`, `qualifies`, `depends_on`, `supersedes`, `responds_to`, `witnesses`, `harvests`), node-only endpoints, strict dispute/supersede operations, and an absolute prohibition on cross-scope edges. Adapters to TranchNode v0.1 MUST classify valid Project 0 tuples exactly as follows:

| Project 0 Edge Tuple (Type, From, To) | TranchNode Mapping Category | Translation Target |
|---|---|---|
| **Unavailable / Structural Mismatches** | | |
| ANY tuple containing a `rejection` endpoint | **Unavailable** | Cannot be admitted. |
| ANY cross-scope tuple | **Unavailable** | Cannot be admitted. |
| ANY tuple mapping `(Type, From, edge)` | **Unavailable** | Cannot be admitted (unless covered by explicit operation below). |
| Envelope fields `basis` & `disclosure` | **Unavailable** | Dropped; no native fields exist. |
| **Direct Same-Name Native Edge** | | |
| `(derived_from, inference/harvest/claim, source/inference/claim)` | **Direct same-name native edge** | `derived_from` |
| `(depends_on, inference/proposal/claim, claim/inference/source)` | **Direct same-name native edge** | `depends_on` |
| `(supports, inference/claim/observation, claim/proposal/inference)` | **Direct same-name native edge** | `supports` |
| `(contradicts, claim/inference, claim/inference)` | **Direct same-name native edge** | `contradicts` |
| `(qualifies, inference/claim, claim/proposal/inference)` | **Direct same-name native edge** | `qualifies` |
| `(responds_to, claim, proposal/claim)` | **Direct same-name native edge** | `responds_to` |
| `(supersedes, KIND, KIND)` *(except `source`)* | **Direct same-name native edge** | `supersedes` |
| **Explicit Renamed Translation** | | |
| `(observes, witness, ANY_NODE)` | **Explicit renamed translation** | `witnesses` (Semantics demonstrably equivalent) |
| `(compresses, harvest, source/observation/claim/inference)` | **Explicit renamed translation** | `harvests` (Semantics demonstrably equivalent) |
| **Conditional Operation Translations** | | |
| `(answers, tension, edge)` | **Operation translation** | `dispute_edge(edgeId=edge.to, tensionId=edge.from)`. Requires same-scope `tensionId`. |
| `(supersedes, edge, edge)` | **Operation translation** | `supersede_edge(edgeId=edge.to, replacementEdgeId=edge.from, reasonNodeId=edge.basis)`. Requires `reasonNodeId` to resolve to an existing same-scope node (arbitrary receipt/rule basis invalid). |
| **Lossy Mappings** | | |
| `(quotes, source/observation/claim, source/claim/proposal)` | **Lossy** | Must downcast into nearest `EdgeKind`. |
| `(revises, KIND, KIND)` | **Lossy** | Must downcast into nearest `EdgeKind`. |
| `(answers, claim/observation/tension, tension/proposal)` | **Lossy** | Must downcast into nearest `EdgeKind`. |
| `(asks, proposal/tension, ANY_NODE)` | **Lossy** | Must downcast into nearest `EdgeKind`. |
| `(continues, proposal/tension, proposal/tension)` | **Lossy** | Must downcast into nearest `EdgeKind`. |
| `(rebuttal_to, rejection, claim/proposal/inference)` | **Unavailable** | Excluded due to rejection endpoint. |
| **Administrative/Temporal Families (Unavailable)** | | |
| `delegates`, `consumes`, `revokes`, `permits_disclosure` | **Unavailable** | No honest native capability schema exists. |
| `precedes`, `overlaps` | **Unavailable** | No honest native timing schema exists. |

*(Note: An adapter must NOT claim to preserve Project 0 semantics that TranchNode v0.1 cannot represent. Silently archiving a cross-scope edge in a local database while failing to evaluate it in the TranchNode graph breaks the invariant).*

## Canonical versus local

Project 0 defines canonical semantics. Each product may maintain local projections optimized for its purpose. A local projection is disposable only when the canonical meaning and necessary relationships remain recoverable.
