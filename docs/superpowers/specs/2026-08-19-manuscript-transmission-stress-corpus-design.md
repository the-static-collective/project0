# Manuscript Transmission Stress Corpus v0 — Design

**Status:** proposed Project0 adversarial fixture design

**Issue:** #51 — Research fixture: manuscript transmission stress corpus v0

**Depends on:** PR #50 — Continuity Witness v0 / Typed Continuity Braid

**Design law:** manuscript transmission is a hostile continuity problem, not a new ontology.

## Purpose

Use the transmission shapes exposed by the Dead Sea Scrolls and Nag Hammadi research as an adversarial test family for Project0's emerging Continuity Witness / Typed Continuity Braid.

The goal is not to encode ancient corpora or make Project0 a textual-criticism engine. The goal is to test whether the existing continuity grammar remains honest under cases where:

- the surviving physical witness is later than the underlying composition;
- copies may descend through unknown intermediaries;
- source language and surviving language may differ;
- translation, transcription, orthographic normalization, restoration, and edition are materially different transformations;
- fragments survive without a complete parent artifact;
- several assemblies or editions may remain lawful at once;
- custody and discovery history affect provenance without constituting textual or interpretive authority;
- later reconstruction is useful without becoming the historical occurrence it reconstructs;
- silence, loss, lacunae, uncertain readings, and disputed joins must remain first-class.

The manuscript cases are useful because they attack exactly the false collapses Project0 is intended to prevent.

## Architectural position

This design does **not** add a second continuity system.

PR #50 already proposes the Typed Continuity Braid with separately evidenced lanes including:

- identity;
- authority;
- custody;
- participants;
- protocol;
- text / schema;
- purpose / meaning;
- representation / story.

It also already distinguishes continuity modes such as preserved, transformed, transferred, reconstituted, lost, broken, and unresolved.

The manuscript corpus should therefore be a **fixture family against that grammar**, not a new `TextWitness`, `Manuscript`, `Translation`, or `CriticalEdition` primitive in the shared ontology.

Project0 owns the portable conformance question. Domain projects may later own richer manuscript or Scripture semantics if real product work requires them.

## Core question

> Can Project0 describe what survives across composition, copying, translation, fragmentation, reconstruction, edition, custody, rediscovery, and digitization without allowing one surviving layer to impersonate another?

The minimum required distinctions are:

```text
copy != composition
manuscript date != composition date
translation != source-language witness
transcription != manuscript object
normalization != exact orthography
reconstruction != occurrence
edition != sole lawful textual realization
custody != authorship
custody != interpretive authority
survival != canon
similarity != dependence
absence != proof of nonexistence
```

These statements are conformance pressures, not historical verdicts.

## Why language must remain continuous through the fixture

Language is not an appendix to transmission. It is one of the strongest ways a continuity system can accidentally overclaim.

A textual descendant may preserve one dimension while transforming another:

```text
semantic proposition: substantially preserved for declared purpose
lexical form: transformed
word order: transformed
script: transformed
orthography: transformed
phonology: unresolved
source-language ambiguity: partly lost
translator interpretation: introduced
```

Project0 must not decide whether two expressions are semantically equivalent. It must make enough context available for a downstream witness to declare the transformation honestly.

The fixture may therefore carry **fixture-local context declarations** such as:

- `languageRef`;
- `scriptRef`;
- `orthographyProfileRef`;
- `translationDirectionRef`;
- `transliterationPolicyRef`;
- `normalizationPolicyRef`;
- `editorialPolicyRef`;
- `uncertaintyRefs`.

These are not proposed new Project0 global fields. The implementation pass should first determine whether existing `contextRefs`, `policyRefs`, `transformationRefs`, lane dimensions, and residual refs already express them cleanly. Prefer reuse.

## Fixture principle: synthetic content, historically real shapes

The first executable corpus should use synthetic strings and synthetic artifact identifiers.

