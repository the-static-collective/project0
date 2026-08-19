# Continuity Witness v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Use superpowers:test-driven-development for every production-code task and superpowers:verification-before-completion before any completion claim.

**Goal:** Implement the smallest offline Project 0 continuity profile that can make an addressed, purpose-relative claim about what survived a transformation, what changed or was lost, which roots/environment are required for reconstruction, and why the claim cannot manufacture authority or impersonate historical occurrence.

**Architecture:** Add one experimental `src/continuity-profile/` seam parallel to other bounded Project 0 specimens. Reuse `canonicalizeDomainValue(...)` for deterministic representation. The profile remains independent of the frozen nine-kind ontology and canonical receipt union. It validates structural continuity claims and produces conformance evidence; downstream products retain all domain-specific meaning and authority admission.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, existing `canonicalizeDomainValue`, existing Project 0 verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-continuity-witness-v0-design.md` and GitHub issue #8.

## Global Constraints

- Protocol: `p0.continuity/0.1`.
- No global Continuity service, DB, event bus, registry, current-state daemon, UI, model, network, scheduler, or identity provider.
- No new ontology kind, relationship type, or canonical receipt family.
- Reuse `canonicalizeDomainValue`; do not create a second serializer/hasher.
- Continuity claims are evidence only. Copying/transporting a claim cannot create authority.
- `authorityContinuity` is declarative metadata only: `none | separately-evidenced | unresolved`.
- Project 0 never decides whether a downstream semantic dimension is important or true.
- Exact material roots must close; missing or invented roots fail conformance.
- Environment/decoder/runtime/policy context is explicit when declared by the profile.
- `preserved`, `transformed`, `lost`, and `unresolved` remain distinct.
- A dimension must not silently occupy contradictory terminal classifications in one claim.
- Multiple lawful continuations from the same roots remain legal and address-distinct.
- Reconstruction must not silently claim historical occurrence identity.
- Existing `src/witness-residue.ts`, NAV, World Encounter, Snap-State, L-Branch, and reference-kernel semantics remain unchanged.
- Existing artifacts remain valid without a continuity profile.
- Broad gate: `npm run verify:all`.

## Proposed Files

- `src/continuity-profile/types.ts` — v0 public records and status unions.
- `src/continuity-profile/validate.ts` — descriptor-safe, fail-closed structural validation.
- `src/continuity-profile/address.ts` — continuity domain prefix, normalization, address + verification using existing canonicalizer.
- `src/continuity-profile/inspect.ts` — pure `deriveWhyCurrent(...)` / `deriveStillAlive(...)` projections over an admitted claim.
- `src/continuity-profile/index.ts` — public experimental seam.
- `fixtures/continuity-profile/specimens.ts` — positive and adversarial frozen fixture family.
- `tests/continuity-profile.test.ts` — ordinary contract/address/read-model proofs.
- `tests/continuity-profile-adversarial.test.ts` — root closure, contradiction, impersonation, authority-copy, hostile representation proofs.
- `tests/continuity-profile-specimen.test.ts` — deterministic frozen specimen and plurality proofs.
- `docs/continuity-profile-v0.md` — compact consumer boundary after code is green.

## Task 1 — Freeze the record contract before behavior

**Files:**
- Create `tests/continuity-profile.test.ts`
- Create `src/continuity-profile/types.ts`
- Create `src/continuity-profile/index.ts`

### RED

Write compile/runtime tests requiring these exported contracts:

```ts
export type ContinuityDisposition =
  | "preserved"
  | "transformed"
  | "lost"
  | "unresolved";

export type ContinuityDimension = {
  dimension: string;
  disposition: ContinuityDisposition;
  evidenceRefs: string[];
  note?: string;
};

export type ContinuityEnvironment = {
  decoderRef?: string;
  runtimeRef?: string;
  policyRefs: string[];
  contextRefs: string[];
};

