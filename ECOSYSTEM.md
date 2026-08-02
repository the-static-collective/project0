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
- **`rejection` node**: Project 0 requires `rejection` to be a substantive, targetable node kind. TranchNode v0.1 only recognizes rejection as an administrative state or receipt.
  - **The Mismatch**: Project 0's `rejection` node has no lossless representation in TranchNode v0.1.
  - **Resolution**: Resolving this requires either a future TranchNode v0.2 extension (to adopt `rejection` as a node) or an explicitly lossy adapter (which downcasts the Project 0 node into a TranchNode state while archiving the meaning). Until then, this remains an explicit tension.

## Canonical versus local

Project 0 defines canonical semantics. Each product may maintain local projections optimized for its purpose. A local projection is disposable only when the canonical meaning and necessary relationships remain recoverable.
