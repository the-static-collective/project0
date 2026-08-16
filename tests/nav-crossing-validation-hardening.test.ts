import assert from "node:assert/strict";
import test from "node:test";

import { addressNavRecord } from "../src/nav-crossing/index";

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
