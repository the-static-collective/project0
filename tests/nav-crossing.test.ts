import assert from "node:assert/strict";
import test from "node:test";

import {
  validateCrossingDeclaration,
  validateFrameSnapshot,
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
  kind: "room_crossing",
  declaredPurpose: "compare declared frame change",
  evidenceRefs: ["witness-crossing-1"],
};

test("accepts explicit NAV frame and crossing declarations", () => {
  assert.doesNotThrow(() => validateFrameSnapshot(frame));
  assert.doesNotThrow(() => validateCrossingDeclaration(crossing));
});

test("rejects malformed NAV declarations with stable codes", () => {
  assert.throws(
    () => validateFrameSnapshot({ ...frame, authorityRefs: ["lease-1", 7] }),
    /NAV_INVALID_STRING_ARRAY/,
  );

  assert.throws(
    () => validateFrameSnapshot({ ...frame, particularityAnchors: { "goal:G": 7 } }),
    /NAV_INVALID_PARTICULARITY_ANCHOR/,
  );

  assert.throws(
    () => validateCrossingDeclaration({ ...crossing, kind: "teleport" }),
    /NAV_INVALID_CROSSING_KIND/,
  );
});

test("null is legal only for nullable scalar frame dimensions", () => {
  assert.doesNotThrow(() => validateFrameSnapshot({
    ...frame,
    constitutionRef: null,
    decoderRef: null,
    participantRef: null,
    particularityAnchors: { "goal:G": null },
  }));

  assert.throws(
    () => validateFrameSnapshot({ ...frame, frameRef: null }),
    /NAV_INVALID_STRING/,
  );
});