Do **not** ingest Dead Sea Scrolls, Nag Hammadi codices, Bible texts, scholarly editions, museum images, copyrighted translations, or external catalogs merely to prove the mechanics.

The real research supplies the adversarial relationship shapes. Synthetic fixtures make those shapes deterministic, reviewable, offline, and free of accidental claims about ancient history.

Example synthetic source:

```text
ancestor composition A:
  "the lamp stands beside the door"
```

Later witnesses can deliberately exercise copying error, alternate orthography, translation, lacunae, reconstruction, and plural edition behavior without asserting anything about a real ancient text.

## Proposed specimen family

### Specimen 1 — Composition vs surviving copy

Shape:

```text
composition-root A
  -> unknown copying interval
  -> surviving manuscript witness B
```

Required behavior:

- B may claim textual descent from A only through declared evidence/roots available to the fixture;
- B must not claim that its physical-manuscript occurrence is A's composition occurrence;
- physical witness identity and text/schema continuity remain distinguishable;
- an unknown intermediary interval remains explicit rather than silently repaired.

Attack caught:

> "This surviving copy contains the work, therefore this copy is the original composition."

### Specimen 2 — Source language vs translation

Shape:

```text
source-language witness A
  -> declared translation transformation T
  -> target-language witness B
```

Required behavior:

- text/schema continuity may be `transformed` for a declared purpose;
- B cannot impersonate A's exact lexical, script, or orthographic form;
- translation policy and unresolved ambiguity can remain in context/residual evidence;
- translating B again does not automatically prove a direct A -> C relation without an explicit composed claim.

Attack caught:

> "The translation means approximately the same thing, therefore it is the same textual witness."

### Specimen 3 — Fragmentary survival

Shape:

```text
complete ancestor A
  -> loss
  -> fragments F1, F2, F3
```

Required behavior:

- surviving fragments remain address-distinct artifacts;
- absent material remains `lost` or `unresolved` as appropriate;
- the system cannot fabricate a complete current artifact merely because a complete ancestor is declared;
- root closure remains honest about which material is actually available.

Attack caught:

> "We know a complete work once existed, therefore missing content may be treated as present."

### Specimen 4 — Competing fragment assemblies

Shape:

```text
F1 + F2 + F3
  -> reconstruction proposal R1
  -> reconstruction proposal R2
```

Required behavior:

- both proposals may remain lawful and address-distinct;
- a proposed join is evidence about relation, not mutation of the source fragments;
- rejecting or preferring R1 does not destroy R2;
- unresolved ordering or join evidence remains visible.

Attack caught:

> "One plausible reconstruction exists, therefore plurality is an error to erase."

### Specimen 5 — Orthographic normalization / transcription

Shape:

```text
manuscript-form A
  -> transcription T1
  -> normalized transcription T2
```

Required behavior:

- a normalization may preserve content for one purpose while transforming orthography for another;
- T2 cannot claim exact graphemic identity with A;
- changing normalization policy changes the continuity context and, where material, the addressed claim;
- normalization must not silently erase uncertainty markers or damaged readings.

Attack caught:

> "Machine-comparable text is the manuscript."

### Specimen 6 — Critical edition with apparatus

Shape:

```text
witnesses A, B, C
  -> edition E
       + variant V1
       + variant V2
       + unresolved U1
```

Required behavior:

- E may settle one usable current reading without erasing source witnesses or alternatives;
- apparatus relations remain attributable;
- the edition is not promoted into the unique historical original;
- a cleaner edition that drops a known unresolved residual changes claim identity and fails the expected fixture.

Attack caught:

> "Current selected reading means alternatives ceased to exist."

### Specimen 7 — Plural lawful editions

Shape:

```text
same witness roots
  -> editorial policy P1 -> edition E1
  -> editorial policy P2 -> edition E2
```

Required behavior:

- E1 and E2 may both be lawful continuations under different declared purposes/policies;
- same roots do not force same output;
- neither edition may become canonical merely because it was produced first or retrieved more often.

Attack caught:

> "One source history must yield exactly one lawful present representation."

