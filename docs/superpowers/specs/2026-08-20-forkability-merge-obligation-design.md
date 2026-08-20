# Project0 — Forkability / Merge Obligation Pressure Test

**Status:** Approved bounded adversarial fixture
**Date:** 2026-08-20

## Question

Can the existing Typed Continuity Braid represent two lawful descendants that can later be reconciled without inferring that reconciliation is required, constituted, authoritative, or preferable?

> **Mergeability does not imply merge obligation.**

## Design

Use the existing `p0.continuity/0.1` grammar only.

Create two lawful descendants of one shared root, then represent three separately addressable continuations after an encounter:

1. a merge proposal;
2. coexistence with surviving difference;
3. explicit refusal to merge.

All three must remain attributable to both parents. The merge proposal must not establish the `authority` lane, must not replace either parent, and must remain a proposal under an explicit policy/context rather than constituted state.

## Expected result

`NO_GAP` is preferred. The test should pass using existing continuity types, addressing, and conformance functions with zero changes under `src/`.

A production change is permitted only if the hostile fixture exposes a real representational or conformance gap.

## Non-goals

- no `MERGEABLE` ontology kind;
- no `MERGE_OBLIGATION` relation;
- no automatic reconciliation policy;
- no preferred genealogy;
- no authority transfer;
- no state mutation or branch deletion;
- no claim that branching inherently preserves continuity.

## Acceptance

- RED is observed before the fixture exists;
- the merge, coexistence, and refusal descendants all conform under the existing purpose/meaning lane;
- all three continuations have distinct canonical continuity addresses;
- the merge proposal does not establish authority;
- parent continuity refs remain explicit and unchanged;
- zero files under `src/` change if the existing braid survives.
