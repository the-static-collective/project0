# Typed Continuity Braid v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use superpowers:test-driven-development for every production-code task and superpowers:verification-before-completion before any completion claim.

**Goal:** Implement the smallest offline Project 0 Typed Continuity Braid that can make deterministic, purpose-relative, root-closed claims about which kinds of continuity crossed a boundary, preserve explicit breakage and reconstitution, refuse cross-lane genealogy laundering, and never manufacture authority.

**Architecture:** Add one experimental `src/continuity-profile/` seam. The seam owns portable lane grammar, structural validation, deterministic addressing, explicit conformance/refusal checks, and transparent read models. Reuse Project 0 canonicalization; do not modify the frozen ontology, canonical receipt family, reference-kernel authority semantics, or downstream repositories. Non-transitivity is executable: a stronger long-line claim must be a new explicit claim over the same lane, its parent refs, and its material roots.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, existing `validateForCanonicalization(...)` and `canonicalizeDomainValue(...)`, existing Project 0 verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-continuity-witness-v0-design.md` and GitHub issue #8.

## Global Constraints

- Protocol is exactly `p0.continuity/0.1`.
- Address domain prefix is local to this experimental seam: `Project0-Continuity-v0.1|`.
- Continuity refs are `cty-<64 lowercase hex>`.
- Portable lane kinds are exactly: `identity`, `authority`, `custody`, `participants`, `protocol`, `text-schema`, `purpose-meaning`, `representation-story`.
- Portable modes are exactly: `preserved`, `transformed`, `transferred`, `reconstituted`, `lost`, `broken`, `unresolved`.
- Each lane appears at most once in one claim. A lane chooses exactly one mode; slash-separated or blended modes fail validation.
- Downstream dimensions remain open strings. Project 0 does not decide whether a domain-specific dimension is true or important.
- Continuity is purpose-relative and non-transitive by default.
- Evidence for one lane never silently establishes another lane.
- A `broken` or `lost` parent lane cannot silently become `preserved`, `transformed`, or `transferred` in an uninterrupted composed claim.
- `reconstituted` remains distinct from `preserved`; normalization never collapses them.
- Material root closure is checked against independently supplied context, not only against roots self-declared by the claim.
- `occurrenceClaim` is exactly `continuation-only`.
- Authority is represented only as a continuity lane backed by evidence refs. Project 0 never admits, executes, renews, validates, or mints the referenced authority.
- Copying, JSON round-tripping, serialization, retrieval, or transport of a claim grants no capability.
- No global Continuity service, registry, database, event bus, identity provider, current-state daemon, UI, network dependency, model, scheduler, or historical truth engine.
- No new ontology kind, universal relationship type, or canonical receipt family.
- Do not add the continuity prefix to global `DOMAIN_PREFIXES` in v0.
- Reuse `validateForCanonicalization(...)` and `canonicalizeDomainValue(...)`; do not create a second canonicalizer or hasher.
- Existing NAV, World Encounter, Snap-State, L-Branch, witness-residue, reference-kernel, and authority semantics remain unchanged.
- Existing Project 0 artifacts remain valid without a continuity claim.
- Broad verification gate is `npm run verify:all`.

## File Structure

- `src/continuity-profile/types.ts` — frozen v0 lane, mode, claim, and projection types.
- `src/continuity-profile/validate.ts` — descriptor-safe, fail-closed structural validation.
- `src/continuity-profile/address.ts` — deterministic normalization, addressing, and verification.
- `src/continuity-profile/conformance.ts` — root closure, lane establishment, and explicit composition/refusal checks.
- `src/continuity-profile/inspect.ts` — pure `Why Current?` / `Still Alive?` projections.
- `src/continuity-profile/index.ts` — bounded public experimental exports.
- `fixtures/continuity-profile/specimens.ts` — frozen positive, plural, gap, authority, and false-genealogy specimens.
- `tests/continuity-profile.test.ts` — public contract, addressing, and read-model tests.
- `tests/continuity-profile-adversarial.test.ts` — hostile representation, authority laundering, root erasure, and cross-lane attacks.
- `tests/continuity-profile-specimen.test.ts` — deterministic frozen specimen, plurality, break/reconstitution, and non-transitivity proofs.
- `docs/continuity-profile-v0.md` — consumer boundary and non-normative adapter guidance.

---

## Task 1 — Freeze the typed braid contract before behavior

**Files:** Create `src/continuity-profile/types.ts`, `src/continuity-profile/index.ts`, `tests/continuity-profile.test.ts`.

- [ ] **RED:** Add compile/runtime tests requiring the public records below and proving the continuity module imports no downstream repository code or host/network/model libraries.

```ts
export const CONTINUITY_LANES = [
  "identity",
  "authority",
  "custody",
  "participants",
  "protocol",
  "text-schema",
  "purpose-meaning",
  "representation-story",
] as const;
export type ContinuityLaneKind = typeof CONTINUITY_LANES[number];

