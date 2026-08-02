# Agent Instructions

These instructions apply to Jules, Codex, and other coding agents working in this repository.

## Mission

Protect the shared meaning contract. Prefer a small executable truth over a large speculative framework.

## Before changing anything

1. Read `README.md`, `FOUNDATION.md`, `ONTOLOGY.md`, `INVARIANTS.md`, and `CONSTRUCTION.md`.
2. Anchor non-trivial work to an attributable construction issue and add one provisional manifest under `construction/proposals/`.
3. Identify which invariant and roadmap slice the change serves.
4. Inspect existing fixtures, construction records, and decisions before introducing a new abstraction.
5. Check whether the change belongs in Project 0 or a downstream product.

## Working rules

- Never silently reinterpret a normative term.
- Preserve provenance, authorship, disclosure, rejection, and uncertainty.
- Do not make model inference part of deterministic verification.
- Do not add infrastructure until a fixture or conformance requirement needs it.
- Keep domain-specific UI and workflow out of the kernel.
- Represent incompatible interpretations explicitly; do not average them away.
- A hash is identity/tamper evidence, not semantic validation.
- Retrieval never grants authority.
- Review, witness, CI success, model confidence, and popularity never manufacture authority.
- Favor pure functions, canonical serialization, exhaustive types, and adversarial tests.
- Every change to a normative document must name migration and compatibility effects.
- Correct a construction proposal with a new attributable record; do not rewrite history to erase a tension or rejected alternative.

## Self-hosting bootstrap

`CONSTRUCTION.md` defines how Project 0 uses GitHub to preserve construction lineage before the reference kernel exists.

Until issue #5 freezes canonical addressing:

- every construction manifest must use `identity.status: "provisional"` and `identity.canonicalHash: null`;
- Git commit SHAs and GitHub URLs are external provenance references only;
- no contribution may introduce a canonicalizer, placeholder digest, or competing hash chain by implication;
- merge state remains a repository-scoped admission decision, not semantic truth or ecosystem-wide canon.

## Pull request contract

Every pull request should state:

- the proposal issue and construction-manifest path
- the primary construction class and roadmap slice
- the meaning-contract change, if any
- exact source and base-revision lineage
- invariants exercised
- fixtures added or changed
- requested authority and scope
- compatibility and migration effect
- tests run and their explicit non-claims
- unresolved tensions and rejected alternatives

## First implementation target

Build only enough TypeScript to:

1. define canonical node, relationship, policy, authority-lease, and receipt types
2. serialize them deterministically
3. hash and verify canonical fixtures
4. validate the initial invariants mechanically where possible
5. export a conformance report

No database, server, agent loop, UI, or model dependency belongs in the first slice.
