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
- **Edge Envelope and Traversal**: TranchNode uses a sequential accepted-event model. Project 0 follows this by admitting edges separately from nodes. However, TranchNode v0.1 has a highly constrained native edge schema (`id`, `kind`, `fromId`, `toId`, `scopeId`, `authorId`, `createdAt`), exactly 9 `EdgeKind` values, node-only endpoints, strict dispute/supersede operations, and an absolute prohibition on cross-scope edges. Adapters to TranchNode v0.1 MUST map Project 0 edges according to this exact table per tuple:

| Project 0 Edge Tuple (Type, From, To) | TranchNode Mapping Category | Result Notes |
|---|---|---|
| **Unavailable / Structural Mismatches** | | |
| ANY `(Type, From, To)` where `scopeId` differs | **Unavailable** | TranchNode v0.1 explicitly prohibits cross-scope edges. |
| ANY `(Type, From, edge)` (e.g., `(answers, tension, edge)`) | **Lossy operation translation** | TranchNode v0.1 has no edge-to-edge linking. `answers` targeting an edge maps to the `dispute_edge` operation, but loses the `basis`/`reasonNodeId`. `supersedes` targeting an edge maps to `supersede_edge`. |
| Envelope fields `basis` & `disclosure` | **Unavailable** | Dropped; no native fields exist in TranchNode v0.1 schema. |
| **Derivation Family** | | |
| `(derived_from, inference, source/observation/inference/claim/rejection)` | **Lossy direct native edge** | Envelope maps directly (`id`->`id`, `assertedBy`->`authorId`, etc). Project 0 type `derived_from` is downcast to a native TranchNode `EdgeKind`. |
| `(derived_from, harvest, source/observation/inference/claim/rejection)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(derived_from, claim, source/inference/claim/rejection)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(quotes, source/observation/claim, source)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(quotes, claim, claim/proposal)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(compresses, harvest, source/observation/claim/inference)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(revises, KIND, KIND)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(depends_on, inference/proposal/claim, claim/inference/source)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| **Epistemic Family** | | |
| `(supports, inference/claim/observation, claim/proposal/inference)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(contradicts, rejection/claim/inference, claim/inference)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(qualifies, inference/claim, claim/proposal/inference)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(observes, witness, ANY_NODE)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| **Dialogic Family** | | |
| `(answers, claim/observation/tension, tension/proposal)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(asks, proposal/tension, ANY_NODE)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(rebuttal_to, rejection, claim/proposal/inference)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(responds_to, rejection/claim, proposal/claim)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(continues, proposal/tension, proposal/tension)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| **Authority & Temporal Families** | | |
| `(delegates, claim/source, claim)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(consumes, source/inference, claim/source)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(revokes, claim/source, claim)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(permits_disclosure, claim, ANY_NODE)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(precedes, ANY_NODE, ANY_NODE)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(overlaps, ANY_NODE, ANY_NODE)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |
| `(supersedes, KIND, KIND)` | **Lossy direct native edge** | Downcast to native `EdgeKind`. |

*(Note: An adapter must NOT claim to preserve Project 0 semantics that TranchNode v0.1 cannot represent. Silently archiving a cross-scope edge in a local database while failing to evaluate it in the TranchNode graph breaks the invariant).*

## Canonical versus local

Project 0 defines canonical semantics. Each product may maintain local projections optimized for its purpose. A local projection is disposable only when the canonical meaning and necessary relationships remain recoverable.