export const CONTINUITY_MODES = [
  "preserved",
  "transformed",
  "transferred",
  "reconstituted",
  "lost",
  "broken",
  "unresolved",
] as const;
export type ContinuityMode = typeof CONTINUITY_MODES[number];

export type ContinuityDimension = {
  dimension: string;
  evidenceRefs: string[];
  note?: string;
};

export type ContinuityLaneClaim = {
  lane: ContinuityLaneKind;
  mode: ContinuityMode;
  dimensions: ContinuityDimension[];
  transformationRefs: string[];
  residualRefs: string[];
  uncertainty: string[];
  doesNotEstablish: ContinuityLaneKind[];
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
  environment: ContinuityEnvironment;
  lanes: ContinuityLaneClaim[];
  outputRefs: string[];
  parentContinuityRefs: string[];
  occurrenceClaim: "continuation-only";
};
```

- [ ] Run `npm run check`. Expected RED: module/exports missing.
- [ ] **GREEN:** Add only these records/constants and bounded index exports. Do not add runtime behavior yet.
- [ ] Run `npm run check` and the focused compiled test.
- [ ] Commit: `feat: define typed continuity braid v0 contract`.

---

## Task 2 — Validate hostile representations and lane-local semantics fail closed

**Files:** Create `src/continuity-profile/validate.ts`; extend `tests/continuity-profile.test.ts`; create `tests/continuity-profile-adversarial.test.ts`.

- [ ] **RED:** Specify `validateContinuityClaim(value: unknown): ContinuityClaimV0`.
- [ ] Require `validateForCanonicalization(value)` to run before semantic property reads so getters/accessors are rejected rather than executed.
- [ ] Reject wrong schema; missing/empty `purpose`, `subjectRef`, or roots; custom prototypes; accessors; symbols; functions; `undefined`; cycles; sparse arrays; unsafe canonical values; malformed nested records; unknown top-level keys.
- [ ] Reject duplicate ancestor roots, outputs, parent refs, lanes, dimensions within a lane, evidence refs, transformation refs, residual refs, uncertainty strings, policy refs, context refs, or `doesNotEstablish` refs where duplication would hide structure.
- [ ] Reject unknown lane kinds and modes. Explicitly test `broken/unresolved` and `preserved/transformed` as invalid modes.
- [ ] Reject an empty lane list, empty dimension names, empty evidence-ref lists, and a lane that lists itself in `doesNotEstablish`.
- [ ] Reject `occurrenceClaim` values other than `continuation-only`.
- [ ] Reject an undeclared convenience field such as top-level `authorityRef`; evidence must live inside a typed lane dimension.
- [ ] Run `npm run build && node --test .build/tests/continuity-profile-adversarial.test.js`. Expected RED: validator absent.
- [ ] **GREEN:** Implement descriptor-safe structural validation using existing canonicalization defenses. Do not infer semantic truth, legal identity, or authority.
- [ ] Re-run focused tests and `npm run check`.
- [ ] Commit: `feat: validate typed continuity claims fail closed`.

---

## Task 3 — Address braid claims deterministically without creating an identity service

**Files:** Create `src/continuity-profile/address.ts`; extend `src/continuity-profile/index.ts` and `tests/continuity-profile.test.ts`.

- [ ] **RED:** Specify `normalizeContinuityClaim(value)`, `addressContinuityClaim(value)`, and `verifyContinuityClaim(ref, value)`.
- [ ] Normalize by sorting copies of set-like fields: ancestor roots, policy/context refs, outputs, parent refs, lanes by lane name, dimensions by dimension name, dimension evidence refs, transformation refs, residual refs, uncertainty, and `doesNotEstablish`. Never mutate caller input and never silently deduplicate.
- [ ] Prove insertion order and set-like input order do not change an address.
- [ ] Prove purpose, roots, environment/decoder/runtime, lane mode, evidence, residuals, uncertainty, explicit non-establishment declarations, and lineage changes do change the address.
- [ ] Prove identical visible output refs with different ancestry yield different continuity refs.
- [ ] **GREEN:** Validate first, normalize copies, then call `canonicalizeDomainValue("Project0-Continuity-v0.1|", normalizedClaim)` and return `cty-${digestHex}`. Verification requires exact `cty-[0-9a-f]{64}` plus recomputation.
- [ ] Do not modify global `DOMAIN_PREFIXES`.
- [ ] Run focused tests and `npm run check`.
- [ ] Commit: `feat: address typed continuity braid deterministically`.

---

## Task 4 — Prove material root closure from independent context

**Files:** Create `src/continuity-profile/conformance.ts`, `fixtures/continuity-profile/specimens.ts`, `tests/continuity-profile-specimen.test.ts`; extend adversarial tests and public exports.

- [ ] **RED:** Freeze these local reason codes:

```ts
export type ContinuityConformanceReason =
  | "MISSING_MATERIAL_ROOT"
  | "UNDECLARED_ROOT"
  | "MISSING_PARENT_CONTINUITY"
  | "MISSING_PARENT_ROOT"
  | "LANE_MISMATCH"
  | "BROKEN_PARENT_LANE"
  | "LOST_PARENT_LANE";

