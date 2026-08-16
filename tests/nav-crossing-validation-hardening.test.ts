import assert from "node:assert/strict";
import test from "node:test";

import {
  addressNavRecord,
  validateFrameSnapshot,
} from "../src/nav-crossing/index";

test("malformed observation disposition is rejected without coercion", () => {
  const hostileDisposition = {
    toString() {
      throw new Error("must not execute");
    },
  };

  assert.throws(
    () => addressNavRecord("crossing_receipt", {
      beforeSnapshotRef: "nav-before",
      crossingDeclarationRef: "nav-crossing",
      afterSnapshotRef: "nav-after",
      observations: [{
        dimension: "authority",
        disposition: hostileDisposition,
        beforeRefs: [],
        afterRefs: [],
        evidenceRefs: [],
      }],
      crossingStatus: "indeterminate",
    }),
    /NAV_INVALID_OBSERVATION/,
  );
});

test("frame validation rejects accessor properties without executing them", () => {
  const hostileFrame: Record<string, unknown> = {
    constitutionRef: null,
    authorityRefs: [],
    decoderRef: null,
    evidenceRefs: [],
    participantRef: null,
    particularityAnchors: {},
  };
  Object.defineProperty(hostileFrame, "frameRef", {
    enumerable: true,
    get() {
      throw new Error("must not execute");
    },
  });

  assert.throws(
    () => validateFrameSnapshot(hostileFrame),
    /NAV_INVALID_OBJECT/,
  );
});

test("frame validation rejects accessor array entries without executing them", () => {
  const hostileAuthorityRefs: unknown[] = ["lease-1"];
  Object.defineProperty(hostileAuthorityRefs, 0, {
    enumerable: true,
    get() {
      throw new Error("must not execute");
    },
  });

  assert.throws(
    () => validateFrameSnapshot({
      frameRef: "frame-A",
      constitutionRef: null,
      authorityRefs: hostileAuthorityRefs,
      decoderRef: null,
      evidenceRefs: [],
      participantRef: null,
      particularityAnchors: {},
    }),
    /NAV_INVALID_STRING_ARRAY/,
  );
});
