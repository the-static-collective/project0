# Continuity Witness v0 — Shared Questions, Local Answers

**Status:** proposed Project 0 extension profile design

**Issue:** #8 — Define continuity profile: decoder context, residuals, root closure, and non-impersonation

## Problem

The ecosystem now has several materially different systems answering variants of the same question:

> What survived a change, what did not, and what justifies treating the result as a continuation rather than an impersonation or unrelated replacement?

The shared pressure is real, but the answers are domain-specific. A Toaster candidate lineage, a TranchNode boundary tranch, a Corpus OS WorldCut, and a jublEchat current idea do not have the same continuity conditions.

Project 0 therefore must not create a global Continuity service, database, event bus, identity provider, or universal current-state object.

The useful shared object is narrower: a **portable continuity claim profile** that lets a domain make an inspectable, falsifiable claim about continuity while keeping authority and domain truth local.

## Governing laws

1. **Continuity is a claim about relationship across change, not a claim of sameness.**
2. **Continuity is purpose-relative.** Historical reconstruction, executable replay, semantic persistence, stewardship succession, and creative ancestry may require different invariants.
3. **A continuity witness is evidence, not authority.** Copying, serializing, transporting, or retrieving it grants no capability, warrant, authorship, stewardship, or execution right.
4. **Loss is first-class evidence.** A lawful claim states what was preserved, transformed, lost, unresolved, or unavailable; it does not report only the successful transfer.
5. **Environment is part of decompression.** Decoder/runtime/policy identity is explicit when it materially affects reconstruction.
6. **Root closure is mandatory for material ancestry.** A derived claim cannot silently drop a material source root or invent one.
7. **Plural lawful continuations are permitted.** Valid lineage does not force one canonical realization.
8. **Reconstruction is not occurrence.** A later reconstruction may be useful without becoming the historical event it reconstructs.
9. **Authority transfer is a separate question.** Continuity of corpus, memory, code, or behavior does not imply continuity of authority.
10. **Local systems remain sovereign over admission.** Project 0 supplies portable semantics and conformance fixtures; downstream projects decide whether a witness matters in their domain.

## Profile shape

The first profile should remain an experimental extension above the frozen nine-kind ontology and existing receipt union.

Conceptually:

```ts
interface ContinuityClaimV0 {
  schema: "p0.continuity/0.1";
  purpose: string;
  subjectRef: string;
  ancestorRoots: string[];
  transformationRefs: string[];
  environment: {
    decoderRef?: string;
    runtimeRef?: string;
    policyRefs: string[];
    contextRefs: string[];
  };
  preserved: ContinuityDimension[];
  transformed: ContinuityDimension[];
  lost: ContinuityDimension[];
  unresolved: ContinuityDimension[];
  residualRefs: string[];
  outputRefs: string[];
  parentContinuityRefs: string[];
  authorityContinuity: "none" | "separately-evidenced" | "unresolved";
  uncertainty: string[];
}
```

`ContinuityDimension` should be a small downstream-declared record, not a new global taxonomy. Project 0 validates attribution, closure, contradictions, and representation; it does not decide whether `typography cadence`, `stewardship purpose`, `behavioral tolerance`, or another domain dimension is semantically important.

## Required distinction: witness != warrant

A continuity claim may say:

```text
B descends from A under purpose P
```

It may not thereby say:

```text
B may exercise A's authority
```

Any authority continuity must point to separately valid authority evidence under the receiving domain's law. `authorityContinuity: "separately-evidenced"` is only a declaration that such evidence is expected; the continuity profile itself never validates or mints that authority.

## Two portable read-model questions

The profile should make it possible for products to derive, locally:

### Why Current?

What attributable path explains why this projection/form is present now?

A valid answer must use exact refs and admitted lineage, not semantic similarity, timestamps alone, or generated narrative.

### Still Alive?

Which declared invariants, tensions, residuals, obligations, or unresolved dimensions remain active in the current continuation?

A valid answer may return uncertainty or plurality. It must not invent resolution merely to produce a clean story.

These are shared **questions**, not one shared UI or service.

## Existing ecosystem specimens

The profile is extracted from already distinct local evidence rather than projected into a vacuum:

- **Project 0 #8** already names decoder context, residuals, root closure, plurality, and non-impersonation.
- **TranchNode #29** records `preserved`, `differentiated`, `lost`, source closure, refusal residue, and lawful descendant formation at a boundary.
- **jublEchat #7** defines fail-closed `Why Current?` and `Still Alive` read models over exact causal refs while explicitly refusing a universal contract from one product.
- **Haunted Toaster #151 / #147** preserve candidate genealogy, typed inheritance, influence-only history, replay, and exact source ancestry without moving genealogy into renderer authority.
- **Corpus OS #20 / #23** distinguish constituted present, causal history, prospective reachability, and authority consumption; they prove that currentness and possibility are not authority.

These specimens justify a Project 0 conformance profile. They do not justify shared runtime infrastructure.

## Validation boundary

Project 0 may mechanically validate:

- schema/version;
- exact declared roots and refs;
- duplicate or contradictory classification of the same dimension where forbidden by profile rules;
- required environment/policy declarations;
- parent continuity closure;
- explicit residual treatment;
- omission/invention of roots in canonical fixtures;
- deterministic canonical representation and addressing;
- non-impersonation fixture semantics;
- that the profile contains no executable authority object.

Project 0 must not mechanically validate:

- whether a semantic dimension truly matters;
- whether a human or model interpretation is correct;
- legal identity or legal succession;
- moral fidelity;
- model/person identity;
- perceptual similarity as proof;
- authority merely because an authority ref is named.

## Residual Topology

The first version should treat residuals as a structured boundary, not a scalar loss score.

A continuation may preserve evidence that:

- a property existed before but is absent after;
- an invariant weakened;
- a behavior no longer reproduces;
- a branch was refused;
- a source root is unavailable;
- a transformation is known but not reversible;
- an authority relation deliberately did not cross.

The profile does not need a universal loss ontology. It needs enough structure to make declared absence and unresolved remainder addressable and testable.

## Compatibility and migration

This design is additive:

- no new Project 0 node kind;
- no new universal relationship type;
- no new canonical receipt family;
- no replacement of existing canonical addressing;
- no changes to TranchNode, Corpus OS, jublEchat, or Toaster schemas;
- existing artifacts remain valid without continuity claims;
- downstream projects may emit adapters only when they have a real local specimen.

## First conformance fixture family

1. exact continuation with root closure;
2. multi-root continuation;
3. omitted material root — fail;
4. invented root — fail;
5. decoder/runtime version change disclosed as transformation;
6. same source roots, two distinct lawful realizations;
7. lost dimension explicitly declared;
8. unresolved residual preserved rather than forced into `lost` or `preserved`;
9. copied continuity claim grants no authority;
10. claim of authority continuity without separate authority evidence remains non-authoritative;
11. reconstruction claiming occurrence identity — fail/non-conforming;
12. same semantic payload with materially different lineage remains distinct.

## Graduation gate

The profile may graduate from experimental extension only after:

1. the Project 0 fixture family is executable and deterministic;
2. at least two materially different downstream systems can map their local witnesses into it without weakening their own laws;
3. no adapter needs Project 0 to decide domain meaning or execution authority;
4. the profile improves cross-system inspection or migration in a real specimen;
5. failures remain explicit and useful.

Shared code, if any, begins only at that point. Until then:

> **Shared questions. Local answers. Portable evidence. No portable authority.**
