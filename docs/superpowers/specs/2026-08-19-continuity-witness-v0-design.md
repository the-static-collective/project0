# Continuity Witness v0 — Typed Continuity Braid

**Status:** proposed Project 0 extension profile design

**Issue:** #8 — Define continuity profile: decoder context, residuals, root closure, and non-impersonation

**Design law:** continuity is typed, braided, purpose-relative, and non-transitive by default.

## Problem

The ecosystem now has several materially different systems answering variants of the same question:

> What survived a change, what did not, and what justifies treating the result as a continuation rather than an impersonation, reconstruction, revival, or unrelated replacement?

The shared pressure is real, but the answers are domain-specific. A Toaster candidate lineage, a TranchNode boundary tranch, a Corpus OS WorldCut, a historical succession claim, and a current idea do not have the same continuity conditions.

The earlier Continuity Witness design correctly made continuity purpose-relative, root-closed, loss-aware, environment-aware, and non-authoritative. It still left one dangerous ambiguity: an untyped list of dimensions can allow evidence in one continuity domain to be narrated as if it proved another.

Historical continuity claims make that failure mode obvious. A symbol can survive while an institution breaks. A legal title can survive while personnel, practice, and purpose change. A story can be revived centuries later without restoring prior corporate identity. A successor can lawfully receive custody without inheriting executable authority. A text can preserve a protocol after every original participant is gone.

Project 0 therefore needs a portable grammar that can answer a more precise question:

> **Same what, across which change, by what bridge, witnessed how, and what specifically did not cross?**

Project 0 must not create a global Continuity service, database, event bus, identity provider, registry, universal current-state object, or historical truth engine.

The useful shared object is narrower: a **Typed Continuity Braid** — a portable continuity claim profile whose lanes are separately evidenced and cannot silently substitute for one another.

## Research-derived architectural insight

The strongest real-world continuities are rarely one immortal container. They survive through overlapping carriers:

- people;
- texts and schemas;
- procedures and protocols;
- custody and property;
- offices and authority structures;
- purposes and obligations;
- representations, symbols, and stories;
- technical or institutional identity.

Different carriers can fail at different times. Continuity can remain lawful if enough required carriers overlap, transfer, or are explicitly reconstituted for the declared purpose.

This yields two core conclusions:

1. **Continuity is a braid, not a boolean.**
2. **Durability comes from redundant carriers, not from pretending one container never broke.**

The profile exists to preserve that distinction mechanically.

## Governing laws

1. **Continuity is a claim about relationship across change, not a claim of sameness.**
2. **Continuity is typed.** Evidence for one lane does not silently establish another lane.
3. **Continuity is purpose-relative.** Historical reconstruction, executable replay, semantic persistence, stewardship succession, and creative ancestry may require different lanes and invariants.
4. **Continuity is non-transitive by default.** A supported A → B edge in one lane plus a supported B → C edge in another lane does not establish an A → C edge.
5. **A continuity witness is evidence, not authority.** Copying, serializing, transporting, retrieving, or narrating it grants no capability, warrant, authorship, stewardship, legal power, or execution right.
6. **Authority is its own lane and requires separate constituting evidence.** Archive, name, purpose, personnel, procedure, custody, or identity continuity cannot manufacture authority continuity.
7. **Loss and breakage are first-class evidence.** A lawful claim states what was preserved, transformed, transferred, reconstituted, lost, broken, or unresolved.
8. **A gap may remain a gap.** Later reconstruction or revival must not be rewritten as uninterrupted continuity.
9. **Environment is part of decompression.** Decoder/runtime/policy identity is explicit when it materially affects reconstruction.
10. **Root closure is mandatory for material ancestry.** A derived claim cannot silently drop a material source root or invent one.
11. **Plural lawful continuations are permitted.** Valid lineage does not force one canonical realization.
12. **Reconstruction is not occurrence.** A later reconstruction may be useful without becoming the historical event it reconstructs.
13. **Local systems remain sovereign over admission.** Project 0 supplies portable semantics and conformance fixtures; downstream projects decide whether a witness matters in their domain.
14. **A clean story is never stronger than the braid that supports it.** Derived summaries may compress evidence but cannot erase contradictory, lost, broken, or unresolved lanes.

## The eight portable continuity lanes

