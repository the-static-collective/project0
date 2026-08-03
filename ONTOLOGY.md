# Ontology

The ontology is deliberately small. Kinds describe a node's epistemic role, not its file format or screen appearance.

## Node kinds

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

## Extension rule

New node kinds require a demonstrated semantic distinction that cannot be represented by an existing kind plus typed relationships. Product-specific states should normally remain downstream.
