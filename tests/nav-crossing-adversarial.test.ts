import assert from "node:assert/strict";
import test from "node:test";

import {
  addressNavRecord,
  compareFrameDeclarations,
  createNavCrossingReceipt,
} from "../src/nav-crossing/index";

const frame = {
  frameRef: "frame-A",
  constitutionRef: "constitution-1",
  authorityRefs: ["lease-1"],
  decoderRef: "decoder-1",
  evidenceRefs: ["witness-1"],
  participantRef: "participant-1",
  particularityAnchors: { "goal:G": "artifact-A" },
};

const crossing = {
  crossingRef: "crossing-1",
  kind: "room_crossing" as const,
  declaredPurpose: "compare declared frame change",
  evidenceRefs: ["witness-crossing-1"],
};

test("refusal evidence remains frame-relative and creates no route recommendation", () => {
  const refusedCrossing = {
    ...crossing,
    crossingRef: "attempt-A-to-X-under-frame-F",
    evidenceRefs: ["reason:AUTHORITY_SCOPE_MISMATCH"],
  };

  const result = createNavCrossingReceipt(frame, refusedCrossing, frame);
  const serialized = JSON.stringify(result.receipt.body);

  assert.match(serialized, /AUTHORITY_SCOPE_MISMATCH/);
  assert.doesNotMatch(serialized, /impossible_everywhere/);
  assert.doesNotMatch(serialized, /alternate_authority/);
  assert.doesNotMatch(serialized, /minimum_world_change/);
});

test("visible residue does not synthesize authority", () => {
  const before = {
    ...structuredClone(frame),
    authorityRefs: [],
    evidenceRefs: ["refusal-residue-1"],
  };
  const after = structuredClone(before);

  const result = compareFrameDeclarations(before, crossing, after);
  const authority = result.observations.find((item) => item.dimension === "authority");
  const evidence = result.observations.find((item) => item.dimension === "evidence");

  assert.equal(authority?.disposition, "preserved");
  assert.deepEqual(authority?.beforeRefs, []);
  assert.deepEqual(authority?.afterRefs, []);
  assert.equal(evidence?.disposition, "preserved");
});

for (const [name, mutate] of [
  ["frame", (value: typeof frame) => ({ ...value, frameRef: "frame-B" })],
  ["constitution", (value: typeof frame) => ({ ...value, constitutionRef: "constitution-2" })],
  ["authority", (value: typeof frame) => ({ ...value, authorityRefs: ["lease-2"] })],
  ["decoder", (value: typeof frame) => ({ ...value, decoderRef: "decoder-2" })],
  ["evidence", (value: typeof frame) => ({ ...value, evidenceRefs: ["witness-2"] })],
  ["participant", (value: typeof frame) => ({ ...value, participantRef: "participant-2" })],
  ["particularity", (value: typeof frame) => ({ ...value, particularityAnchors: { "goal:G": "artifact-B" } })],
] as const) {
  test(`${name} difference is material`, () => {
    const result = compareFrameDeclarations(frame, crossing, mutate(structuredClone(frame)));
    assert.equal(result.crossingStatus, "materially_changed");
  });
}

test("identical bounded declarations report no observed material difference, never same world", () => {
  const result = compareFrameDeclarations(frame, crossing, structuredClone(frame));
  assert.equal(result.crossingStatus, "no_material_difference_observed");
  assert.equal(result.observations.every((item) => item.disposition === "preserved"), true);
  assert.doesNotMatch(JSON.stringify(result), /same_world/);
});

test("rejects unknown experimental NAV record types before interpreting the body", () => {
  assert.throws(
    () => addressNavRecord("unknown_record" as never, frame),
    /NAV_INVALID_RECORD_TYPE/,
  );
});

test("normalizes particularity keys by deterministic code-unit order", () => {
  const addressed = addressNavRecord("frame_snapshot", {
    ...structuredClone(frame),
    particularityAnchors: {
      z: "z-ref",
      "ä": "umlaut-ref",
      a: "a-ref",
    },
  });

  assert.deepEqual(
    Object.keys(addressed.body.particularityAnchors),
    ["a", "z", "ä"],
  );
});