### Specimen 8 — Custody / discovery / publication without authority laundering

Shape:

```text
artifact A
  -> custody C1
  -> custody C2
  -> publication/digital witness D
```

Required behavior:

- custody may transfer independently of text/schema continuity;
- access or publication does not manufacture authorship, textual identity, interpretive authority, or authority over downstream products;
- provenance metadata may remain critical evidence while authority remains `none`, externally constituted, or unresolved under the receiving domain.

Attack caught:

> "Possession or publication authority equals authority over meaning."

### Specimen 9 — Reconstruction after a historical gap

Shape:

```text
prior witness family A
  -> material gap / loss
  -> surviving traces S
  -> later reconstruction R
```

Required behavior:

- R may be `reconstituted` or `transformed` in relevant lanes;
- known gap remains a gap;
- R's occurrence is later and distinct;
- useful reconstruction cannot claim `preserved` merely to obtain a cleaner story.

Attack caught:

> "Successful reconstruction proves uninterrupted continuity."

### Specimen 10 — Digital derivative and environment migration

Shape:

```text
physical/transcribed witness A
  -> encoded digital artifact D1
  -> migrated encoding/runtime D2
```

Required behavior:

- exact payload continuity can coexist with carrier/runtime transformation;
- decoder/runtime/policy context is explicit when required for reconstruction;
- successful reconstruction under a new environment does not impersonate the original physical occurrence.

Attack caught:

> "Same visible output means same artifact history."

## Non-transitivity attacks

Manuscript transmission supplies especially useful path-composition attacks.

Example:

```text
A --text-schema/transformed by translation--> B
B --representation-story/preserved by quotation--> C
```

Project0 must not infer:

```text
A --text-schema/preserved--> C
```

Likewise:

```text
A --custody/transferred--> B
B --text-schema/copied--> C
```

must not manufacture an A -> C authority, identity, authorship, or custody claim.

Any long-path claim must be separately declared, root-closed, lane-consistent, loss-aware, and explicit about intermediate transformations.

## Similarity and linguistic evidence boundary

The fixture should include one deliberate resemblance trap.

Two independently declared synthetic texts may share:

- vocabulary;
- phrase order;
- formulaic expression;
- structural motif;
- transliterated spellings.

Project0 may preserve a downstream claim that those similarities were observed. It must not infer from similarity alone:

- direct dependence;
- common authorship;
- common source;
- chronological priority;
- institutional continuity;
- semantic identity.

This mirrors the broader Project0 law that retrieval or resemblance proposes candidates rather than truth.

## Expected conformance assertions

The eventual implementation should prove at least:

1. surviving-copy occurrence cannot impersonate composition occurrence;
2. translated witness cannot impersonate source-language exact form;
3. normalization policy is disclosed when it transforms material dimensions;
4. unknown intermediaries remain unresolved rather than invented;
5. lost fragment content cannot silently reappear;
6. competing reconstructions remain plural and address-distinct;
7. edition selection does not erase apparatus/residuals;
8. plural editorial policies may produce plural lawful continuations;
9. custody transfer cannot manufacture authority;
10. publication/access cannot manufacture authorship;
11. reconstruction after a gap remains reconstituted/distinct from uninterrupted preservation;
12. same visible text with materially different lineage has different continuity identity;
13. heterogeneous lane edges do not auto-compose;
14. similarity alone produces no genealogy edge;
15. language/script/translation context can alter a continuity claim without becoming a universal semantic truth engine;
16. copied or serialized continuity evidence remains evidence only;
17. all fixtures replay deterministically and offline;
18. no fixture requires external corpus bytes or network access.

## Downstream doors

This Project0 corpus is the first proving surface, not the final application.

### formation-trace

Potential later specimen:

> direct captured formation evidence vs retrospective reconstructed formation history.

A live trace may witness insertions, deletions, returns, branches, pauses, and explicit annotations. An imported historical artifact without capture evidence may support reconstruction proposals but must never manufacture unwitnessed keystrokes, edit order, author intent, or machine events.

