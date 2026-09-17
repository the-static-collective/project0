# WHOLE RETURN v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small executable Project0 contract that deterministically validates and replays one version-locked cross-repository journey through interruption and return.

**Architecture:** Add a pure `src/whole-return/` module containing only contract types, validation, deterministic reduction, and resume-token generation. The reducer consumes a frozen declaration plus append-only events; downstream repositories remain external and sovereign. Tests exercise the full finite-state surface and adversarial identity/receipt/version cases without adding infrastructure.

**Tech Stack:** TypeScript, Node `crypto`, existing Project0 canonicalization helper, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-17-whole-return-v0-design.md`

## Global Constraints

- Additive experimental profile; do not change the frozen node ontology or existing receipt families.
- Preserve native participant identity domains; do not create a universal object identifier.
- Hashes are identity/tamper evidence only.
- No database, server, queue, model, network dependency, or scheduler.
- Deterministic replay must remain offline and model-independent.
- Existing Project0 tests and conformance must remain green.

---

### Task 1: Freeze the Whole Return behavior with RED tests

**Files:**
- Create: `tests/whole-return.test.ts`

**Interfaces:**
- Consumes: future exports from `src/whole-return/index.ts`.
- Produces: executable behavior contract for `validateWholeReturnDeclaration`, `replayWholeReturn`, and `resumeTokenFor`.

- [x] **Step 1: Write a failing happy-path replay test**

Create a two-participant declaration (`toaster`, `dogram`), a crossing, an interruption, an exact resume, a second crossing, and completion with native return references. Assert final status is `completed` and the replay contains both crossing IDs.

- [x] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: TypeScript build fails because `src/whole-return/index.ts` does not exist.

- [x] **Step 3: Add adversarial tests while still RED**

Cover artifact hash mismatch, blank receipt refs, wrong identity domain, sequence gaps, duplicate event IDs, crossing while interrupted, wrong interruption on resume, post-terminal events, and completion without return refs.

- [x] **Step 4: Add replay/version tests while still RED**

Assert identical input yields identical resume token; changing a participant revision or occurrence ID changes the token; exact replay of one occurrence does not become a new occurrence.

### Task 2: Implement the minimal pure contract

**Files:**
- Create: `src/whole-return/types.ts`
- Create: `src/whole-return/replay.ts`
- Create: `src/whole-return/index.ts`

**Interfaces:**
- Produces:
  - `validateWholeReturnDeclaration(declaration: WholeReturnDeclaration): void`
  - `replayWholeReturn(declaration: WholeReturnDeclaration, events: WholeReturnEvent[]): WholeReturnReplay`
  - `resumeTokenFor(declaration: WholeReturnDeclaration, events: WholeReturnEvent[]): string`

- [x] **Step 1: Define exhaustive contract types**

Define declaration, participant, native identity, crossing/interrupt/resume/complete/refuse events, statuses, and replay result types. Use discriminated unions for events.

- [x] **Step 2: Implement declaration validation**

Reject blank required strings, duplicate participant IDs, duplicate identity domains, fewer than two participants, empty allowed operations, and equal `jobId`/`occurrenceId` only if either is blank (their values are semantically independent and may coincidentally match).

- [x] **Step 3: Implement event validation and deterministic reduction**

Require contiguous sequence values, unique event IDs, known participants, exact participant identity-domain matches, nonblank receipt refs, equal 64-hex artifact digests, exact resume-to-active-interruption binding, no illegal state transitions, no post-terminal events, and at least one completion return ref.

- [x] **Step 4: Implement deterministic resume-token generation**

Use `canonicalizeDomainValue("Project0-WholeReturn-v0|", { declaration, events, status })` and expose the SHA-256 digest as `whole-return-sha256:<hex>`. Public token generation derives lifecycle status through replay rather than accepting a caller-supplied status.

- [x] **Step 5: Run tests and verify GREEN**

Run: `npm test`

Expected: all Whole Return and existing TypeScript tests pass.

### Task 3: Add an ecosystem-shaped reference fixture

**Files:**
- Create: `fixtures/whole-return/toaster-dogram-return.json`
- Create: `tests/whole-return-fixture.test.ts`

**Interfaces:**
- Consumes: Whole Return public API.
- Produces: compact fixture shaped like the existing Toaster -> Dogram handoff without claiming to import or verify downstream runtime behavior.

- [x] **Step 1: Write RED fixture test before fixture exists**

The test loads the JSON fixture, replays it through the public API, and asserts status `completed`, participant revisions remain locked, and producer/consumer native refs remain distinct.

- [x] **Step 2: Run and confirm RED**

Run: `npm test`

Expected: fixture-read failure.

- [x] **Step 3: Add the minimal fixture**

Include `toaster`, `dogram`, `alex`, and `tranchnode` participants with explicitly fictional/example revisions where a real revision is not pinned by this repository. Mark the fixture as `example_only` in its declaration purpose and do not claim downstream execution.

- [x] **Step 4: Run and verify GREEN**

Run: `npm test`

Expected: all tests pass.

### Task 4: Verify repository-wide compatibility

**Files:**
- No production file changes unless verification exposes a defect.

- [x] **Step 1: Run type check**

Run: `npm run check`

Expected: PASS.

- [x] **Step 2: Run full repository verification**

Run: `npm run verify:all`

Expected: PASS.

- [x] **Step 3: Review the diff for scope drift**

Confirmed: the branch adds only the experimental Whole Return module, focused tests/fixture, and its spec/plan. No ontology edits, existing receipt-family changes, infrastructure additions, or downstream imports were introduced.

- [x] **Step 4: Open a draft pull request with the Project0 PR contract**

PR body states meaning-contract change, invariants exercised, fixtures, compatibility effect, tests/checks, and unresolved tensions including that Windows/downstream end-to-end execution is not yet witnessed by Project0.
