# NAV v0.1 Lawful Navigation Specimen Implementation Plan

> Required execution mode: Superpowers TDD / executing-plans. Keep the slice fixture-only.

**Goal:** Add one offline executable NAV specimen for the pinned `Project0 → Corpus OS` crossing without changing NAV production semantics.

**Architecture:** A test consumes one fixture-only TypeScript module exporting pinned source metadata plus before/crossing/after NAV declarations. Existing `createNavCrossingReceipt(...)` is the only crossing engine.

## Constraints

- No changes under `src/nav-crossing/`.
- No changes to canonical addressing, ontology, reference-kernel types, or canonical receipt contracts.
- No runtime imports from Corpus OS, Founder Node, GitBook, or Authority Kit.
- No network calls in tests.
- External evidence must be pinned as literal refs.

### Task 1 — RED acceptance test

**Create:** `tests/nav-lawful-navigation-specimen.test.ts`

1. Import `createNavCrossingReceipt` and the not-yet-existing fixture module.
2. Assert pinned source metadata names Authority Kit commit `b99dd1b...`, Corpus OS commit `f54c808...`, and Latent Reachability blob `e31f97d...`.
3. Construct the crossing receipt.
4. Assert exact dispositions:
   - frame changed;
   - constitution changed;
   - authority preserved with empty refs;
   - decoder preserved;
   - evidence changed;
   - participant preserved;
   - current-project changed;
   - nearby-door preserved;
   - prospective-reachability new_after.
5. Assert crossing status `materially_changed`, `nav-...` receipt identity, no `rect-...` identity, and deterministic repeated construction.
6. Assert crossing evidence does not appear in before/after `authorityRefs`.
7. Commit test only and observe GitHub Actions `npm run verify:all` fail because `fixtures/nav/lawful-navigation-project0-corpus-os` does not exist.

### Task 2 — GREEN fixture

**Create:** `fixtures/nav/lawful-navigation-project0-corpus-os.ts`

Export typed/frozen constants:

- `lawfulNavigationSourceEvidence`;
- `lawfulNavigationBefore`;
- `lawfulNavigationCrossing`;
- `lawfulNavigationAfter`.

Use these stable refs:

- threshold law: `gitbook:HILTtUulCBDqDzXXk6RQ:patterns/field-traversal-and-illumination#threshold-probing-is-not-traversal`;
- Authority Kit relation: `github:the-static-collective/jubilee-authority-kit@b99dd1bf3e9af4c30a4f0e365237357086b7fdf6:registry/projects.json#corpus-os-CONFORMS_TO-project0`;
- Project0 constitution: `github:the-static-collective/project0@0961e44f7fabc5807acea2b267009230f1e846c3`;
- Corpus OS constitution: `github:the-static-collective/corpus-os@f54c808c3c91a599f47189a1e873c8adcaff7143`;
- Latent Reachability: `github:the-static-collective/corpus-os@f54c808c3c91a599f47189a1e873c8adcaff7143:runtime/latent-reachability.ts#blob-e31f97d27a16c15a79ea3062dfdad2214413cc81`.

Before and after authority arrays must both remain empty.

Commit the fixture and require full `npm run verify:all` GREEN.

### Task 3 — Review and exact-head verification

1. Inspect changed files. They must be only spec, plan, test, and fixture.
2. Riqor owner-review for authority laundering, accidental runtime coupling, unpinned evidence, and missing negative assertions.
3. If review changes the head, rerun the exact full gate.
4. PR body must state meaning-contract effect = fixture/evidence only, source pins, RED/GREEN runs, compatibility, and non-goals.
5. Promote from draft only after exact-head green.

### Follow-on

Do not publish the GitBook evidence projection in the same PR. Once this executable proof is landed, create a separate GitBook-synced evidence note pointing back to the exact fixture/receipt lineage.
