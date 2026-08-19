# Manuscript Transmission Stress Corpus v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use superpowers:test-driven-development before production-code changes and superpowers:verification-before-completion before any completion claim.

**Goal:** Add exactly three deterministic synthetic manuscript-transmission attacks that prove Project 0 can preserve attributable continuity without collapsing a later copy into composition occurrence, a translation into exact source form, or plural fragment reconstructions into one forced whole.

**Architecture:** This slice is an adversarial conformance layer over the approved manuscript-transmission design, not a manuscript subsystem. It must consume the eventual Typed Continuity Braid v0 public contract from PR #50 rather than invent a second continuity grammar. Until PR #50 freezes and implements that public contract, this plan may freeze fixture semantics and sequencing only; runtime/test wiring remains blocked.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, Project 0 deterministic canonicalization and verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-manuscript-transmission-stress-corpus-design.md`

## Global Constraints

- Implement exactly three synthetic attacks in v0: copy vs composition occurrence; translation vs exact source form; plural fragment reconstructions.
- Use synthetic content only. No Dead Sea Scrolls, Nag Hammadi, Bible, museum, scholarly-edition, copyrighted-translation, or external-catalog bytes are required.
- No network access or corpus scraping.
- No manuscript ontology, canon adjudication, authorship detector, historical truth engine, similarity-to-genealogy inference, or new authority path.
- Do not add a second serializer, hasher, receipt family, authority mechanism, or continuity grammar.
- Reuse the Typed Continuity Braid v0 contract implemented from PR #50.
- Language/script/orthography/translation context is evidence context, not a semantic truth engine.
- Reconstruction is not occurrence.
- Lost or unknown material stays lost or unresolved; fixtures may not fabricate intermediaries to make a clean story.
- Plural lawful continuations must remain address-distinct and may not be collapsed by insertion order, retrieval order, or test convenience.
- Broad gate after runtime wiring: `npm run verify:all`.

---

### Task 1: Freeze the upstream dependency gate

**Files:**
- Read: `docs/superpowers/specs/2026-08-19-continuity-witness-v0-design.md`
- Read: the reconciled implementation plan that replaces `docs/superpowers/plans/2026-08-19-continuity-witness-v0.md`
- Read: the final public files introduced by the Typed Continuity Braid implementation under `src/continuity-profile/`

**Interfaces:**
- Consumes: the actual public Typed Continuity Braid v0 claim, validation, conformance/closure, and deterministic-addressing interfaces after PR #50 is approved and implemented.
- Produces: a written import/API map for Tasks 2–4 using only names that exist on the implementation branch.

- [ ] **Step 1: Verify the dependency is implemented, not docs-only**

Run:

```bash
git log --oneline -- src/continuity-profile
find src/continuity-profile -maxdepth 2 -type f -print
```

Expected: at least one production TypeScript file exists under `src/continuity-profile/`. If the directory does not exist, **stop**. Do not create manuscript-local continuity types to bypass the gate.

- [ ] **Step 2: Verify the approved braid semantics are represented**

Inspect the public types and require all eight lane kinds and all seven modes from the design:

```text
lanes:
  identity
  authority
  custody
  participants
  protocol
  text-schema
  purpose-meaning
  representation-story

modes:
  preserved
  transformed
  transferred
  reconstituted
  lost
  broken
  unresolved
```

Expected: the implemented public contract can represent the `text-schema` lane with `preserved`, `transformed`, `reconstituted`, `lost`, or `unresolved` as needed, and can carry evidence/transformation/residual/context references without creating authority.

- [ ] **Step 3: Verify the dependency still enforces non-transitivity and non-occurrence**

Run the upstream continuity-profile focused tests supplied by PR #50.

Expected: upstream tests are green before manuscript fixtures are added. If they are not green, repair PR #50 first; do not weaken the manuscript fixtures.

- [ ] **Step 4: Record the concrete upstream names in this plan before implementation**

Replace only the integration-note block below with the exact exported names and signatures observed in the implemented branch. Do not change fixture semantics.

```text
Integration note (must be concrete before Task 2 starts):
- claim type/export: <resolved from implemented PR #50>
- claim validator/export: <resolved from implemented PR #50>
- closure/conformance export: <resolved from implemented PR #50>
- deterministic address export: <resolved from implemented PR #50>
```

Expected: no manuscript-specific continuity API is introduced.

- [ ] **Step 5: Commit only if the import/API map changed**