This distinction should remain product-local until a real formation-trace design proves it useful.

### Upper Room

Potential later specimen:

> one Scripture coordinate, multiple attributable textual/translation witnesses, no master narrator.

The existing translation-neutral adapter makes this a plausible future projection, but no textual apparatus belongs in Upper Room merely because the research is interesting. A bounded public-domain passage should be used only after the Project0 fixture clarifies the portable boundary.

### TranchNode

Potential later specimen:

> source fragments remain immutable while assembly/join proposals, contradictory reconstructions, and rejected joins remain relationship evidence.

This naturally aligns with TranchNode's existing no-silent-overwrite, no-source-erasure, contradiction-preservation, and retrieval-is-not-authority laws. No TranchNode change is required by this design.

### Unfolding Ledger / creative systems

Potential later specimen:

> critical apparatus sidecar: current artifact + rejected variants + unresolved readings + revision scars.

The current payload stays usable while historical alternatives remain reconstructable and attributable outside the primary canonical artifact.

### convergent-codec

Research-only possibility:

> shared variant-position masks across exact parallel sequences.

A positive compression result would prove only reusable exact structure, never common authorship, common source, or semantic equivalence.

## GitBook candidate law

A bounded explanatory projection may incubate this anti-collapse pattern:

> **Survival is evidence of survival. It is not automatically evidence of origin, identity, completeness, interpretation, or authority.**

Supporting distinctions:

```text
copy != origin
translation != source
fragment != reconstructed whole
edition != occurrence
survival != canon
custody != authority
recurrence != authority
similarity != genealogy
reconstruction != historical return
```

This belongs in the Primitive Incubator until repeated software specimens demonstrate utility. Historical elegance alone must not promote it into ecosystem law.

## Failure conditions

Redesign or reject this slice if implementation requires any of the following:

- a new global manuscript/text ontology in Project0;
- Project0 deciding semantic equivalence between languages;
- external ancient corpora as test dependencies;
- one canonical textual reconstruction chosen by the shared substrate;
- similarity promoted into genealogy;
- lost or unresolved evidence deleted to make fixtures pass;
- custody, publication, or discovery promoted into authority;
- translation treated as exact source-language preservation;
- reconstruction treated as historical occurrence;
- a second canonicalizer, hash system, or receipt family merely for these fixtures.

## Smallest implementation after review

Do not implement all ten specimens at once.

After this written spec is reviewed and PR #50's continuity grammar is selected, the first implementation should contain exactly three synthetic attacks:

1. **copy != composition occurrence**;
2. **translation != source exact form**;
3. **two lawful reconstructions from the same fragments remain plural**.

If those three expose no meaningful weakness in the Typed Continuity Braid, stop before expanding the corpus.

If they do expose a weakness, repair the portable grammar only when the weakness generalizes beyond manuscript scholarship.

## Graduation gate

The manuscript corpus graduates from research fixture to durable Project0 conformance material only if:

1. it catches at least one realistic false-collapse not already covered by ordinary continuity fixtures;
2. the fix remains domain-neutral;
3. all examples remain synthetic and deterministic;
4. no new authority path appears;
5. language remains explicit without forcing Project0 to adjudicate meaning;
6. plural lawful reconstructions remain representable;
7. loss and uncertainty remain visible;
8. at least one materially different downstream project later reproduces the useful distinction independently.

## Stop condition for this design slice

This slice is complete when the repository can state:

> **Manuscript transmission is an adversarial continuity corpus. It tests whether Project0 can preserve lineage through copying, translation, fragmentation, reconstruction, edition, custody, and re-encoding without allowing surviving evidence to impersonate origin, exact form, occurrence, completeness, canon, or authority. The first proof uses synthetic content and existing Continuity Witness semantics; no manuscript ontology or historical truth engine is introduced.**

Implementation remains gated on written-spec review and the selected Continuity Witness / Typed Continuity Braid contract from PR #50.