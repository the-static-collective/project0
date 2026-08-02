# Resonant Tension

## Status

Integration proposal for Project 0. This document does not alter the frozen nine-kind ontology.

## Principle

A living tension is not merely stored as conflict. Within declared scope and bounded authority, it may be evaluated for configurations that increase coherence and generative capacity while preserving attributable difference and irreducible dissent.

In compact form:

> Tension supplies pressure. Evaluation searches for lawful harmonics. Humans retain authority over adoption. Receipts preserve what was tried and what remained.

## Resonance is not consensus

Resonance does not mean agreement, compromise, averaging, cancellation, closure, or proof that either participant was correct. It is a measurable improvement in relationship among preserved participants.

A resonance candidate may:

- expose genuinely shared constraints or purposes;
- distinguish claims that appeared incompatible only because their scopes or terms were conflated;
- discover complementary functions;
- reveal a third configuration supported by the original tension;
- identify productive dissonance that should remain unresolved.

A resonance evaluation must not:

- delete, overwrite, or silently weaken a tension;
- erase provenance, authorship, disclosure, or dissent;
- manufacture authority or consent;
- bridge scopes without an independently valid basis;
- treat evaluator confidence as evidence;
- require the adoption of its proposal.

## Viability bands

Living systems usually operate within bounded ranges rather than at a single maximized value. Too little tension may yield dormancy or loss of signal. Too much may yield distortion, coercion, or structural failure. Productive tension exists within a context-dependent viability band.

Project 0 should therefore avoid a universal numeric resonance target. Implementations may evaluate domain-specific indicators, but those indicators must remain attributable, inspectable, and non-authoritative.

Possible operational states include:

- `unexamined`
- `active`
- `resonance_candidate`
- `resonant`
- `productive_dissonance`
- `exhausted`
- `unsafe`
- `scope_uncertain`

These are downstream evaluator dispositions or receipt values, not universal node kinds.

## Pure evaluator contract

A resonance evaluator reads an immutable graph snapshot and emits a proposal or receipt. It does not mutate canonical graph state.

```ts
interface ResonanceEvaluation {
  tensionId: NodeId;
  participantIds: NodeId[];

  preservedDifferences: DifferenceRef[];
  sharedConstraints: ConstraintRef[];
  compatiblePurposes: PurposeRef[];

  distortionReduced: boolean;
  informationLost: boolean;
  authorityExceeded: boolean;
  disclosureViolated: boolean;

  disposition:
    | "resonance_candidate"
    | "productive_dissonance"
    | "no_resonance_found"
    | "inadmissible";

  proposedRelationships: RelationshipProposal[];
  basis: NodeId[];
}
```

The evaluator searches for four classes of result:

1. **Shared ground** — facts, purposes, needs, or constraints genuinely held in common.
2. **Complementarity** — differences that perform distinct but mutually useful functions.
3. **Harmonics** — a pattern visible only through comparison or interaction.
4. **Irreducible dissonance** — conflict that must remain explicit rather than being erased.

## Adoption boundary

An evaluation result is a proposal. Adoption requires whatever human authority, covenant, disclosure, and scope rules govern the affected graph.

A system may automatically verify that a proposal is admissible. It may not automatically convert admissibility into authority.

## Relationship to Project 0

- `tension` remains the canonical meaning-bearing node kind for incompatibility or unresolved pressure.
- `active_tension` remains a retrieval lane over typed relationships.
- Resonance is expressed through evaluator output, receipts, and existing node kinds plus typed relationships.
- A successful resonance evaluation may produce an `inference`, `proposal`, or `harvest`, depending on its epistemic role.
- The original tension and all cited participants remain queryable.

## Relationship to TranchNode

TranchNode can host deterministic resonance evaluation and append-only receipts without granting the evaluator authority to mutate the graph. A future integration should define the exact receipt envelope and canonical fixtures while preserving Project 0's frozen ontology and TranchNode's authority boundaries.

## Candidate invariant

> **Resonance preserves difference.** Evaluation may discover more coherent relationships among participating nodes, but it must not erase attributable disagreement, provenance, disclosure boundaries, or unresolved remainder.

## Required adversarial fixtures

1. **No destructive resonance** — a resonance candidate may add a proposal or harvest, but the original tension and participants remain present and queryable.
2. **No manufactured authority** — a valid resonance evaluation cannot execute or adopt its own proposal without an independently valid authority path.
3. **No disclosure laundering** — a resonance result cannot reveal or bridge private material unless the existing cross-scope requirements are satisfied.
4. **Third configuration with preserved sources** — two competing claims may support a third proposal while both claims and their incompatibility remain attributable.
5. **Productive dissonance is valid** — the evaluator may conclude that preserving explicit unresolved conflict is the most coherent result.
6. **Determinism** — identical graph snapshots and evaluator inputs produce the same disposition and canonical receipt payload.

## Design pressure

The broader architectural pressure is:

> Living systems do not require forced equilibrium. They require the capacity to seek sustained resonance within viable bounds.

This remains a design principle, not a claim that every tension has a resonant resolution.