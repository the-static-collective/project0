# Minimal Resonance Motif

## Status

Experimental vertical slice. This document does not modify Project 0's frozen canonical node kinds or edge kinds.

A resonance motif is represented as an ordinary content-addressed artifact whose payload references existing nodes, edges, anchors, receipts, and declared roles. No new universal ontology kind is introduced.

## Core claim

The smallest particular-preserving unit is a **typed relational recurrence under tension**.

Artifacts record what existed. Provenance records what caused what. Anchors record what survived. A resonance motif records how a lineage characteristically survives becoming something else.

## Spiral, not overwrite

The semantic circuit returns to its source, but the append-only graph never rewrites the origin.

```text
S0
 -> transformation or rupture
 -> tension or attractor
 -> response
 -> anchor state
 -> recognition
 -> S1
```

`S1` cites `S0` and the recognition receipt. It is a successor source state, not a mutation of `S0`.

## Six semantic positions

1. **source particular** — the initial state or seed whose identity is being tested.
2. **transformation or rupture** — break, shift, loss, experiment, or reconfiguration.
3. **tension or attractor** — the declared need, purpose, strain, basin, or pulling force under which the branch moves.
4. **response** — the action, adjustment, generation, refusal, return, or output made under that tension.
5. **anchor state** — each relevant anchor is preserved, broken, or transfigured, with evidence.
6. **recognition** — a human or authorized Coordinator records whether the result belongs to the claimed lineage.

The characteristic movement between these positions carries identity. Shared nouns or close embeddings do not establish belonging.

## Open and closed motifs

A motif may be:

- `open` — one or more semantic positions are unresolved.
- `provisionally_closed` — all positions exist, but no authoritative recognition receipt has closed the identity claim.
- `recognized_closed` — recognition is `belongs` or `novel_but_continuous`.
- `rejected_closed` — recognition is `does_not_belong`.
- `abandoned` — the open circuit was intentionally left unresolved.

An open motif is a live tension field. Its missing positions are not merely absent data; they declare the closure the lineage is seeking.

## Rupture intent and recognition outcome

Intent and result are independent.

Rupture intent:

- `intentional_cut`
- `experimental_cut`
- `accidental_loss`
- `unknown`

Recognition outcome:

- `belongs`
- `does_not_belong`
- `uncertain`
- `novel_but_continuous`

An intentional rupture may fail to belong. An accidental loss may produce a novel but continuous branch.

## Motif and signature

```text
motif     = evidence-bearing relational history
signature = compressed candidate-retrieval aid
```

A signature may be a graph fingerprint, embedding, or other index. It MUST NOT become the authority for belonging. Recognition is supported by the inspectable motif structure and its receipts.

## Motifs are artifacts

A motif is itself an ArtifactEnvelope. This gives motifs lineage without adding an ontology kind:

```text
motif-v2 transfigured_from motif-v1
motif-candidate disputed_by recognition-receipt
motif-candidate recognized_by recognition-receipt
motif-branch abandoned_by decision-receipt
```

A motif may therefore be refined, disputed, transfigured, rejected, or superseded using ordinary append-only graph operations.

## First falsifiable claim

Structural-motif retrieval should preserve judged lineage identity better than semantic-neighbor retrieval after controlled rupture, even when semantic retrieval preserves more surface vocabulary.

The first experiment compares both retrieval regimes on:

- noun fidelity
- verb fidelity
- anchor-state fidelity
- human recognition disposition

Evidence for the thesis would include cases where semantic retrieval preserves vocabulary but receives `does_not_belong`, while structural retrieval changes nouns yet receives `novel_but_continuous`.

## Non-goals

This slice does not:

- create a universal `motif` node kind;
- permit source mutation;
- treat embeddings as authority;
- auto-heal declared intentional ruptures;
- claim that graph similarity establishes identity;
- add cross-scope semantics outside existing Project 0 law.
