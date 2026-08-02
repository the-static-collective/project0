# Covenant Merge Circuit

## Purpose

Project 0 must distinguish a contributor's report from the committed artifact and must distinguish evidence of readiness from authority to merge.

The circuit therefore applies the same invariant already used elsewhere:

> Capacity flows from an accountable human grant toward an action. Durability flows from the action back into append-only evidence. Evidence never manufactures capacity.

## Independent outputs

Every normative pull request produces three independent outputs:

1. **Author claim** — the PR body states what the contributor believes changed.
2. **Conformance receipt** — deterministic checks report what the committed files structurally establish.
3. **Contradiction receipt** — a reviewer records unresolved disagreement between the claim, the files, and upstream contracts.

These outputs may cite one another. They may not collapse into one verdict. A green conformance receipt is not a review, and a review is not merge authority.

## Admission and exercise

`MergeAdmission` is a computed disposition:

- `admissible`: required receipts exist and no blocking contradiction remains;
- `inadmissible`: a required receipt is absent or a blocking contradiction is open;
- `scope_uncertain`: the change exceeds the declared slice or its compatibility effect is unknown.

`MergeAdmission` never grants GitHub capacity. The repository owner or an explicitly delegated maintainer remains the sole source of merge capacity and exercises it as a separate human act.

## Change receipt

The pull request description is the human-readable `ContractChangeReceipt`. It binds:

- base revision and proposed head revision;
- meaning claim;
- invariants exercised;
- fixtures added or changed;
- compatibility and migration effects;
- deterministic checks and their outputs;
- unresolved tensions and blocked issues;
- the authority boundary: who may merge and what CI does not authorize.

A commit message or agent summary is not a substitute for this receipt.

## Mechanical gates

`npm run check` enforces facts that do not require semantic judgment:

- exactly nine canonical node kinds;
- exactly twenty-one canonical edge types and traversal rows;
- one adapter classification for every valid tuple;
- only TranchNode v0.1's nine native edge kinds or two accepted operations as targets;
- named loss for every lossy mapping;
- exact Request reference binding across the receipt contract, predicate, and positive fixture;
- deterministic ordering that never relies on `createdAt` or undefined cryptographic identity;
- blocked-issue status that cannot be contradicted by the PR body.

The gate deliberately does not decide whether a semantic choice is wise, true, lawful, or complete. That remains review work.

## Required repository setting

Protect `main` so the `contract-integrity` check and at least one non-author review are required before merge. Disable direct pushes and stale approvals. This repository setting is the enforcement boundary around the receipts; the documents alone cannot prevent an authorized person from bypassing them.

