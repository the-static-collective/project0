# Agent Instructions

These instructions apply to Jules, Codex, and other coding agents working in this repository.

## Mission

Protect the shared meaning contract. Prefer a small executable truth over a large speculative framework.

## Before changing anything

1. Read `README.md`, `FOUNDATION.md`, `ONTOLOGY.md`, and `INVARIANTS.md`.
2. Identify which invariant and roadmap slice the change serves.
3. Inspect existing fixtures and decisions before introducing a new abstraction.
4. Check whether the change belongs in Project 0 or a downstream product.

## Working rules

- Never silently reinterpret a normative term.
- Preserve provenance, authorship, disclosure, rejection, and uncertainty.
- Do not make model inference part of deterministic verification.
- Do not add infrastructure until a fixture or conformance requirement needs it.
- Keep domain-specific UI and workflow out of the kernel.
- Represent incompatible interpretations explicitly; do not average them away.
- A hash is identity/tamper evidence, not semantic validation.
- Retrieval never grants authority.
- Favor pure functions, canonical serialization, exhaustive types, and adversarial tests.
- Every change to a normative document must name migration and compatibility effects.

## Pull request contract

Every pull request should state:

- the meaning-contract change, if any
- invariants exercised
- fixtures added or changed
- compatibility effect
- tests run
- unresolved tensions

The PR body is a claim, not proof. For a normative change:

- update the relevant machine-readable contract artifact;
- run `npm run check` and report its literal result;
- never claim an issue is unblocked when `contract/status.json` marks it blocked;
- keep author claim, conformance receipt, and contradiction review independent;
- never treat a green check or witness as merge authority;
- do not merge your own normative change without a non-author review.

If a task summary and the committed files disagree, the committed files control and the contradiction remains open.

## First implementation target

Build only enough TypeScript to:

1. define canonical node, relationship, policy, authority-lease, and receipt types
2. serialize them deterministically
3. hash and verify canonical fixtures
4. validate the initial invariants mechanically where possible
5. export a conformance report

No database, server, agent loop, UI, or model dependency belongs in the first slice.
