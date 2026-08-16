import assert from "node:assert/strict";
import test from "node:test";

import {
  NAV_DOMAIN_PREFIX,
  addressNavRecord,
  compareFrameDeclarations,
  createNavCrossingReceipt,
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
  kind: "room_crossing" as const,
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

test("same visible evidence does not hide changed authority and decoder", () => {
  const before = structuredClone(frame);
  const after = {
    ...structuredClone(frame),
    authorityRefs: ["lease-2"],
    decoderRef: "decoder-2",
  };

  const result = compareFrameDeclarations(before, crossing, after);
  const byDimension = new Map(result.observations.map((item) => [item.dimension, item]));

  assert.equal(byDimension.get("evidence")?.disposition, "preserved");
  assert.equal(byDimension.get("authority")?.disposition, "changed");
  assert.equal(byDimension.get("decoder")?.disposition, "changed");
  assert.equal(result.crossingStatus, "materially_changed");
  assert.equal("same_world" in result, false);
});

test("stable label cannot override changed particularity", () => {
  const after = {
    ...structuredClone(frame),
    particularityAnchors: { "goal:G": "artifact-B" },
  };

  const result = compareFrameDeclarations(frame, crossing, after);
  const particularity = result.observations.find((item) => item.dimension === "particularity:goal:G");

  assert.equal(particularity?.disposition, "changed");
  assert.equal(result.crossingStatus, "materially_changed");
});

test("null scalar comparison is indeterminate, not preserved", () => {
  const before = { ...structuredClone(frame), decoderRef: null };
  const after = { ...structuredClone(frame), decoderRef: null };
  const result = compareFrameDeclarations(before, crossing, after);
  const decoder = result.observations.find((item) => item.dimension === "decoder");

  assert.equal(decoder?.disposition, "indeterminate");
  assert.equal(result.crossingStatus, "indeterminate");
});

test("normalizes authority and evidence as sets", () => {
  const before = {
    ...structuredClone(frame),
    authorityRefs: ["lease-2", "lease-1", "lease-1"],
    evidenceRefs: ["witness-2", "witness-1"],
  };
  const after = {
    ...structuredClone(frame),
    authorityRefs: ["lease-1", "lease-2"],
    evidenceRefs: ["witness-1", "witness-2", "witness-2"],
  };

  const result = compareFrameDeclarations(before, crossing, after);
  const byDimension = new Map(result.observations.map((item) => [item.dimension, item]));

  assert.equal(byDimension.get("authority")?.disposition, "preserved");
  assert.equal(byDimension.get("evidence")?.disposition, "preserved");
});

test("distinguishes absent_after and new_after", () => {
  const removed = compareFrameDeclarations(
    { ...structuredClone(frame), authorityRefs: ["lease-1"] },
    crossing,
    { ...structuredClone(frame), authorityRefs: [] },
  );
  assert.equal(
    removed.observations.find((item) => item.dimension === "authority")?.disposition,
    "absent_after",
  );

  const introduced = compareFrameDeclarations(
    { ...structuredClone(frame), authorityRefs: [] },
    crossing,
    { ...structuredClone(frame), authorityRefs: ["lease-1"] },
  );
  assert.equal(
    introduced.observations.find((item) => item.dimension === "authority")?.disposition,
    "new_after",
  );
});

test("comparison is deterministic and does not mutate inputs", () => {
  const before = {
    ...structuredClone(frame),
    authorityRefs: ["lease-2", "lease-1"],
    particularityAnchors: { z: "z-ref", a: "a-ref" },
  };
  const after = structuredClone(before);
  after.authorityRefs = ["lease-1", "lease-2"];
  after.particularityAnchors = { a: "a-ref", z: "z-ref" };

  const beforeCopy = structuredClone(before);
  const afterCopy = structuredClone(after);
  const first = compareFrameDeclarations(before, crossing, after);
  const second = compareFrameDeclarations(before, crossing, after);

  assert.deepEqual(first, second);
  assert.deepEqual(before, beforeCopy);
  assert.deepEqual(after, afterCopy);
  assert.deepEqual(
    first.observations.map((item) => item.dimension),
    [
      "frame",
      "constitution",
      "authority",
      "decoder",
      "evidence",
      "participant",
      "particularity:a",
      "particularity:z",
    ],
  );
});

test("addresses NAV records under an experimental domain without canonical receipt identity", () => {
  const addressed = addressNavRecord("frame_snapshot", frame);

  assert.equal(NAV_DOMAIN_PREFIX, "Project0-NAV-v0.1|");
  assert.match(addressed.ref, /^nav-[0-9a-f]{64}$/);
  assert.equal(addressed.ref.startsWith("rect-"), false);
  assert.equal(addressed.digestHex.length, 64);
});

test("reordered set declarations produce the same NAV frame address", () => {
  const left = addressNavRecord("frame_snapshot", {
    ...structuredClone(frame),
    authorityRefs: ["lease-2", "lease-1", "lease-1"],
    evidenceRefs: ["witness-2", "witness-1"],
  });
  const right = addressNavRecord("frame_snapshot", {
    ...structuredClone(frame),
    authorityRefs: ["lease-1", "lease-2"],
    evidenceRefs: ["witness-1", "witness-2", "witness-2"],
  });

  assert.equal(left.ref, right.ref);
  assert.equal(left.digestHex, right.digestHex);
  assert.deepEqual(left.canonicalBytes, right.canonicalBytes);
});

test("crossing receipt binds exact addressed input declarations", () => {
  const result = createNavCrossingReceipt(frame, crossing, {
    ...structuredClone(frame),
    decoderRef: "decoder-2",
  });

  assert.equal(result.receipt.body.beforeSnapshotRef, result.before.ref);
  assert.equal(result.receipt.body.crossingDeclarationRef, result.crossing.ref);
  assert.equal(result.receipt.body.afterSnapshotRef, result.after.ref);
  assert.equal(result.receipt.body.crossingStatus, "materially_changed");
  assert.match(result.receipt.ref, /^nav-[0-9a-f]{64}$/);
});

test("same normalized input declarations create the same crossing receipt digest", () => {
  const beforeA = {
    ...structuredClone(frame),
    authorityRefs: ["lease-2", "lease-1"],
  };
  const beforeB = {
    ...structuredClone(frame),
    authorityRefs: ["lease-1", "lease-2"],
  };

  const first = createNavCrossingReceipt(beforeA, crossing, frame);
  const second = createNavCrossingReceipt(beforeB, crossing, frame);

  assert.equal(first.before.ref, second.before.ref);
  assert.equal(first.receipt.ref, second.receipt.ref);
});
