# Manuscript Transmission Stress Corpus v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Use superpowers:test-driven-development before production-code changes and superpowers:verification-before-completion before any completion claim.

**Status:** dependency-gated; execution must stop after Task 1 until Typed Continuity Braid v0 exists as an implemented public contract.

**Goal:** Add exactly three deterministic synthetic manuscript-transmission attacks that prove Project 0 can preserve attributable continuity without collapsing a later copy into composition occurrence, a translation into exact source form, or plural fragment reconstructions into one forced whole.

**Architecture:** This slice is an adversarial conformance layer over the approved manuscript-transmission design, not a manuscript subsystem. It must consume the implemented Typed Continuity Braid v0 public contract from PR #50 rather than invent a second continuity grammar. PR #50 is currently docs-only, so fixture semantics may be frozen here but runtime/test wiring is intentionally blocked.

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

### Task 1: Enforce the upstream dependency gate

**Files:**
- Read: `docs/superpowers/specs/2026-08-19-continuity-witness-v0-design.md`
- Read: `docs/superpowers/plans/2026-08-19-continuity-witness-v0.md`
- Read after implementation exists: `src/continuity-profile/**`

**Interfaces:**
- Consumes: no manuscript-local continuity API.
- Produces: a binary decision: `BLOCKED` until the Typed Continuity Braid runtime exists; `OPEN` only after its public claim, validation, conformance/closure, and deterministic-addressing interfaces are implemented and green.

- [ ] **Step 1: Verify whether the runtime seam exists**

Run:

```bash
test -d src/continuity-profile && find src/continuity-profile -maxdepth 2 -type f -print
```

Expected today: the directory is absent because PR #50 is still docs-only. Record `BLOCKED` and stop.

- [ ] **Step 2: Refuse a manuscript-local workaround**

The following are forbidden while Task 1 is blocked:

```text
src/manuscript-continuity/**
new manuscript-specific continuity claim types
new manuscript-specific continuity hashing/addressing
new manuscript-specific authority or occurrence rules
copying the illustrative PR #50 type block into this branch as production code
```

Expected: no runtime or test file is added by this branch while the upstream contract is absent.

- [ ] **Step 3: Re-open only after PR #50 implements the approved braid**

Before Task 2 begins, the upstream implementation must demonstrate all eight lane kinds and all seven modes from the design:

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

It must also expose deterministic addressing and an independently evidenced closure/conformance check without granting authority or historical occurrence.

- [ ] **Step 4: Run upstream focused tests before manuscript work**

Run the actual continuity-profile focused tests introduced by the Typed Continuity Braid implementation, then:

```bash
npm run verify:all
```

Expected: upstream green. If not green, repair upstream first and keep this slice blocked.

- [ ] **Step 5: Regenerate this implementation plan from the real exported API**

Use `superpowers:writing-plans` again after the upstream implementation exists. The regenerated plan must name exact exported functions/types and exact test code; it must not guess from the illustrative design block.

---

## Frozen fixture semantics for the regenerated plan

These are the only three attacks authorized for v0. They preserve the research result without prematurely freezing an API that does not exist.

### Attack A — Copy is not composition occurrence

Synthetic payload:

```text
composition C0: "the lamp stands beside the door"
copy C1:        "the lamp stands beside the door"
```

Required shape:

```text
C0
 -> explicit unknown/separately witnessed transmission interval
 -> C1
```

Required assertions:

```text
C1 may preserve exact text-schema for the declared comparison purpose.
C1 must not impersonate C0's historical occurrence.
The unknown intermediary stays unknown; no invented manuscript node closes the story.
Identical visible bytes do not upgrade occurrence identity.
The witness remains evidence-only and non-authoritative.
```

### Attack B — Translation is not exact source form

Synthetic payload:

```text
source form: "LAMPA DORA"
target form: "lamp by door"
```

Required evidence context:

```text
source language ref
source script ref
target language ref
target script ref
translation-direction ref
translation-policy ref
source-form ambiguity/residual ref
```

Required assertions:

```text
text-schema may be transformed for the declared translation purpose.
target form cannot satisfy an exact-source lexical/script/orthographic claim.
translation policy is evidence context, not proof of semantic equivalence.
changing a material translation policy or residual changes claim identity.
translation never manufactures authority over the source witness.
```

### Attack C — Fragments do not force one whole

Synthetic material roots:

```text
F1 = "the lamp"
F2 = "beside"
F3 = "the door"
```

Two proposals:

```text
R1: F1 -> F2 -> F3
R2: F3 -> F2 -> F1
```

Required assertions:

```text
F1/F2/F3 remain immutable, address-distinct source fragments.
R1 and R2 are assembly/relationship claims, not mutations of the fragments.
Both proposals close over the same three declared material roots.
R1 and R2 remain deterministically address-distinct because their proposal structure/policy differs.
Neither becomes canonical by creation order, retrieval order, or test order.
Rejecting one downstream does not destroy the other or the fragments.
Neither proposal may invent a fourth fragment to clean up uncertainty.
Reconstructed whole is never historical occurrence merely because it is coherent.
```

## Verification gate after the dependency opens

The regenerated executable plan must use TDD for the three attacks and finish with:

```bash
npm run build && node --test .build/tests/continuity-profile-manuscript.test.js
npm run verify:all
```

Then classify the result as exactly one of:

```text
NO_GAP
The existing Typed Continuity Braid expresses all three distinctions. Stop. Do not add more architecture.
```

or:

```text
PORTABLE_GAP
One attack exposes a continuity-grammar weakness that generalizes beyond manuscript transmission. Repair the upstream Project 0 braid with its own test before changing the manuscript expectation.
```

Never accept:

```text
DOMAIN_PATCH
Add manuscript-specific production types just to make a fixture pass.
```

## Stop Condition

Stop when Project 0 can truthfully demonstrate, using only synthetic deterministic fixtures, that:

```text
copy -> original occurrence?        REFUSE
translation -> exact source form?   REFUSE
fragments -> one forced whole?      REFUSE
```

If those three attacks pass without exposing a portable continuity weakness, do not implement the remaining seven candidate manuscript shapes in this slice.