Project 0 v0 defines eight broad lane kinds. These are intentionally coarse. Each lane contains downstream-declared dimensions; Project 0 does not decide what those dimensions mean locally.

### 1. Identity

What is being claimed to remain the same identified subject, artifact family, office, project, or constituted entity?

Identity continuity is strong and therefore expensive. Similarity, shared name, shared symbol, copied bytes, or successor status is not enough by itself.

### 2. Authority

What power, warrant, capability, office, stewardship right, or execution permission is claimed to continue?

A Continuity Witness never grants this lane. It can only point to separately constituted authority evidence or report the lane as absent/unresolved.

### 3. Custody

What artifact, property, corpus, key material, archive, responsibility, or protected resource moved into whose care?

Custody can transfer while identity and authority do not.

### 4. Participants

Which people, roles, maintainers, communities, institutions, or participant relations continue across the boundary?

Participant continuity may support a claim but does not prove institutional identity or authority.

### 5. Protocol

Which procedures, rules, rituals, algorithms, operating practices, invariants, or transformation constraints continue?

Protocol can survive through text or practice after original participants disappear.

### 6. Text / Schema

Which documents, code structures, schemas, recipes, manuscripts, records, or machine-readable contracts continue?

Textual continuity can be exact, transformed, translated, forked, reconstructed, or partial without implying identity of the surrounding institution.

### 7. Purpose / Meaning

Which declared purposes, obligations, semantic commitments, questions, or intended functions continue?

Purpose is explicitly purpose-relative and may survive embodiment change. Purpose continuity alone is not historical occurrence or authority.

### 8. Representation / Story

Which names, symbols, narratives, visual forms, myths, branding, legends, metaphors, or public self-descriptions continue?

This is the lane most likely to be mistaken for stronger genealogy. Its existence must never silently promote identity, participants, protocol, custody, or authority.

## Lane-local continuity modes

Each lane claim declares one continuity mode:

- `preserved` — materially continuous without a declared constitutive change in that lane;
- `transformed` — continuous for the declared purpose through an evidenced transformation;
- `transferred` — a relation or responsibility crossed from one carrier to another through an evidenced handoff;
- `reconstituted` — the lane was newly constituted from surviving material after a material break or gap;
- `lost` — the lane did not survive the boundary;
- `broken` — evidence positively establishes a discontinuity that blocks an uninterrupted claim;
- `unresolved` — available evidence does not justify a stronger classification.

`reconstituted` is not a synonym for `preserved`. It exists specifically so a lawful revival can be described without impersonating an unbroken line.

`broken` differs from `lost`: `lost` says a property or carrier did not survive; `broken` says the continuity relation itself is known to have been interrupted.

## Conceptual profile shape

The exact executable record belongs to the implementation plan after written-spec review. The design target is conceptually:

```ts
type ContinuityLaneKind =
  | "identity"
  | "authority"
  | "custody"
  | "participants"
  | "protocol"
  | "text-schema"
  | "purpose-meaning"
  | "representation-story";

type ContinuityMode =
  | "preserved"
  | "transformed"
  | "transferred"
  | "reconstituted"
  | "lost"
  | "broken"
  | "unresolved";

type ContinuityLaneClaim = {
  lane: ContinuityLaneKind;
  mode: ContinuityMode;
  dimensions: Array<{
    dimension: string;
    evidenceRefs: string[];
    note?: string;
  }>;
  transformationRefs: string[];
  residualRefs: string[];
  uncertainty: string[];
  doesNotEstablish: ContinuityLaneKind[];
};

type ContinuityClaimV0 = {
  schema: "p0.continuity/0.1";
  purpose: string;
  subjectRef: string;
  ancestorRoots: string[];
  environment: {
    decoderRef?: string;
    runtimeRef?: string;
    policyRefs: string[];
    contextRefs: string[];
  };
  lanes: ContinuityLaneClaim[];
  outputRefs: string[];
  parentContinuityRefs: string[];
  occurrenceClaim: "continuation-only";
};
```

This code block is illustrative, not yet the frozen implementation API. The written spec freezes semantics first; executable field ergonomics are settled in the subsequent implementation plan and TDD pass.

## Why broad lanes belong in Project 0

The eight lanes are not a universal ontology of meaning. They are **anti-impersonation boundaries**.

Project 0 needs enough shared structure to reject substitutions such as:

