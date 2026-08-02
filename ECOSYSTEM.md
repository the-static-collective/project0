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
- **Edge Envelope and Traversal**: TranchNode uses a sequential accepted-event model. Project 0 follows this by admitting edges separately from nodes. However, TranchNode v0.1 has a highly constrained native edge schema (`id`, `kind`, `fromId`, `toId`, `scopeId`, `authorId`, `createdAt`), exactly 9 `EdgeKind` values, node-only endpoints, strict dispute/supersede operations, and an absolute prohibition on cross-scope edges. Adapters to TranchNode v0.1 MUST classify and translate the Project 0 envelope as follows:
  - **Lossless direct mappings**:
    - Project 0 `id` → TranchNode `id`
    - Project 0 `from` (Node) → TranchNode `fromId`
    - Project 0 `to` (Node) → TranchNode `toId`
    - Project 0 `scopeId` → TranchNode `scopeId`
    - Project 0 `assertedBy` → TranchNode `authorId`
    - Project 0 `createdAt` → TranchNode `createdAt`
  - **Lossless operation translation**:
    - Project 0 `answers` (targeting an edge) → TranchNode `dispute_edge` operation
    - Project 0 `supersedes` → TranchNode `supersede_edge` operation
  - **Lossy mappings**:
    - Project 0 `type` (20 types) → TranchNode `kind` (must be lossily mapped into the nearest of TranchNode's 9 `EdgeKind` values; true semantic type must be archived elsewhere).
  - **Unavailable (Unrepresentable semantics)**:
    - Project 0 `basis` and `disclosure` fields have no native fields in TranchNode v0.1.
    - Project 0 **cross-scope edges** are absolutely prohibited by TranchNode v0.1 and cannot be admitted.
    - Project 0 **edge-to-edge** endpoints (other than `answers` or `supersedes` operations) cannot be represented.
  *(Note: An adapter must NOT claim to preserve Project 0 semantics that TranchNode v0.1 cannot represent, such as cross-scope relations. Doing so silently breaks the invariants).*

## Canonical versus local

Project 0 defines canonical semantics. Each product may maintain local projections optimized for its purpose. A local projection is disposable only when the canonical meaning and necessary relationships remain recoverable.