```bash
git add docs/superpowers/plans/2026-08-19-manuscript-transmission-stress-corpus-v0.md
git commit -m "docs: bind manuscript corpus to continuity braid api"
```

---

### Task 2: Attack copy versus composition occurrence

**Files:**
- Create: `fixtures/continuity-profile/manuscript-transmission.ts`
- Create or extend: `tests/continuity-profile-manuscript.test.ts`

**Interfaces:**
- Consumes: concrete Typed Continuity Braid interfaces recorded in Task 1.
- Produces: fixture export `copyVsCompositionSpecimen` and a focused conformance test proving a surviving copy cannot impersonate composition occurrence.

- [ ] **Step 1: Write the failing test**

Use synthetic source text only:

```ts
const COMPOSITION_TEXT = "the lamp stands beside the door";
const COPY_TEXT = "the lamp stands beside the door";
```

The fixture must model two distinct occurrences:

```text
composition occurrence C0
  -> unknown or separately witnessed transmission interval
  -> surviving copy occurrence C1
```

Assert all of the following:

```text
C1 may preserve exact text-schema for the declared comparison purpose.
C1 is not C0's historical occurrence.
The unknown intermediary is not silently invented.
A clean identical payload cannot upgrade occurrence identity.
The claim remains continuation-only / non-authoritative.
```

Expected RED: the manuscript fixture/test does not exist.

- [ ] **Step 2: Run the focused test and observe RED**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: FAIL because the fixture export is absent.

- [ ] **Step 3: Add the minimum synthetic fixture using the upstream braid**

Represent the surviving copy with:

```text
text-schema: preserved
identity: unresolved or broken only if fixture evidence justifies it
representation-story: unresolved unless separately declared
authority: unresolved or absent according to upstream contract
occurrence: continuation/relation only; never historical occurrence identity
```

Use explicit evidence/context refs such as:

```text
fixture:composition:C0
fixture:copy:C1
fixture:gap:C0-C1
policy:exact-text-comparison-v0
```

Do not fabricate an intermediate manuscript node merely to close the story.

- [ ] **Step 4: Run the focused test and verify GREEN**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: PASS for the copy/composition case.

- [ ] **Step 5: Commit**

```bash
git add fixtures/continuity-profile/manuscript-transmission.ts tests/continuity-profile-manuscript.test.ts
git commit -m "test: distinguish copy from composition occurrence"
```

---

### Task 3: Attack translation versus exact source form

**Files:**
- Extend: `fixtures/continuity-profile/manuscript-transmission.ts`
- Extend: `tests/continuity-profile-manuscript.test.ts`

**Interfaces:**
- Consumes: concrete upstream braid APIs from Task 1 and the fixture module from Task 2.
- Produces: fixture export `translationVsSourceFormSpecimen` proving translation can be a lawful transformed continuation without impersonating exact source-language form.

- [ ] **Step 1: Write the failing test**

Use intentionally artificial language labels and synthetic tokens; do not make philological claims about a real language:

```ts
const SOURCE_FORM = "LAMPA DORA";
const TARGET_FORM = "lamp by door";
```

Require the fixture to disclose:

```text
source language ref
source script ref
target language ref
target script ref
translation-direction ref
translation-policy ref
source-form ambiguity/residual ref
```

Assert:

```text
text-schema continuity may be transformed for a declared translation purpose.
TARGET_FORM cannot satisfy an exact-source-form claim.
Translation policy is evidence context, not proof of semantic equivalence.
Changing the translation policy or residual ambiguity changes the addressed claim when those fields are material under the upstream contract.
No translation witness acquires authority over the source witness merely by being current or readable.
```

Expected RED: translation fixture absent.

- [ ] **Step 2: Run the focused test and observe RED**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: FAIL only for the missing/new translation case after Task 2 remains green.

- [ ] **Step 3: Add the minimum translation fixture**

Represent the cross-language edge with:

```text
text-schema: transformed
purpose-meaning: unresolved unless the fixture explicitly limits the claim to a declared test purpose
authority: unchanged/non-granting
exact source lexical/script/orthographic form: not preserved
```

Use explicit context refs, for example:

```text
language:synthetic-source
script:latin-fixture-source
language:synthetic-target
script:latin-fixture-target
translation-direction:source-to-target
policy:literal-fixture-translation-v0
residual:source-ambiguity-01
```

- [ ] **Step 4: Run the focused test and verify GREEN**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: copy/composition and translation/source-form cases both PASS.

- [ ] **Step 5: Commit**

