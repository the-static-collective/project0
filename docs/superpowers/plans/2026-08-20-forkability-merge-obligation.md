# Forkability / Merge Obligation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pressure-test the existing Typed Continuity Braid against `MERGEABILITY != MERGE OBLIGATION` without adding production semantics.

**Architecture:** Add one synthetic fixture family and one focused Node test. The fixture models two lawful branches and three distinct post-encounter outcomes—merge proposal, coexistence, refusal—using only `p0.continuity/0.1`.

**Tech Stack:** TypeScript, Node `node:test`, existing Project0 continuity profile.

**Spec:** `docs/superpowers/specs/2026-08-20-forkability-merge-obligation-design.md`

## Global Constraints

- Do not change `src/` unless the existing continuity braid fails the hostile fixture.
- Do not add ontology or relationship kinds.
- A merge proposal must not establish authority or constituted state.
- Coexistence and refusal remain lawful representable outcomes.

---

### Task 1: Add the hostile conformance test

**Files:**
- Test: `tests/continuity-profile-forkability.test.ts`

**Interfaces:**
- Consumes: `addressContinuityClaim`, `checkLaneComposition`, `claimEstablishesLane`.
- Produces: executable assertions for three distinct lawful post-encounter continuations.

- [x] **Step 1: Write the failing test** importing `fixtures/continuity-profile/forkability` before that fixture exists.
- [x] **Step 2: Run the focused test and observe RED** due only to the missing fixture module.

### Task 2: Add the minimum synthetic fixture

**Files:**
- Create: `fixtures/continuity-profile/forkability.ts`

**Interfaces:**
- Produces: `branchA`, `branchARef`, `branchB`, `branchBRef`, `mergeCandidate`, `coexistenceCandidate`, `refusalCandidate`.

- [x] **Step 1: Model two lawful branches from one shared root** with separately addressable continuity claims.
- [x] **Step 2: Model a merge proposal** as `purpose-meaning/transformed` with `status:proposal-only` and no authority lane.
- [x] **Step 3: Model coexistence and refusal** as distinct unresolved continuations retaining both parent refs and surviving difference.
- [x] **Step 4: Run the focused test and observe GREEN** with two passing tests.

### Task 3: Verify repository scope and publish

**Files:**
- Create: `docs/superpowers/specs/2026-08-20-forkability-merge-obligation-design.md`
- Create: `docs/superpowers/plans/2026-08-20-forkability-merge-obligation.md`

- [ ] **Step 1: Confirm the branch changes zero files under `src/`.**
- [ ] **Step 2: Run the strongest available fresh repository verification.**
- [ ] **Step 3: Open a non-draft PR against `main` documenting RED/GREEN evidence and any verification limits.**
- [ ] **Step 4: Inspect current-head checks/reviews and repair only branch-caused failures.**