export type ContinuityClaimV0 = {
  schema: "p0.continuity/0.1";
  purpose: string;
  subjectRef: string;
  ancestorRoots: string[];
  transformationRefs: string[];
  environment: ContinuityEnvironment;
  dimensions: ContinuityDimension[];
  residualRefs: string[];
  outputRefs: string[];
  parentContinuityRefs: string[];
  authorityContinuity: "none" | "separately-evidenced" | "unresolved";
  occurrenceClaim: "continuation-only";
  uncertainty: string[];
};
```

Require no imports from Corpus OS, TranchNode, Toaster, jublEchat, model libraries, host ports, or network code.

Run:

```bash
npm run check
```

Expected RED: missing module/exports.

### GREEN

Add only the types and index export required by the test. Keep domain dimensions as open strings; do not invent a global taxonomy.

Run focused compile/test, then:

```bash
npm run check
```

### Commit

```bash
git add src/continuity-profile/types.ts src/continuity-profile/index.ts tests/continuity-profile.test.ts
git commit -m "feat: define continuity profile v0 contract"
```

## Task 2 — Fail closed on malformed and contradictory claims

**Files:**
- Create `src/continuity-profile/validate.ts`
- Extend `tests/continuity-profile.test.ts`
- Create `tests/continuity-profile-adversarial.test.ts`

### RED

Specify `validateContinuityClaim(value: unknown): ContinuityClaimV0` and require rejection of:

- wrong/missing schema;
- empty `purpose`, `subjectRef`, or `ancestorRoots`;
- duplicate roots, outputs, parent refs, or evidence refs where duplicates would hide structure;
- unknown dispositions;
- empty dimension names;
- one dimension declared in mutually contradictory dispositions;
- `occurrenceClaim` other than `continuation-only`;
- accessors/getters, custom prototypes, sparse arrays, symbols, functions, `undefined`, cycles, or unsafe canonical values;
- malformed nested environment records.

Use the same defensive representation expectations already enforced by Project 0 canonicalization. Validation must inspect data without executing getters.

Run:

```bash
npm run build && node --test .build/tests/continuity-profile-adversarial.test.js
```

Expected RED: validator absent.

### GREEN

Implement descriptor-safe validation. Reuse `validateForCanonicalization(...)` after top-level descriptor admission rather than duplicating numeric/string canonicalization rules.

Do not validate downstream semantic truth.

### Commit

```bash
git add src/continuity-profile/validate.ts tests/continuity-profile.test.ts tests/continuity-profile-adversarial.test.ts
git commit -m "feat: validate continuity claims fail closed"
```

## Task 3 — Address claims without creating a new identity system

**Files:**
- Create `src/continuity-profile/address.ts`
- Extend `src/continuity-profile/index.ts`
- Extend `tests/continuity-profile.test.ts`

### RED

Require:

```ts
addressContinuityClaim(claim) -> `cty-<64 lowercase hex>`
verifyContinuityClaim(ref, claim) -> boolean
```

Use domain prefix:

```text
Project0-Continuity-v0.1|
```

Prove:

- key insertion order does not change address;
- array order remains semantically significant unless normalization explicitly sorts set-like fields;
- exact duplicate set members reject rather than being silently deduped;
- changing purpose, roots, environment, loss, uncertainty, or authority-continuity declaration changes the address;
- same visible output payload with different lineage produces different claim identity.

Expected RED: addressing seam absent.

### GREEN

Normalize only fields the spec declares set-like. Sort copies; never mutate caller input. Call existing `canonicalizeDomainValue("Project0-Continuity-v0.1|", normalizedClaim)` and prefix digest with `cty-`.

Do not add the prefix to global `DOMAIN_PREFIXES` unless implementation proves the shared enum is required; an experimental local prefix is preferable in v0.

### Commit

```bash
git add src/continuity-profile/address.ts src/continuity-profile/index.ts tests/continuity-profile.test.ts
git commit -m "feat: address continuity claims deterministically"
```

## Task 4 — Prove root closure and non-impersonation with frozen specimens

**Files:**
- Create `fixtures/continuity-profile/specimens.ts`
- Extend `tests/continuity-profile-adversarial.test.ts`
- Create `tests/continuity-profile-specimen.test.ts`

### RED

Build a fixture family with declared expected material roots and assertions for:

1. exact one-root continuation;
2. multi-root continuation;
3. omitted material root -> `MISSING_MATERIAL_ROOT`;
4. invented root -> `UNDECLARED_ROOT`;
5. runtime/decoder change disclosed as transformed context;
6. same roots + same purpose -> two different lawful output realizations;
7. explicit `lost` dimension;
8. explicit `unresolved` residual;
9. reconstruction that attempts historical occurrence identity -> reject;
10. copied/round-tripped claim remains only claim data and exposes no authority-capable API.

Introduce a pure conformance helper approximately:

```ts
checkContinuityClosure({
  claim,
  requiredMaterialRoots,
  allowedMaterialRoots,
}) -> { status: "conforming" | "refused"; reasonCodes: string[] }
```

Do not let the claim self-declare the only source of required roots in the same validation call; closure must be checked against independently supplied fixture/context evidence.

### GREEN

Implement the minimum pure closure checker, either in `validate.ts` or a small `conformance.ts` if separation is clearer after tests.

Prove the checker does not mutate the claim or root inputs.

### Commit

```bash
git add fixtures/continuity-profile/specimens.ts tests/continuity-profile-adversarial.test.ts tests/continuity-profile-specimen.test.ts src/continuity-profile
git commit -m "test: prove continuity root closure and non impersonation"
```

## Task 5 — Add local read models: Why Current? / Still Alive?

**Files:**
- Create `src/continuity-profile/inspect.ts`
- Extend `src/continuity-profile/index.ts`
- Extend `tests/continuity-profile.test.ts`

### RED

Specify pure read models:

```ts
deriveWhyCurrent(claim: ContinuityClaimV0): WhyCurrentProjection
deriveStillAlive(claim: ContinuityClaimV0): StillAliveProjection
```

`WhyCurrent` must return exact subject, purpose, ancestor roots, transformations, parent continuity refs, environment refs, outputs, and uncertainty sufficient to explain the claimed current projection.

`StillAlive` must return dimensions still preserved/transformed/unresolved, residual refs, and authority-continuity status without promoting `separately-evidenced` into validated authority.

Require deterministic ordering and frozen/plain projection data.

Refuse narrative generation, semantic inference, timestamp guessing, or hidden repository lookup.

### GREEN

Implement projections as transparent transformations of the validated claim. Do not add causal facts that are not present in the input.

### Commit

```bash
git add src/continuity-profile/inspect.ts src/continuity-profile/index.ts tests/continuity-profile.test.ts
git commit -m "feat: derive continuity explanation projections"
```

## Task 6 — Attack authority laundering and loss erasure

**Files:**
- Extend `tests/continuity-profile-adversarial.test.ts`
- Extend fixture family if needed

### RED cases

Prove all of the following fail or remain explicitly non-authoritative:

- `authorityContinuity: "separately-evidenced"` with no external authority validator cannot execute or validate authority;
- adding an `authorityRef`-looking string in notes/evidence does not change that;
- JSON/spread/`structuredClone` of a claim grants nothing;
- a claim that moves a known absent dimension from `lost` to `preserved` without changed independently supplied evidence fails the fixture's expected conformance;
- dropping an unresolved residual to make a cleaner story changes address and fails the expected fixture;
- perceptual/semantic similarity alone cannot satisfy an omitted required root;
- same bytes with different lineage remain distinct continuity claims.

### GREEN

Prefer tests and explicit conformance inputs over new production abstractions. Add production code only where a test exposes a structural gap.

### Commit

```bash
git add tests/continuity-profile-adversarial.test.ts fixtures/continuity-profile
git commit -m "test: block continuity authority laundering"
```

## Task 7 — Document the consumer boundary and run broad verification

**Files:**
- Create `docs/continuity-profile-v0.md`
- Update `docs/superpowers/plans/2026-08-19-continuity-witness-v0.md` only with observed implementation evidence after code exists
- Update `src/continuity-profile/index.ts` only if public exports need reconciliation

Document:

```text
continuity profile = portable claim/witness
continuity profile != warrant
continuity profile != identity provider
continuity profile != universal current-state service
```

Include mapping examples only as non-normative adapters:

- TranchNode boundary `preserved/differentiated/lost`;
- jublEchat `Why Current? / Still Alive`;
- Toaster candidate lineage;
- Corpus OS constituted-history projection.

Do not make any downstream repo depend on this first implementation PR.

Run:

```bash
npm run check
npm test
npm run verify:fixtures
npm run conformance
npm run verify:all
```

Expected: all existing and new gates pass.

Before declaring completion, run superpowers:verification-before-completion against the exact feature head and record actual counts/results, not expected counts.

### Commit

```bash
git add docs/continuity-profile-v0.md docs/superpowers/plans/2026-08-19-continuity-witness-v0.md src/continuity-profile
git commit -m "docs: bound continuity profile v0"
```

## Downstream Proof Gate — not part of this implementation PR

Do not immediately publish a shared package or require ecosystem adoption.

After Project 0 v0 is green, prove two adapters independently:

1. **TranchNode boundary specimen** maps one real `BoundaryTranchReceipt` into the Project 0 profile while preserving its stronger local `preserved/differentiated/lost/unresolved` law.
2. **A materially different product specimen** — preferably Corpus OS or jublEchat — maps a currentness/lineage witness without importing TranchNode or Project 0 execution semantics.

Only then decide whether shared adapter helpers are justified.

## Stop Condition

Stop when Project 0 can truthfully verify:

> **This is a deterministic, root-closed, purpose-relative claim that B continues from A under declared transformations and residuals. The claim explains its boundary, does not impersonate historical occurrence, and grants no authority.**

Do not proceed in this slice to portable warrants, legal succession, universal AI identity, cross-project storage, or automatic adoption.
