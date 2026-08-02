# Evaluation

Evaluators read canonical graph state and emit deterministic judgments, proposals, or receipts. They do not silently mutate meaning-bearing nodes or grant themselves authority.

## Resonance evaluation

Resonance evaluation is an optional pure pass over an existing `tension` node and its attributable participants.

Its purpose is to search for a configuration that increases coherence or generative capacity while preserving material difference, provenance, disclosure, and unresolved remainder.

See `docs/resonant-tension.md` for the governing principle and constraints.

### Inputs

A resonance evaluator receives:

- an immutable graph snapshot or content-addressed snapshot reference;
- one canonical `tension` node;
- the explicit participant nodes and relationships included in the evaluation;
- an independently declared purpose;
- evaluator identity and version;
- applicable disclosure and policy context;
- optional domain-specific viability indicators.

The evaluator must reject ambiguous or missing participant references rather than infer authority or scope.

### Output dispositions

```ts
type ResonanceDisposition =
  | "resonance_candidate"
  | "productive_dissonance"
  | "no_resonance_found"
  | "inadmissible";
```

- `resonance_candidate` — a bounded proposal exists that preserves the participating records and constraints.
- `productive_dissonance` — continued explicit tension is more coherent than a synthetic resolution.
- `no_resonance_found` — no supported candidate was found under the declared evaluator and inputs.
- `inadmissible` — evaluation cannot lawfully or deterministically proceed because required scope, disclosure, provenance, or input constraints are not satisfied.

### Result envelope

```ts
interface ResonanceEvaluation {
  tensionId: NodeId;
  participantIds: NodeId[];
  purposeId: string;
  evaluatorId: string;
  evaluatorVersion: string;
  graphSnapshotHash: string;

  preservedDifferences: DifferenceRef[];
  sharedConstraints: ConstraintRef[];
  compatiblePurposes: PurposeRef[];
  unresolvedRemainder: DifferenceRef[];

  distortionReduced: boolean;
  informationLost: boolean;
  authorityExceeded: boolean;
  disclosureViolated: boolean;

  disposition: ResonanceDisposition;
  proposedRelationships: RelationshipProposal[];
  basis: NodeId[];
}
```

The exact serializable receipt envelope remains a versioned integration task. Any implementation must use the repository's canonical serialization and hashing rules rather than introducing a competing scheme.

### Determinism requirements

Given identical canonical inputs, evaluator identity, evaluator version, and policy context, evaluation must produce an identical canonical result payload.

A model may generate candidate interpretations during evaluation, but the admitted result must be reducible to explicit inputs, attributable basis references, and deterministic verification rules. Model confidence is not evidence.

### Non-mutation rule

The evaluator may propose existing edge types or propose creation of an `inference`, `proposal`, or `harvest` node according to its epistemic role. It cannot directly add, delete, supersede, resolve, or mutate graph records.

Ordinary admission, authority, disclosure, and receipt rules govern any later adoption.

### Viability indicators

Implementations may accept domain-specific measurements describing whether a tension appears dormant, productive, overstressed, unsafe, or scope-uncertain. No universal ratio or threshold is canonical.

Every indicator must identify:

- its domain and unit;
- measurement or derivation method;
- evaluator or witness;
- applicable range and uncertainty;
- why it is relevant to the declared purpose.

Indicators inform evaluation; they do not determine truth or authority.

### Required failure behavior

The evaluator returns `inadmissible` when:

- the referenced tension or participant does not exist;
- a participant is unavailable under the active disclosure policy;
- evaluating the requested material would require an invalid cross-scope bridge;
- the declared purpose is absent or does not match the governing request;
- canonical snapshot identity cannot be verified;
- evaluator identity or version is missing;
- the output would require a new universal node kind or edge meaning.

### Adoption boundary

A resonance result remains observational or propositional until separately admitted and adopted. The evaluator cannot manufacture capability, consent, disclosure permission, settlement, or canonical status.
