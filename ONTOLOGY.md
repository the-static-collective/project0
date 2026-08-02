# Ontology

The ontology is deliberately small. Kinds describe a node's epistemic role, not its file format or screen appearance.

## Node kinds

The Project 0 canonical set is explicitly frozen at exactly nine kinds.

| Kind | Meaning |
|---|---|
| `source` | An imported or directly produced artifact |
| `observation` | What an observer reports noticing |
| `claim` | A proposition asserted as potentially true |
| `proposal` | A suggested future action, design, or interpretation |
| `tension` | An incompatibility or unresolved pressure preserved for work |
| `rejection` | A proposal or claim declined with attributable grounds |
| `witness` | An attributable report that an event, state, or statement was observed |
| `harvest` | A useful synthesis derived from prior nodes without replacing them |
| `inference` | A computationally derived proposition or judgment |

## Required node envelope

Every canonical node has:

- `id`: stable content or record identifier
- `kind`: one node kind
- `body`: typed, meaning-bearing payload
- `createdAt`: recorded time
- `createdBy`: attributable actor identifier
- `provenance`: origin and derivation references
- `disclosure`: policy governing revelation and reuse
- `relationships`: typed edges to other nodes

Implementations may add fields. They may not remove the ability to recover these semantics.

## Relationship lanes

The initial retrieval lanes are:

- `semantic` — similar or mutually illuminating meaning
- `lineage` — derivation, revision, quotation, or transformation
- `active_tension` — unresolved conflict or pressure
- `human_link` — an explicitly governed human association
- `rejected_parallel` — a declined branch retained for comparison

Lanes are retrieval views over typed relationships, not competing copies of the graph.

## Epistemic distinctions

- A source is not automatically evidence.
- An observation is not automatically a claim.
- A claim is not automatically true.
- Confidence is not authority.
- Retrieval is not endorsement.
- A witness attests to observation, not necessarily to the truth of the observed content.
- A harvest is derived and must cite what it compresses.
- Node kinds (like `rejection`) represent substantive, meaning-bearing, attributable records. They are distinct from administrative states (like `withheld` or `disputed`) and distinct from administrative receipts (like `DispositionReceipt`).
- `inference` is a distinct epistemic role from a human claim or a harvest, added to satisfy TranchNode's frozen evaluation requirements.

## Tensions and TranchNode Compatibility
- Project 0 explicitly treats `rejection` as a meaning-bearing node kind so that it can be targeted by relationships and debated.
- TranchNode v0.1 does not treat `rejection` as a node kind, instead treating it purely as an evaluation state.
- **Mismatch**: Project 0's `rejection` node has no lossless representation in TranchNode v0.1. Resolving this will require either a TranchNode v0.2 extension or an explicitly lossy adapter. See `ECOSYSTEM.md` for the compatibility mapping.

## Extension rule

New node kinds require a demonstrated semantic distinction that cannot be represented by an existing kind plus typed relationships. Product-specific states should normally remain downstream.
