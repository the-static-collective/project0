# Construction Protocol

## Status

This document defines the pre-addressing bootstrap by which Project 0 begins to govern its own construction.

It is a non-normative construction profile over the existing meaning contract. It adds no node kind, edge kind, receipt family, authority source, or canonical identity rule. If it conflicts with `FOUNDATION.md`, `ONTOLOGY.md`, `INVARIANTS.md`, `RELATIONSHIPS.md`, or `RECEIPTS.md`, those documents govern and the conflict must be recorded as a tension.

Until issue #5 freezes canonical addressing, every construction manifest is provisional. Git object IDs and GitHub URLs are provenance references, not Project 0 canonical hashes.

## Why begin before the kernel exists

The architecture can govern construction before it can store canonical receipts. The useful first step is to preserve the distinctions the future kernel will enforce:

- proposal is not admission;
- review is not authority;
- verification is not truth;
- merge is not universal canon;
- a closed branch is not erased history;
- a release tag is an explicit normative boundary;
- every material change declares sources, scope, invariants, compatibility effects, and tensions.

This creates honest evidence for the later runtime instead of forcing the runtime to reconstruct its own origin from chat or commit messages.

## GitHub bootstrap mapping

| GitHub object or event | Construction interpretation | Explicit boundary |
|---|---|---|
| Issue | An attributable candidate `source`, `claim`, `proposal`, or `tension`; the author must state which role it serves | Filing does not admit a canonical node |
| Branch and commit | Material implementation lineage and transformation history | Git identity is external provenance only |
| Pull request | An attributable proposal derived from declared sources | Opening a PR grants no authority and proves no correctness |
| Review comment | An observation, claim, tension, or rejection candidate, according to its content | Review status does not manufacture authority |
| Deterministic check | Verification output about declared mechanics | A green check does not establish semantic truth, occurrence, or permission |
| Maintainer merge | Repository-scoped admission decision under attributable maintainer authority | Merge does not make every claim true and does not create ecosystem-wide canon |
| Closed-unmerged PR | Retained rejection, abandoned proposal, or unresolved tension with attributable grounds | Closure must not erase lineage or rejected alternatives |
| Release tag | An explicit normative version boundary | Draft material does not become normative merely by landing on `main` |

These are construction interpretations, not assertions that GitHub objects are themselves Project 0 nodes or receipts.

## Change classes

Every proposal declares exactly one primary class:

- `constitutional` — changes shared meaning, boundaries, or invariants;
- `structural` — implements machinery required to enforce the contract;
- `domain` — applies the floor to one bounded purpose without redefining the substrate;
- `adapter` — maps a replaceable product or repository to canonical semantics;
- `interface` — changes a replaceable human or agent surface;
- `research` — preserves an unresolved idea, experiment, or candidate law without promotion.

A vivid domain or interface change does not become constitutional by importance. A constitutional change cannot be hidden inside implementation work.

## The construction circuit

### 1. Declare

Open or cite an issue that states the proposed change, its class, its intended scope, and its stop conditions. Add one manifest under `construction/proposals/`.

The manifest is a proposal record. It is not mutated into an admission record. Corrections create a new proposal that cites and revises the prior one.

### 2. Derive

Create the implementation on a branch. The pull request cites the proposal issue, manifest path, source revisions, roadmap slice, and affected terms or files.

Material discoveries made during implementation are added as attributable tensions, rejected alternatives, or follow-up issues. They are not smoothed out of the final summary.

### 3. Verify

Run the smallest deterministic checks that exercise the declared invariants. Record exact commands, fixtures, and limitations.

Human, agent, and automated reviews remain separately attributable. Agreement may support an admission decision; it cannot substitute for authority or turn confidence into evidence.

### 4. Admit, reject, or preserve as tension

An authorized repository maintainer makes the merge or closure decision. The decision is scoped to the repository and must preserve grounds.

- merge means the proposed repository change was admitted;
- close with grounds means rejection or abandonment remains recoverable;
- leave open or open a follow-up tension when the contract is genuinely unsettled;
- never delete an inconvenient branch of reasoning merely because another branch was admitted.

Before the reference kernel exists, GitHub holds this administrative state. After the kernel exists, an adapter may emit append-only admission, rejection, supersession, or tension records without rewriting the original proposal.

### 5. Establish canon deliberately

`main` is the current integrated draft unless a repository document says otherwise. A normative contract boundary requires an explicit version decision and tag. Canonical status never arises from branch popularity, model confidence, or elapsed time.

## Admission gates

A proposal is ready for an admission decision only when all applicable gates are answered:

1. **Placement** — Why does this belong in Project 0 rather than a downstream product?
2. **Lineage** — Which exact sources, issues, commits, fixtures, and prior decisions does it use?
3. **Semantics** — Which terms, node/edge mappings, or receipt meanings change? If none, say none.
4. **Invariants** — Which invariant references are exercised, and what adversarial case protects each material claim?
5. **Authority and scope** — Who is being asked to do what, in which repository or contract boundary, on what basis?
6. **Verification** — Which deterministic checks ran, and what do they explicitly not prove?
7. **Compatibility** — Is the effect none, compatible, migration-required, breaking, or unknown?
8. **Tension preservation** — What remains unresolved, and which alternatives were rejected with grounds?
9. **Identity boundary** — Is every pre-#5 record marked provisional with `canonicalHash: null`?
10. **Canon boundary** — Does the change affect integrated draft state or a tagged normative release?

A missing answer blocks admission when that answer is material to the proposed change.

## Provisional construction manifest

`construction/manifest.schema.json` defines the bootstrap record shape. Each record must include:

- its proposal issue;
- repository and exact base revision;
- primary change class and roadmap references;
- source and provenance references;
- changed meaning-contract terms, if any;
- Project 0 invariant references;
- declared relationship mappings, where useful;
- verification evidence and limitations;
- compatibility and migration effects;
- requested authority and scope;
- unresolved tensions and rejected alternatives;
- stop conditions;
- `identity.status: provisional` and `identity.canonicalHash: null`.

The schema is structural guidance during this bootstrap. Passing it is not Project 0 conformance.

## Identity boundary before issue #5

- Use full Git commit SHAs and stable GitHub URLs as external references.
- Never label a Git SHA, blob SHA, issue URL, timestamp, UUID, or simulated digest as the Project 0 canonical hash.
- Never place a digest-looking placeholder in `canonicalHash`; use `null`.
- Do not mint a new hash chain for construction records.
- If exact source bytes matter, cite the repository, path, and commit.
- If the addressing law later changes how a record would be encoded, preserve the provisional record and add a migration receipt rather than rewriting history.

## Transition to mechanical self-hosting

### After issue #5

- canonicalize construction receipt bodies with the one adopted Project 0 addressing library;
- mint exact cross-runtime test vectors for the construction record shape;
- keep the computed address outside the hashed body;
- retain Git references as provenance, not as replacement identities.

### After issue #2

- admit construction events to the append-only reference receipt graph;
- distinguish proposal, verification, witness, admission, rejection, supersession, and tension without collapsing them;
- emit a conformance report for each construction slice;
- derive status projections from receipts rather than mutating prior records.

### After Floor 1.2

- publish an adapter contract so TranchNode and downstream repositories can emit compatible construction manifests;
- require explicit loss reports where a downstream repository cannot represent a Project 0 meaning;
- demonstrate a relationship-preserving round trip across at least two repositories.

## First dogfood record

`construction/proposals/project0-13-self-hosting-bootstrap.json` records the proposal that introduced this protocol. It deliberately keeps `canonicalHash` null and names the resulting incompleteness as a tension.