export type ContinuityConformanceResult = {
  status: "conforming" | "refused";
  reasonCodes: ContinuityConformanceReason[];
};
```

- [ ] Specify `checkContinuityClosure({ claim, requiredMaterialRoots, allowedMaterialRoots })`.
- [ ] A required material root absent from the claim returns `MISSING_MATERIAL_ROOT`; a declared root outside independently allowed roots returns `UNDECLARED_ROOT`.
- [ ] The helper must not mutate claim or root inputs, and reason ordering must be deterministic.
- [ ] Freeze specimens for exact one-root continuity, multi-root continuity, omitted-root refusal, invented-root refusal, and two distinct lawful realizations sharing roots/purpose.
- [ ] **GREEN:** Implement the smallest pure closure checker. Do not let the claim determine the only source of required/allowed roots.
- [ ] Run focused specimen/adversarial tests.
- [ ] Commit: `feat: enforce continuity material root closure`.

---

## Task 5 — Make non-transitivity executable and preserve lawful reconstitution

**Files:** Extend `src/continuity-profile/conformance.ts`, fixtures, specimen tests, adversarial tests, and public exports.

- [ ] **RED:** Freeze a `representation-story/preserved` parent that explicitly does not establish identity/authority/participants, a separate `participants/preserved` parent, and a proposed `identity/preserved` descendant that cites both.
- [ ] Freeze a `protocol/broken` parent with surviving residual evidence and a later `protocol/reconstituted` descendant.
- [ ] Specify:

```ts
claimEstablishesLane(claim: ContinuityClaimV0, lane: ContinuityLaneKind): boolean

