import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTINUITY_LANES,
  CONTINUITY_MODES,
} from "../src/continuity-profile";
import type {
  ContinuityClaimV0,
  ContinuityEnvironment,
  ContinuityLaneClaim,
  ContinuityLaneKind,
  ContinuityMode,
} from "../src/continuity-profile";

const expectedLanes = [
  "identity",
  "authority",
  "custody",
  "participants",
  "protocol",
  "text-schema",
  "purpose-meaning",
  "representation-story",
] as const;

const expectedModes = [
  "preserved",
  "transformed",
  "transferred",
  "reconstituted",
  "lost",
  "broken",
  "unresolved",
] as const;

const environment: ContinuityEnvironment = {
  decoderRef: "decoder:v1",
  runtimeRef: "runtime:v1",
  policyRefs: ["policy:one"],
  contextRefs: ["context:one"],
};

const lane: ContinuityLaneClaim = {
  lane: "protocol",
  mode: "transformed",
  dimensions: [{ dimension: "procedure", evidenceRefs: ["evidence:one"] }],
  transformationRefs: ["transform:one"],
  residualRefs: ["residual:one"],
  uncertainty: [],
  doesNotEstablish: ["identity", "authority"],
};

const claim: ContinuityClaimV0 = {
  schema: "p0.continuity/0.1",
  purpose: "test portable typed continuity",
  subjectRef: "subject:b",
  ancestorRoots: ["root:a"],
  environment,
  lanes: [lane],
  outputRefs: ["output:b"],
  parentContinuityRefs: [],
  occurrenceClaim: "continuation-only",
};

const laneTypeProof: ContinuityLaneKind = claim.lanes[0].lane;
const modeTypeProof: ContinuityMode = claim.lanes[0].mode;
void laneTypeProof;
void modeTypeProof;

test("exports the eight exact typed continuity lanes", () => {
  assert.deepEqual(CONTINUITY_LANES, expectedLanes);
});

test("exports the seven exact continuity modes", () => {
  assert.deepEqual(CONTINUITY_MODES, expectedModes);
});

test("typed continuity claim preserves the bounded v0 record shape", () => {
  assert.equal(claim.schema, "p0.continuity/0.1");
  assert.equal(claim.occurrenceClaim, "continuation-only");
  assert.equal(claim.lanes[0].lane, "protocol");
  assert.equal(claim.lanes[0].mode, "transformed");
  assert.deepEqual(claim.lanes[0].doesNotEstablish, ["identity", "authority"]);
});
