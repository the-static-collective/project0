# Continuity Triangle Conformance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pressure-test the existing Project0 Typed Continuity Braid against TranchNode and Corpus OS donor witnesses without importing donor runtime law or widening authority.

**Architecture:** Keep the entire first proof in `fixtures/` + tests. Checked-in donor snapshots are exact synthetic representations of landed donor behavior. A fixture-local adapter maps each donor into an existing `ContinuityClaimV0`, preserving donor-specific distinctions through namespaced continuity dimensions and explicit residual/gap reporting. `src/continuity-profile/*` remains unchanged unless a failing test proves the existing grammar cannot represent a required distinction.

**Tech Stack:** TypeScript 7, Node `node:test`, existing `src/continuity-profile` API, existing canonicalization admission, GitHub Actions `npm run verify:all`.

**Spec:** `docs/superpowers/specs/2026-08-20-continuity-triangle-conformance-design.md`

## Global Constraints

- No donor package/runtime dependency.
- No TranchNode transition execution.
- No Corpus WorldCut derivation or warrant validation/consumption.
- No new universal Continuity service/runtime/event bus.
- No new ontology kind, continuity lane, or continuity mode in the first pass.
- No production continuity change unless an actual grammar gap is first proven RED.
- Authority-shaped evidence remains inert and must never create a Project0 authority lane.
- Semantic similarity cannot manufacture preserved continuity.
- Deterministic addressing must reuse `addressContinuityClaim`.

---

### Task 1: Check in exact donor snapshots and RED contract

**Files:**
- Create: `fixtures/continuity-profile/triangle-donors.ts`
- Create: `tests/continuity-profile-triangle-conformance.test.ts`

**Interfaces:**
- Consumes: landed donor output shapes described by Project0 issue #56.
- Produces: exported `tranchNodeBoundaryWitness`, `corpusContinuityAttestation`, hostile variants, and tests that import missing mapping functions from `fixtures/continuity-profile/triangle-conformance.ts`.

- [ ] **Step 1: Add data-only donor snapshots**

Create typed-as-const snapshots with:

```ts
export const tranchNodeBoundaryWitness = {
  schema: "tranchnode/continuity-boundary-witness/v0.1",
  spineId: "spine:intent-stroke",
  fromStageId: "intent-stroke-v0.1",
  toStageId: "intent-stroke-v0.2",
  originRef: "intent-stroke:v0.1",
  presentRef: "intent-stroke:v0.2",
  preserved: [
    "decoder-authority:none",
    "interface:intent-stroke-stdio-v0.1",
    "responsibility:canonical-layout-binding",
    "transport-authority:none",
  ],
  differentiated: [
    "interface:intent-stroke-stdio-v0.2",
    "layout-binding:tranchnode",
  ],
  lost: ["dependency:caller-constructs-fieldLayoutRef"],
  unresolved: ["collision-policy:unresolved"],
  completedTransferIds: ["transfer:canonical-layout-binding-to-tranchnode"],
  transitionWitnessRefs: ["transition:intent-stroke-v01-v02"],
  authority: "none",
  occurrenceClaim: "transition-witness-only",
} as const;
```

Create a Corpus snapshot with exact preserved refs, one transform edge, one loss edge, one unresolved ref, prior `session-refused`, current `completed` + `host-failed`, matching orphan observation, authority-cut change, separate authority evidence, and `legalValidity: "unclaimed"`.

- [ ] **Step 2: Write the failing conformance tests**

Import:

```ts
import {
  mapCorpusContinuityAttestation,
  mapTranchNodeBoundaryWitness,
} from "../fixtures/continuity-profile/triangle-conformance";
```

Test the required behaviors:

```ts
test("TranchNode donor preserves four boundary classes without authority", () => {
  const result = mapTranchNodeBoundaryWitness(tranchNodeBoundaryWitness);
  assert.equal(result.grammarGap, "NO_GAP");
  assert.equal(result.claim.lanes.some((lane) => lane.lane === "authority"), false);
  assert.deepEqual(
    result.claim.lanes[0].dimensions.map((d) => d.dimension),
    [
      "tranchnode.preserved",
      "tranchnode.differentiated",
      "tranchnode.lost",
      "tranchnode.unresolved",
      "tranchnode.transition-witness",
    ],
  );
});
```

Add Corpus class/history/orphan/authority tests, omitted-loss control, authority-laundering rejection, semantic-lookalike control, and deterministic address equality.

- [ ] **Step 3: Run RED**

Run: `npm run verify:all`

Expected: FAIL because `fixtures/continuity-profile/triangle-conformance.ts` does not exist. Existing suites should compile/run only until that boundary.

- [ ] **Step 4: Commit RED state and open a draft PR**

Record exact head and Actions run in the PR body.

---

### Task 2: Implement the minimum fixture-local adapters

**Files:**
- Create: `fixtures/continuity-profile/triangle-conformance.ts`
- Test: `tests/continuity-profile-triangle-conformance.test.ts`

**Interfaces:**
- Consumes: `unknown` donor representations.
- Produces:

```ts
export type TriangleConformanceResult = {
  donor: "tranchnode" | "corpus-os";
  grammarGap: "NO_GAP" | "BOUNDED_GAP";
  claim: ContinuityClaimV0;
  residuals: Array<{
    dimension: string;
    evidenceRefs: string[];
    note: string;
  }>;
};

export function mapTranchNodeBoundaryWitness(value: unknown): TriangleConformanceResult;
export function mapCorpusContinuityAttestation(value: unknown): TriangleConformanceResult;
```