```bash
git add fixtures/continuity-profile/manuscript-transmission.ts tests/continuity-profile-manuscript.test.ts
git commit -m "test: distinguish translation from exact source form"
```

---

### Task 4: Preserve two lawful fragment reconstructions

**Files:**
- Extend: `fixtures/continuity-profile/manuscript-transmission.ts`
- Extend: `tests/continuity-profile-manuscript.test.ts`

**Interfaces:**
- Consumes: concrete upstream braid APIs from Task 1 and deterministic addressing from PR #50.
- Produces: fixture exports `fragmentReconstructionA` and `fragmentReconstructionB` proving two assembly proposals may share material roots while remaining separately attributable and address-distinct.

- [ ] **Step 1: Write the failing test**

Use three synthetic fragment roots:

```text
F1 = "the lamp"
F2 = "beside"
F3 = "the door"
```

Define two reconstruction proposals over the same roots:

```text
R1: F1 -> F2 -> F3
R2: F3 -> F2 -> F1
```

The test must assert:

```text
F1/F2/F3 remain immutable/address-distinct source fragments.
R1 and R2 are relationship/assembly claims, not mutations of F1/F2/F3.
Both proposals close over the same declared material roots.
R1 and R2 receive different deterministic continuity addresses because proposal structure/policy differs.
Neither proposal becomes canonical because it is created first, returned first, or listed first.
Rejecting one proposal in a downstream domain does not destroy the other proposal or the source fragments.
Missing source material may remain unresolved; neither proposal may invent a fourth fragment.
```

Expected RED: plural reconstruction fixtures absent.

- [ ] **Step 2: Run the focused test and observe RED**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: FAIL only for the new plural-reconstruction assertions.

- [ ] **Step 3: Add both reconstruction proposals with explicit assembly policy refs**

Use refs such as:

```text
fixture:fragment:F1
fixture:fragment:F2
fixture:fragment:F3
policy:assembly:R1
policy:assembly:R2
```

Represent the reconstructed whole as `reconstituted` or `transformed` only as justified by the upstream braid contract; never as preserved historical occurrence. Keep known gaps/residuals visible.

- [ ] **Step 4: Verify deterministic plurality**

Run:

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: all three manuscript attacks PASS, and the two reconstruction addresses differ.

- [ ] **Step 5: Commit**

```bash
git add fixtures/continuity-profile/manuscript-transmission.ts tests/continuity-profile-manuscript.test.ts
git commit -m "test: preserve plural fragment reconstructions"
```

---

### Task 5: Run the broad gate and stop

**Files:**
- Modify only if evidence requires it: `docs/superpowers/plans/2026-08-19-manuscript-transmission-stress-corpus-v0.md`
- Do not add Tasks 6–10 from the design unless a separate review approves expansion.

**Interfaces:**
- Consumes: all three green manuscript fixtures.
- Produces: fresh verification evidence and a decision to either stop or open one portable upstream repair.

- [ ] **Step 1: Run focused manuscript verification**

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
```

Expected: PASS.

- [ ] **Step 2: Run the full Project 0 gate**

```bash
npm run verify:all
```

Expected: PASS with no regression in existing canonical-addressing, NAV, World Encounter, Snap-State, L-Branch, witness-residue, or reference-kernel behavior.

- [ ] **Step 3: Classify what the three attacks taught**

Use exactly one outcome:

```text
NO_GAP
The existing Typed Continuity Braid expresses all three distinctions. Stop. Do not add more architecture.
```

or:

```text
PORTABLE_GAP
One attack exposes a continuity-grammar weakness that generalizes beyond manuscript transmission. Repair the upstream Project 0 braid with its own test before changing the manuscript fixture expectation.
```

Do not accept:

```text
DOMAIN_PATCH
Add manuscript-specific production types just to make a fixture pass.
```

- [ ] **Step 4: Record fresh evidence only**

Append the exact feature-head SHA and actual verification commands/results to this plan after they have run. Do not record expected counts as observed evidence.

- [ ] **Step 5: Commit evidence if the plan changed**

```bash
git add docs/superpowers/plans/2026-08-19-manuscript-transmission-stress-corpus-v0.md
git commit -m "docs: record manuscript stress verification"
```

## Stop Condition

Stop when Project 0 can truthfully demonstrate, using only synthetic deterministic fixtures, that:

```text
copy -> original occurrence?        REFUSE
translation -> exact source form?   REFUSE
fragments -> one forced whole?      REFUSE
```

If those three attacks pass without exposing a portable continuity weakness, do not implement the remaining seven candidate manuscript shapes in this slice.