checkLaneComposition({
  proposedClaim,
  lane,
  parents,
}: {
  proposedClaim: ContinuityClaimV0;
  lane: ContinuityLaneKind;
  parents: Array<{ ref: string; claim: ContinuityClaimV0 }>;
}): ContinuityConformanceResult
```

- [ ] `claimEstablishesLane` is true only when that exact lane is declared and is not contradicted by that lane's explicit `doesNotEstablish`; it never promotes another lane.
- [ ] Composition requires a new explicit proposed claim; the library never auto-creates or infers one.
- [ ] Every supplied parent ref must be in `parentContinuityRefs`; missing parent refs return `MISSING_PARENT_CONTINUITY`.
- [ ] Proposed ancestry must close over all parent material roots; missing inherited roots return `MISSING_PARENT_ROOT`.
- [ ] Every parent used for composition must carry the same requested lane. Cross-lane evidence returns `LANE_MISMATCH`.
- [ ] If the proposed mode is `preserved`, `transformed`, or `transferred`, a same-lane `broken` parent returns `BROKEN_PARENT_LANE` and a same-lane `lost` parent returns `LOST_PARENT_LANE`.
- [ ] A broken same-lane parent may support a new explicit `reconstituted` claim when roots/parents close. Reconstitution must remain address-distinct from uninterrupted preservation.
- [ ] Directly prove `representation-story + participants` cannot manufacture `identity`, and story continuity cannot manufacture authority.
- [ ] Do not export any `composeClaims`, `inferLane`, or automatic genealogy builder.
- [ ] **GREEN:** Implement only the pure checks necessary for these proofs.
- [ ] Run focused tests.
- [ ] Commit: `feat: refuse transitive continuity laundering`.

---

## Task 6 — Add transparent Why Current? / Still Alive? read models and authority hostility

**Files:** Create `src/continuity-profile/inspect.ts`; extend types, fixtures, tests, and index exports.

- [ ] **RED:** Freeze an authority-evidence specimen with a typed `authority/transferred` lane whose dimension cites `external:warrant-17`, plus a separate `custody/transferred` specimen containing a warrant-looking note but no authority lane.
- [ ] Specify projections:

```ts
export type WhyCurrentProjection = {
  subjectRef: string;
  purpose: string;
  ancestorRoots: string[];
  parentContinuityRefs: string[];
  environment: ContinuityEnvironment;
  outputRefs: string[];
  lanes: ContinuityLaneClaim[];
};

