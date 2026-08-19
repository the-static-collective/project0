import assert from "node:assert/strict";
import test from "node:test";

import {
  checkLaneComposition,
  validateContinuityClaim,
  type ContinuityClaimV0,
} from "../src/continuity-profile";
import {
  brokenProtocolParent,
  reconstitutedProtocolClaim,
} from "../fixtures/continuity-profile/specimens";

function makeClaim(parentContinuityRefs: string[]): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "parent continuity ref integrity",
    subjectRef: "subject:child",
    ancestorRoots: ["root:a"],
    environment: {
      policyRefs: [],
      contextRefs: [],
    },
    lanes: [{
      lane: "protocol",
      mode: "preserved",
      dimensions: [{
        dimension: "procedure",
        evidenceRefs: ["evidence:one"],
      }],
      transformationRefs: [],
      residualRefs: [],
      uncertainty: [],
      doesNotEstablish: ["identity", "authority"],
    }],
    outputRefs: ["output:child"],
    parentContinuityRefs,
    occurrenceClaim: "continuation-only",
  };
}

test("parent continuity refs must use exact cty-<64 lowercase hex> shape", () => {
  assert.throws(
    () => validateContinuityClaim(makeClaim(["cty-parent-a"])),
    /CONTINUITY_INVALID_FIELD/,
  );
});

test("composition refuses when a cited parent ref does not address the supplied parent claim", () => {
  const wrongButWellFormedRef = `cty-${"0".repeat(64)}`;
  const proposedClaim: ContinuityClaimV0 = {
    ...structuredClone(reconstitutedProtocolClaim),
    parentContinuityRefs: [wrongButWellFormedRef],
  };

  assert.deepEqual(
    checkLaneComposition({
      proposedClaim,
      lane: "protocol",
      parents: [{ ref: wrongButWellFormedRef, claim: brokenProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["MISSING_PARENT_CONTINUITY"] },
  );
});