- [ ] **Step 1: Admit representation before semantic reads**

Call `validateForCanonicalization(value)` first. Then enforce exact top-level donor keys and required literal schema/boundary values. Reject unknown fields.

- [ ] **Step 2: Map TranchNode using existing braid only**

Build one `ContinuityClaimV0` with:

```ts
{
  schema: "p0.continuity/0.1",
  purpose: "tranchnode-boundary-continuity",
  subjectRef: donor.presentRef,
  ancestorRoots: [donor.originRef],
  environment: {
    policyRefs: [],
    contextRefs: [...donor.transitionWitnessRefs, ...donor.completedTransferIds],
  },
  lanes: [{
    lane: "representation-story",
    mode: "transformed",
    dimensions: [
      { dimension: "tranchnode.preserved", evidenceRefs: donor.preserved },
      { dimension: "tranchnode.differentiated", evidenceRefs: donor.differentiated },
      { dimension: "tranchnode.lost", evidenceRefs: donor.lost },
      { dimension: "tranchnode.unresolved", evidenceRefs: donor.unresolved },
      { dimension: "tranchnode.transition-witness", evidenceRefs: donor.transitionWitnessRefs },
    ],
    transformationRefs: [...donor.completedTransferIds, ...donor.transitionWitnessRefs],
    residualRefs: [...donor.lost, ...donor.unresolved],
    uncertainty: [...donor.unresolved],
    doesNotEstablish: ["authority"],
  }],
  outputRefs: [donor.presentRef],
  parentContinuityRefs: [],
  occurrenceClaim: "continuation-only",
}
```

Reject unless donor `authority === "none"` and `occurrenceClaim === "transition-witness-only"`.

- [ ] **Step 3: Map Corpus without creating authority continuity**

Build one `representation-story` lane. Create one namespaced dimension per transform/loss edge so the edge evidence remains attached, plus separate dimensions for preserved/unresolved refs, each terminal disposition, each orphan side, authority-cut change, and legal-validity-unclaimed.

Place authority evidence refs only in `environment.contextRefs`. Require `doesNotEstablish: ["authority"]`; do not emit an authority lane.

- [ ] **Step 4: Validate mapped claims and derive NO_GAP**

Call `validateContinuityClaim(claim)` before returning. If a required donor dimension cannot be represented without dropping information, return `grammarGap: "BOUNDED_GAP"` with an explicit residual rather than coercing it.

- [ ] **Step 5: Run GREEN**

Run: `npm run verify:all`

Expected: new triangle tests pass and every pre-existing Project0 gate remains green.

- [ ] **Step 6: Commit minimal implementation**

Commit only the fixture-local adapter.

---

### Task 3: Riqor hostile-boundary review and hardening

**Files:**
- Modify only if a real review finding is reproduced first in `tests/continuity-profile-triangle-conformance.test.ts`.
- Modify `fixtures/continuity-profile/triangle-conformance.ts` only after that RED.

**Interfaces:**
- Consumes: exact diff after Task 2.
- Produces: regressions for any representation, authority, determinism, or semantic-coercion finding.

- [ ] **Step 1: Review exact diff for authority/coupling drift**

Check that:

- no `src/` file changed;
- no donor runtime/package dependency exists;
- no authority lane can be emitted from donor authority evidence;
- unknown donor fields fail closed;
- accessor/sparse input cannot execute before rejection;
- `session-refused` and `host-failed` remain separate dimension names;
- orphan observations never enter the preserved dimension;
- omitted loss never enters preserved;
- string similarity is never consulted;
- mapped claim address is stable under caller array ordering where donor semantics are set-like.

- [ ] **Step 2: For each valid finding, add RED first**

Run only the triangle test while iterating:

`npm run build && node --test .build/tests/continuity-profile-triangle-conformance.test.js`

Then run full `npm run verify:all` after the fix.

- [ ] **Step 3: Commit hardening separately**

Record RED/GREEN evidence in the PR body.

---

### Task 4: Exact-head completion gate

**Files:**
- Update PR body only.

**Interfaces:**
- Consumes: exact final branch head and CI/review state.
- Produces: ready-for-review PR or an evidenced blocker.

- [ ] **Step 1: Run fresh full verification on exact head**

Required command: `npm run verify:all` through GitHub Actions.

- [ ] **Step 2: Verify changed-file boundary**

Expected first-pass boundary:

- `docs/superpowers/specs/2026-08-20-continuity-triangle-conformance-design.md`
- `docs/superpowers/plans/2026-08-20-continuity-triangle-conformance.md`
- `fixtures/continuity-profile/triangle-donors.ts`
- `fixtures/continuity-profile/triangle-conformance.ts`
- `tests/continuity-profile-triangle-conformance.test.ts`

No `src/` file should change unless a real grammar gap required a separately reviewed design decision.

- [ ] **Step 3: Update PR evidence**

State:

- exact base/head;
- RED and GREEN run IDs;
- final new-test count;
- whether result is `NO_GAP` or `BOUNDED_GAP`;
- hostile controls proven;
- compatibility effect: fixture-only, no runtime/ontology/authority change.

- [ ] **Step 4: Mark ready and stop before merge**

Request fresh exact-head landing authorization per PR Completion policy.