```text
representation continuity => identity continuity
participant continuity => authority continuity
custody continuity => authorship continuity
text continuity => protocol continuity
purpose continuity => historical occurrence
```

Within each broad lane, downstream systems remain free to declare their own dimensions. Examples:

- Toaster may declare `candidate-parentage`, `typography-cadence`, or `influence-only-memory` under relevant lanes.
- Corpus OS may declare `stewardship-purpose`, `world-cut ancestry`, or `warrant provenance` while preserving its own authority law.
- TranchNode may declare preserved/differentiated/lost boundary properties without importing a global semantic taxonomy.
- National Treasure may classify institutional identity, property custody, personnel, text, ritual protocol, purpose, and later symbolic revival independently.

## Non-transitivity law

Continuity edges do not compose automatically.

Given:

```text
A --representation-story/preserved--> B
B --participants/preserved--> C
```

Project 0 must not infer:

```text
A --identity/preserved--> C
```

Nor may it infer an A → C representation edge merely because both local edges are individually valid. Composition requires a new explicit claim that:

1. names the same lane being composed;
2. closes over the material roots and intermediate continuity refs;
3. discloses transformations, gaps, and residuals across the full path;
4. encounters no known `broken` edge that contradicts uninterrupted continuity;
5. supplies evidence sufficient for the declared purpose;
6. remains non-authoritative unless authority is separately constituted.

A braid therefore permits multiple adjacent valid claims without manufacturing a mythical long line.

## Gaps, revival, and reconstitution

A system must be able to survive interruption without lying about it.

If A disappears, later evidence from A is used to build B, and no lawful bridge supports uninterrupted identity, B may still be a legitimate descendant under one or more lanes:

```text
text-schema: preserved or transformed
protocol: reconstituted
purpose-meaning: reconstituted
representation-story: revived/reconstituted
identity: broken or unresolved
authority: none unless separately constituted
```

This is stronger than either extreme:

- pretending B is unrelated to A despite real inheritance; or
- pretending B is literally uninterrupted A despite the gap.

The braid can preserve descent while refusing impersonation.

## Typed continuity and the Continuity Spine

The existing Continuity Spine and Typed Continuity Braid solve different questions and should remain separate.

**The Braid asks:** what kinds of continuity are claimed to cross this boundary?

**The Spine asks:** when may staged transformation safely move responsibility from one carrier to another?

The Spine's high-level sequence remains:

```text
A
→ grow B
→ A + B overlap
→ transfer responsibility
→ witness transfer
→ B bears dependency
→ shed obsolete scaffold
```

The Braid supplies the lane-specific state observed at each stage.

### Gate 1 — Overlap

Overlap is constitutive when the future carrier has not yet proven it can bear required continuity lanes. A and B may coexist without pretending they are identical.

### Gate 2 — Witness

A transfer witness must name the lanes actually transferred. Witness of custody does not witness authority. Witness of protocol does not witness identity.

### Gate 3 — Shed

A scaffold may be shed only after the locally required lanes have achieved their admitted target state. A project may require protocol + text-schema + custody before retirement, while another may require different lanes.

The Continuity Spine may rank or inspect candidate routes. It does not select a route, grant authority, or convert future proposal into present evidence.

## Authority lane: explicit anti-laundering rule

Authority is intentionally asymmetric with the other lanes.

A continuity claim may truthfully say:

```text
B descends from A in custody, protocol, text-schema, and purpose.
```

It may not thereby say:

```text
B may exercise A's authority.
```

The authority lane may report only what externally constituted evidence supports. A portable witness can carry an exact reference to that evidence; it cannot validate or mint the authority by being present.

Consequences:

- copying a warrant-looking string into a braid grants nothing;
- serializing an old warrant alongside a successor does not reactivate it;
- inheriting a repo, archive, name, purpose, office description, or participant group does not automatically transfer execution rights;
- legal validity is never inferred by Project 0;
- Corpus OS remains the natural proving ground for the distinction between continuity attestation and constituted authority.

Core law:

> **Continuity may explain succession. It does not perform succession.**

## Carrier redundancy and lawful re-emergence

Continuity should not depend on one privileged carrier surviving forever.

A domain may declare a purpose-specific required lane set and permit lawful re-emergence when enough independent carriers survive to reconstruct those lanes under explicit transformation.

