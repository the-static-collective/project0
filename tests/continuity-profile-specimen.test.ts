import assert from "node:assert/strict";
import test from "node:test";

import {
  addressContinuityClaim,
  checkContinuityClosure,
  checkLaneComposition,
  claimEstablishesLane,
  type ContinuityConformanceResult,
  type ContinuityClaimV0,
} from "../src/continuity-profile";
import {
  brokenProtocolParent,
  brokenProtocolParentRef,
  exactOneRootClaim,
  falsePreservedProtocolClaim,
  falseTransferredLostProtocolClaim,
  inventedRootClaim,
  lostProtocolParent,
  lostProtocolParentRef,
  manufacturedIdentityClaim,
  multiRootClaim,
  omittedRootClaim,
  participantsParent,
  participantsParentRef,
  pluralRealizationOne,
  pluralRealizationTwo,
  reconstitutedProtocolClaim,
  representationStoryParent,
  representationStoryParentRef,
} from "../fixtures/continuity-profile/specimens";

function result(
  claim: Parameters<typeof checkContinuityClosure>[0]["claim"],
  requiredMaterialRoots: string[],
  allowedMaterialRoots: string[],
): ContinuityConformanceResult {
  return checkContinuityClosure({ claim, requiredMaterialRoots, allowedMaterialRoots });
}

test("exact one-root continuity conforms against independent context", () => {
  assert.deepEqual(
    result(exactOneRootClaim, ["root:a"], ["root:a"]),
    { status: "conforming", reasonCodes: [] },
  );
});

test("multi-root continuity conforms when every material root closes", () => {
  assert.deepEqual(
    result(multiRootClaim, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
});

test("omitted required material root refuses", () => {
  assert.deepEqual(
    result(omittedRootClaim, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "refused", reasonCodes: ["MISSING_MATERIAL_ROOT"] },
  );
});

test("invented material root refuses", () => {
  assert.deepEqual(
    result(inventedRootClaim, ["root:a"], ["root:a"]),
    { status: "refused", reasonCodes: ["UNDECLARED_ROOT"] },
  );
});

test("reason ordering is deterministic and input arrays are not mutated", () => {
  const required = ["root:b", "root:a"];
  const allowed = ["root:a"];
  const requiredBefore = [...required];
  const allowedBefore = [...allowed];

  assert.deepEqual(
    result(inventedRootClaim, required, allowed),
    {
      status: "refused",
      reasonCodes: ["MISSING_MATERIAL_ROOT", "UNDECLARED_ROOT"],
    },
  );
  assert.deepEqual(required, requiredBefore);
  assert.deepEqual(allowed, allowedBefore);
});

test("plural lawful realizations from the same roots and purpose remain distinct", () => {
  assert.deepEqual(
    result(pluralRealizationOne, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
  assert.deepEqual(
    result(pluralRealizationTwo, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
  assert.equal(pluralRealizationOne.purpose, pluralRealizationTwo.purpose);
  assert.deepEqual(pluralRealizationOne.ancestorRoots, pluralRealizationTwo.ancestorRoots);
  assert.notEqual(addressContinuityClaim(pluralRealizationOne), addressContinuityClaim(pluralRealizationTwo));
});

test("lane establishment is exact and never promotes story into identity or authority", () => {
  assert.equal(claimEstablishesLane(representationStoryParent, "representation-story"), true);
  assert.equal(claimEstablishesLane(representationStoryParent, "identity"), false);
  assert.equal(claimEstablishesLane(representationStoryParent, "authority"), false);
  assert.equal(claimEstablishesLane(participantsParent, "participants"), true);
  assert.equal(claimEstablishesLane(participantsParent, "identity"), false);
});

test("representation-story plus participants cannot manufacture identity", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: manufacturedIdentityClaim,
      lane: "identity",
      parents: [
        { ref: representationStoryParentRef, claim: representationStoryParent },
        { ref: participantsParentRef, claim: participantsParent },
      ],
    }),
    { status: "refused", reasonCodes: ["LANE_MISMATCH"] },
  );
});

test("composition requires cited parent continuity refs", () => {
  const missingParentRef: ContinuityClaimV0 = {
    ...structuredClone(reconstitutedProtocolClaim),
    parentContinuityRefs: [],
  };
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: missingParentRef,
      lane: "protocol",
      parents: [{ ref: brokenProtocolParentRef, claim: brokenProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["MISSING_PARENT_CONTINUITY"] },
  );
});

test("composition closes over every parent material root", () => {
  const missingRoot: ContinuityClaimV0 = {
    ...structuredClone(reconstitutedProtocolClaim),
    ancestorRoots: ["root:other"],
  };
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: missingRoot,
      lane: "protocol",
      parents: [{ ref: brokenProtocolParentRef, claim: brokenProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["MISSING_PARENT_ROOT"] },
  );
});

test("known break refuses an uninterrupted protocol claim", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: falsePreservedProtocolClaim,
      lane: "protocol",
      parents: [{ ref: brokenProtocolParentRef, claim: brokenProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["BROKEN_PARENT_LANE"] },
  );
});

test("known break may support a new explicit reconstituted protocol claim", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: reconstitutedProtocolClaim,
      lane: "protocol",
      parents: [{ ref: brokenProtocolParentRef, claim: brokenProtocolParent }],
    }),
    { status: "conforming", reasonCodes: [] },
  );
  assert.notEqual(
    addressContinuityClaim(reconstitutedProtocolClaim),
    addressContinuityClaim(falsePreservedProtocolClaim),
  );
});

test("known loss refuses silent transfer", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: falseTransferredLostProtocolClaim,
      lane: "protocol",
      parents: [{ ref: lostProtocolParentRef, claim: lostProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["LOST_PARENT_LANE"] },
  );
});
