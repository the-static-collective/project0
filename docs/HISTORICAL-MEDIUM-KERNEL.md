# Historical Medium Kernel

This slice freezes the semantic center for accountable continuity without expanding the Project 0 ontology.

## Distinctions

The kernel keeps five questions independent:

1. what exists;
2. what happened;
3. what was authorized;
4. what may happen now;
5. what someone judges the history to mean.

## Three clocks

- **Valid time**: when a fact was effective in the modeled world.
- **Transaction time**: when the system recorded or learned the fact.
- **Evaluation time**: when a present use, disclosure request, or question is judged.

Validity is evaluated at the time of the act. Admissibility is evaluated at the time of the proposed use. Judgment is evaluated relative to an addressed question and bounded trail.

## Address classes

- `ContentAddress`: bytes only.
- `ArtifactAddress`: a particular interaction residue under a constitutive envelope.
- `TrailAddress`: a bounded immutable graph slice.
- `ViewAddress`: a mutable projection pointer to an immutable trail.
- `QuestionAddress`: a separately branded artifact address used only as the referent of discernment.

## Conservation checks

Every admitted consequential operation evaluates:

- referent;
- history;
- address-class distinction;
- authority;
- question;
- unresolvedness;
- privacy;
- particularity.

Checks return `pass`, `fail`, or `indeterminate`. Operation-specific policy decides whether indeterminacy blocks admission.

## Kernel operations

- `createArtifact`
- `deriveArtifact`
- `issueDiscernmentReceipt`
- `resolveArtifact`

Operations append only. Rejections, revocations, challenges, and supersessions remain historical residue.

## Canonical fixture

The executable fixture models:

`Q1 → P1 → A1 → X1 → X2 → R1 → D1 → D2`

with:

- `R1.effectiveAt = T2`
- `R1.observedAt = T5`

It verifies that an act may remain historically authorized while the holder is presently revoked, that private bytes may remain undisclosed while existence stays returnable, and that later discernment may supersede without erasing earlier judgment.

## Explicit exclusions

Slice one does not include distributed ledgers, zero-knowledge disclosure, public resolvers, deep delegation chains, or richer fulfillment semantics.