Examples:

- people + protocol + text may reconstitute a practice after a software implementation is lost;
- text + schema + receipts may reconstitute a deterministic executable form under a new runtime;
- custody + purpose + protocol may support a successor stewardship claim while identity and authority are separately resolved;
- story + symbol alone may support representation continuity while leaving every stronger lane unresolved.

Redundancy is therefore a durability strategy, not proof of sameness.

## Required distinction: witness != warrant

A continuity claim may say:

```text
B descends from A under purpose P in lanes L1...Ln.
```

It may not thereby say:

```text
B may exercise A's authority.
```

Any authority continuity must point to separately valid authority evidence under the receiving domain's law. Project 0 may validate that an authority claim is bounded and refers to evidence; it does not validate the evidence as sufficient authority.

## Two portable read-model questions

The profile should make it possible for products to derive, locally:

### Why Current?

What attributable path explains why this projection/form is present now?

A valid answer must use exact refs, lane-local claims, and admitted lineage, not semantic similarity, timestamps alone, shared symbols, or generated narrative.

### Still Alive?

Which declared lanes, invariants, tensions, residuals, obligations, or unresolved dimensions remain active in the current continuation?

A valid answer may return partial continuity, breakage, reconstitution, uncertainty, or plurality. It must not invent resolution merely to produce a clean story.

These are shared **questions**, not one shared UI or service.

## Existing ecosystem specimens and ownership

The profile is extracted from already distinct local evidence rather than projected into a vacuum.

### Project 0 — portable grammar

Project 0 owns:

- lane kinds;
- continuity modes;
- claim representation;
- closure and contradiction rules;
- non-transitivity;
- non-impersonation;
- deterministic addressing;
- portable conformance fixtures.

Project 0 does not own downstream admission or execution.

### TranchNode — evidence and lineage substrate

TranchNode owns the stronger local mechanics for artifact roots, boundary receipts, residuals, projections, preserved/differentiated/lost state, and model-independent lineage.

A Project 0 braid may cite or adapt TranchNode evidence. It must not reimplement the artifact store or projection engine.

### Corpus OS — constituted succession proving ground

Corpus OS owns constituted present, lawful reachability, causal accounting, WorldCut history, warrants, and execution authority.

Its Continuity Attestation specimen should be the first authority-hostile downstream proof:

> A continuity attestation is a witness, not a warrant.

Corpus can use the braid to explain which lanes connect prior and current cuts while independently deciding whether any authority exists now.

### National Treasure — hostile historical test corpus

National Treasure is a useful adversarial research corpus because historical genealogy claims routinely mix:

- property succession;
- institutional identity;
- personnel continuity;
- textual or ritual inheritance;
- purpose;
- symbols and stories;
- later revival.

The repository should not become substrate authority. It supplies cases that try to fool the grammar.

### GitBook — bounded explanatory projection

GitBook may explain the model for re-entry and human understanding. It does not become the authoritative continuity registry.

## Historical hostile specimen

A deliberately simplified Templar-style claim demonstrates why the lanes exist.

Suppose evidence supports:

- medieval institution A ended as a constituted institution;
- some property moved lawfully to institution H;
- some later group M uses Templar names, symbols, stories, or ritual references;
- no adequate evidence proves uninterrupted corporate identity A → M.

A lawful braid may say approximately:

```text
A → H
  custody: transferred
  identity: not established by custody
  authority: local to H's separately constituted basis

A → M
  representation-story: reconstituted/preserved through later sources
  purpose-meaning: possible or reconstituted, if evidenced
  text-schema / protocol: transformed or unresolved, depending on intermediaries
  participants: broken/unresolved
  custody: unresolved/none
  identity: broken/unresolved
  authority: none from the continuity claim itself
```

The false move is:

```text
shared symbols + later story => uninterrupted institutional identity
```

The Project 0 replacement is:

```text
typed edge + exact evidence + explicit non-inference => bounded continuity claim
```

This historical example is not normative data. It is an adversarial shape the conformance fixtures should be able to model.

## Validation boundary

Project 0 may mechanically validate:

