import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTINUITY_LANES,
  CONTINUITY_MODES,
  addressContinuityClaim,
  normalizeContinuityClaim,
  verifyContinuityClaim,
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
  policyRefs: ["policy:two", "policy:one"],
  contextRefs: ["context:two", "context:one"],
};

const lane: ContinuityLaneClaim = {
  lane: "protocol",
  mode: "transformed",
  dimensions: [
    { dimension: "procedure-b", evidenceRefs: ["evidence:two", "evidence:one"] },
    { dimension: "procedure-a", evidenceRefs: ["evidence:four", "evidence:three"] },
  ],
  transformationRefs: ["transform:two", "transform:one"],
  residualRefs: ["residual:two", "residual:one"],
  uncertainty: ["uncertainty:two", "uncertainty:one"],
  doesNotEstablish: ["identity", "authority"],
};

const claim: ContinuityClaimV0 = {
  schema: "p0.continuity/0.1",
  purpose: "test portable typed continuity",
  subjectRef: "subject:b",
  ancestorRoots: ["root:b", "root:a"],
  environment,
  lanes: [
    lane,
    {
      lane: "text-schema",
      mode: "preserved",
      dimensions: [{ dimension: "schema", evidenceRefs: ["evidence:schema"] }],
      transformationRefs: [],
      residualRefs: [],
      uncertainty: [],
      doesNotEstablish: ["identity"],
    },
  ],
  outputRefs: ["output:two", "output:one"],
  parentContinuityRefs: ["cty-parent-b", "cty-parent-a"],
  occurrenceClaim: "continuation-only",
};

function cloneClaim(): ContinuityClaimV0 {
  return structuredClone(claim);
}

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

test("normalization sorts only set-like fields and does not mutate input", () => {
  const input = cloneClaim();
  const before = structuredClone(input);
  const normalized = normalizeContinuityClaim(input);

  assert.deepEqual(input, before);
  assert.deepEqual(normalized.ancestorRoots, ["root:a", "root:b"]);
  assert.deepEqual(normalized.environment.policyRefs, ["policy:one", "policy:two"]);
  assert.deepEqual(normalized.lanes.map((item) => item.lane), ["protocol", "text-schema"]);
  assert.deepEqual(normalized.lanes[0].dimensions.map((item) => item.dimension), ["procedure-a", "procedure-b"]);
  assert.deepEqual(normalized.lanes[0].dimensions[1].evidenceRefs, ["evidence:one", "evidence:two"]);
});

test("set-like input ordering does not change continuity address", () => {
  const shuffled = cloneClaim();
  shuffled.ancestorRoots.reverse();
  shuffled.environment.policyRefs.reverse();
  shuffled.environment.contextRefs.reverse();
  shuffled.outputRefs.reverse();
  shuffled.parentContinuityRefs.reverse();
  shuffled.lanes.reverse();
  const protocol = shuffled.lanes.find((item) => item.lane === "protocol")!;
  protocol.dimensions.reverse();
  protocol.dimensions.forEach((dimension) => dimension.evidenceRefs.reverse());
  protocol.transformationRefs.reverse();
  protocol.residualRefs.reverse();
  protocol.uncertainty.reverse();
  protocol.doesNotEstablish.reverse();

  assert.equal(addressContinuityClaim(claim), addressContinuityClaim(shuffled));
});

test("continuity address is local, deterministic, and exactly verifiable", () => {
  const ref = addressContinuityClaim(claim);
  assert.match(ref, /^cty-[0-9a-f]{64}$/);
  assert.equal(verifyContinuityClaim(ref, claim), true);
  assert.equal(verifyContinuityClaim(`cty-${"0".repeat(64)}`, claim), false);
  assert.equal(verifyContinuityClaim("cty-not-a-digest", claim), false);
});

test("material continuity changes produce distinct addresses", () => {
  const base = addressContinuityClaim(claim);
  const mutations: Array<(value: ContinuityClaimV0) => void> = [
    (value) => { value.purpose = "different purpose"; },
    (value) => { value.ancestorRoots[0] = "root:different"; },
    (value) => { value.environment.runtimeRef = "runtime:v2"; },
    (value) => { value.lanes[0].mode = "reconstituted"; },
    (value) => { value.lanes[0].dimensions[0].evidenceRefs[0] = "evidence:different"; },
    (value) => { value.lanes[0].residualRefs.push("residual:new"); },
    (value) => { value.lanes[0].uncertainty.push("uncertainty:new"); },
    (value) => { value.lanes[0].doesNotEstablish.push("custody"); },
    (value) => { value.parentContinuityRefs.push("cty-parent-c"); },
  ];

  for (const mutate of mutations) {
    const changed = cloneClaim();
    mutate(changed);
    assert.notEqual(addressContinuityClaim(changed), base);
  }
});

test("same visible outputs with different ancestry remain distinct continuity claims", () => {
  const alternate = cloneClaim();
  alternate.ancestorRoots = ["root:other-a", "root:other-b"];
  assert.deepEqual(alternate.outputRefs, claim.outputRefs);
  assert.notEqual(addressContinuityClaim(alternate), addressContinuityClaim(claim));
});