export type StillAliveProjection = {
  continuing: ContinuityLaneClaim[];
  unresolved: ContinuityLaneClaim[];
  ended: ContinuityLaneClaim[];
  residualRefs: string[];
  authority: {
    declaredMode: ContinuityMode | null;
    evidenceRefs: string[];
    portableEffect: "none";
    externalAdmissionRequired: true;
  };
};
```

- [ ] `deriveWhyCurrent` returns exact attributable claim data only; no narrative generation, timestamp guessing, semantic similarity, repository lookup, or hidden inference.
- [ ] `deriveStillAlive` places `preserved`, `transformed`, `transferred`, and `reconstituted` lanes in `continuing`; `unresolved` in `unresolved`; `lost` and `broken` in `ended`; residual refs are unioned deterministically without erasure.
- [ ] An authority lane may be reported as continuity evidence, but `portableEffect` is always `none` and `externalAdmissionRequired` is always true.
- [ ] A custody lane containing an authority-looking string does not establish the authority lane.
- [ ] JSON/spread/`structuredClone` of a claim still exposes no authority-capable API.
- [ ] **GREEN:** Implement projections as frozen/plain deterministic transformations of a validated/normalized claim.
- [ ] Run focused tests.
- [ ] Commit: `feat: derive typed continuity read models`.

---

## Task 7 — Attack historical impersonation, loss erasure, and authority laundering

**Files:** Extend `tests/continuity-profile-adversarial.test.ts` and frozen fixtures; add production code only if a structural test exposes a gap.

- [ ] Prove changing a known `broken` or `reconstituted` lane into `preserved` changes the address and fails uninterrupted same-lane composition against the broken parent.
- [ ] Prove deleting a residual to create a cleaner story changes the address.
- [ ] Prove semantic/perceptual similarity notes cannot satisfy a missing material root.
- [ ] Prove decoder/runtime drift changes claim identity when environment differs.
- [ ] Prove same output refs with different lineage remain distinct.
- [ ] Prove shared representation/story plus later participants cannot satisfy institutional identity.
- [ ] Prove authority-looking evidence under custody, protocol, identity, purpose, or representation does not establish authority.
- [ ] Prove no public export named `grantAuthority`, `executeAuthority`, `admitWarrant`, `composeClaims`, or `inferLane` exists.
- [ ] Run adversarial and specimen tests.
- [ ] Commit: `test: attack typed continuity impersonation`.

---

## Task 8 — Document the consumer boundary and run broad verification

**Files:** Create `docs/continuity-profile-v0.md`; reconcile `src/continuity-profile/index.ts` only if public exports require it.

- [ ] Document exact sections: `Core law`, `Portable lanes`, `Modes`, `Non-transitivity`, `Witness not warrant`, `Gaps and reconstitution`, `Continuity Spine boundary`, `Non-normative adapter direction`.
- [ ] State explicitly: Braid asks **what kinds of continuity crossed this boundary?** Spine asks **when may staged overlap, transfer, witness, and shedding move responsibility between carriers?**
- [ ] State explicitly that downstream adoption is not part of this implementation PR.
- [ ] Document TranchNode, Corpus OS, National Treasure, Toaster, and other mappings only as non-normative direction; Project 0 imports none of them.
- [ ] Build and inspect the public export surface:

```bash
npm run build
node - <<'NODE'
const api = require("./.build/src/continuity-profile/index.js");
for (const forbidden of ["grantAuthority", "executeAuthority", "admitWarrant", "composeClaims", "inferLane"]) {
  if (forbidden in api) throw new Error(`forbidden export: ${forbidden}`);
}
console.log(Object.keys(api).sort().join("\n"));
NODE
```

- [ ] Run `npm run check`.
- [ ] Run `npm test`.
- [ ] Run `npm run verify:fixtures`.
- [ ] Run `npm run conformance`.
- [ ] Run `npm run verify:all`.
- [ ] Invoke superpowers:verification-before-completion against the exact feature head and record actual command results before any completion claim.
- [ ] Commit: `docs: bound typed continuity braid v0`.

## Downstream Proof Gate — not part of this implementation plan

After Project 0 v0 is green, prove adapters independently rather than making the first runtime slice ecosystem-wide:

1. **TranchNode:** map one real boundary specimen into Typed Continuity Braid without weakening TranchNode's stronger local lineage/residual laws.
2. **Corpus OS:** map one real Continuity Attestation / WorldCut succession specimen and prove that a braid can explain authority continuity evidence without performing succession or admitting a warrant.
3. **National Treasure:** use historical cases as adversarial research/test pressure for false genealogy, revival, property succession, symbolic inheritance, and broken institutional lines; never treat the research repo as substrate authority.

Only after at least two materially different adapters work without semantic weakening should Project 0 consider shared adapter helpers or graduation from experimental status.

## Stop Condition

Stop this implementation slice when Project 0 can truthfully verify:

> **This is a deterministic, root-closed, purpose-relative Typed Continuity Braid. Every claimed lane is explicit. Evidence in one lane cannot silently manufacture a stronger genealogy in another. Breakage and lawful reconstitution remain visible. Reconstruction does not impersonate occurrence. The witness grants no authority.**

Do not proceed in this slice to portable warrants, legal succession, global identity, cross-project storage, automatic adoption, or a universal continuity registry.