- schema/version;
- allowed lane kinds and modes;
- exact declared roots and refs;
- duplicate or contradictory lane classification where forbidden;
- required environment/policy declarations;
- parent continuity closure;
- lane-local residual treatment;
- omission/invention of roots in canonical fixtures;
- deterministic canonical representation and addressing;
- non-impersonation fixture semantics;
- non-transitive path behavior;
- that known broken edges block uninterrupted composition;
- that `doesNotEstablish` declarations cannot be silently erased during canonical composition;
- that the profile contains no executable authority object.

Project 0 must not mechanically validate:

- whether a semantic dimension truly matters;
- whether a human or model interpretation is correct;
- legal identity or legal succession;
- moral or theological fidelity;
- model/person identity;
- perceptual similarity as proof;
- historical truth merely because a source ref exists;
- authority merely because an authority ref is named;
- whether one downstream domain should require a given lane for its own success condition.

## Residual topology

Residuals remain a structured boundary, not a scalar loss score.

A continuation may preserve evidence that:

- a property existed before but is absent after;
- an invariant weakened;
- a behavior no longer reproduces;
- a branch was refused;
- a source root is unavailable;
- a transformation is known but not reversible;
- an authority relation deliberately did not cross;
- identity broke while purpose or representation later re-emerged;
- custody transferred without personnel transfer;
- a lane cannot currently be resolved.

The profile does not need a universal loss ontology. It needs enough structure to make declared absence, breakage, and unresolved remainder addressable and testable.

## Conformance expectations

The first executable fixture family should eventually prove at least these shapes:

1. exact one-root continuation in multiple lanes;
2. multi-root continuation;
3. omitted material root — fail;
4. invented root — fail;
5. decoder/runtime version change disclosed as transformation;
6. same source roots, two distinct lawful realizations;
7. explicit lost lane/dimension;
8. explicit unresolved residual;
9. explicit broken identity with lawful text/protocol reconstitution;
10. custody transfer that does not transfer authority;
11. participant continuity that does not establish institutional identity;
12. representation/story continuity that does not establish protocol or identity;
13. reconstruction claiming historical occurrence identity — fail/non-conforming;
14. copied continuity claim grants no authority;
15. same semantic payload with materially different lineage remains distinct;
16. heterogeneous A → B and B → C lanes do not auto-compose;
17. same-lane composition with a known broken intermediate edge refuses uninterrupted continuity;
18. reconstituted continuation remains distinguishable from preserved continuation;
19. removal of a known loss/break/residual changes claim identity and fails expected conformance;
20. one real downstream authority-hostile specimen can map without weakening its own local law.

## Compatibility and migration

This design remains additive:

- no new Project 0 node kind;
- no new universal relationship type;
- no new canonical receipt family;
- no replacement of existing canonical addressing;
- no global Continuity registry;
- no changes to TranchNode, Corpus OS, National Treasure, jublEchat, or Toaster schemas in this spec slice;
- existing artifacts remain valid without continuity claims;
- downstream projects may emit adapters only when they have a real local specimen;
- the existing implementation plan on the draft PR must be reconciled to this written spec only **after user review of this spec**, per the architectural gate.

## Graduation gate

The profile may graduate from experimental extension only after:

1. the Project 0 fixture family is executable and deterministic;
2. at least two materially different downstream systems can map their local witnesses into it without weakening their own laws;
3. one of those proofs exercises authority separation, preferably Corpus OS;
4. no adapter needs Project 0 to decide domain meaning or execution authority;
5. non-transitivity prevents at least one realistic false genealogy/composition;
6. reconstitution can be represented without impersonating uninterrupted identity;
7. losses, breakage, and unresolved lanes remain visible after inspection and serialization;
8. the profile improves cross-system inspection or migration in a real specimen;
9. failures remain explicit and useful.

Shared runtime code or broad adoption begins only after those gates are met.

## Stop condition for this design slice

The written architecture is complete when Project 0 can state, without overclaiming:

> **A Continuity Witness is a deterministic, root-closed, purpose-relative braid of separately evidenced continuity lanes. It can explain what crossed a boundary, what transformed, what was transferred, what was reconstituted, what was lost or broken, and what remains unresolved. Lanes do not substitute for one another, heterogeneous edges do not compose into stronger genealogy, reconstruction does not become occurrence, and no continuity claim manufactures authority.**

The implementation plan is intentionally downstream of written-spec review.

> **Shared questions. Typed lanes. Local answers. Portable evidence. Explicit gaps. No portable authority.**
