import assert from "node:assert/strict";
import test from "node:test";

import {
  addressContinuityClaim,
  checkContinuityClosure,
  checkLaneComposition,
  type ContinuityClaimV0,
} from "../src/continuity-profile";
import {
  fragmentReconstructionOne,
  fragmentReconstructionTwo,
  manuscriptCopyClaim,
  manuscriptCopyParent,
  manuscriptCopyParentRef,
  mixedDescentClaim,
  mixedDescentClaimSingleParent,
  mixedDescentParentA,
  mixedDescentParentARef,
  mixedDescentParentB,
  mixedDescentParentBRef,
  sourceLanguageParent,
  sourceLanguageParentRef,
  translationClaim,
  translationClaimPolicyVariant,
} from "../fixtures/continuity-profile/manuscript";

test("later copy can preserve text-schema without impersonating composition occurrence", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: manuscriptCopyClaim,
      lane: "text-schema",
      parents: [{ ref: manuscriptCopyParentRef, claim: manuscriptCopyParent }],
    }),
    { status: "conforming", reasonCodes: [] },
  );

  const textLane = manuscriptCopyClaim.lanes.find((lane) => lane.lane === "text-schema");
  assert.equal(manuscriptCopyClaim.occurrenceClaim, "continuation-only");
  assert.notEqual(manuscriptCopyClaim.subjectRef, manuscriptCopyParent.subjectRef);
  assert.notDeepEqual(manuscriptCopyClaim.outputRefs, manuscriptCopyParent.outputRefs);
  assert.deepEqual(manuscriptCopyClaim.parentContinuityRefs, [manuscriptCopyParentRef]);
  assert.deepEqual(textLane?.uncertainty, ["unknown:intermediate-transmission"]);
  assert.equal(manuscriptCopyClaim.environment.contextRefs.includes("unknown:intermediate-transmission"), true);
  assert.notEqual(
    addressContinuityClaim(manuscriptCopyClaim),
    addressContinuityClaim(manuscriptCopyParent),
  );
});

test("translation is an evidenced text-schema transformation, not exact source form", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: translationClaim,
      lane: "text-schema",
      parents: [{ ref: sourceLanguageParentRef, claim: sourceLanguageParent }],
    }),
    { status: "conforming", reasonCodes: [] },
  );

  const textLane = translationClaim.lanes.find((lane) => lane.lane === "text-schema");
  assert.equal(textLane?.mode, "transformed");
  assert.deepEqual(
    translationClaim.environment.contextRefs,
    [
      "language:source-synthetic",
      "script:source-synthetic",
      "language:target-synthetic",
      "script:target-synthetic",
      "translation-direction:source-to-target",
      "ambiguity:source-form-residual",
    ],
  );
  assert.equal(translationClaim.occurrenceClaim, "continuation-only");
  assert.notEqual(
    addressContinuityClaim(translationClaim),
    addressContinuityClaim(translationClaimPolicyVariant),
  );
});

test("shared fragments can support plural lawful reconstructions without forcing one whole", () => {
  const roots = ["fragment:f1", "fragment:f2", "fragment:f3"];

  assert.deepEqual(
    checkContinuityClosure({
      claim: fragmentReconstructionOne,
      requiredMaterialRoots: roots,
      allowedMaterialRoots: roots,
    }),
    { status: "conforming", reasonCodes: [] },
  );
  assert.deepEqual(
    checkContinuityClosure({
      claim: fragmentReconstructionTwo,
      requiredMaterialRoots: roots,
      allowedMaterialRoots: roots,
    }),
    { status: "conforming", reasonCodes: [] },
  );

  assert.deepEqual(fragmentReconstructionOne.ancestorRoots, fragmentReconstructionTwo.ancestorRoots);
  assert.notEqual(
    addressContinuityClaim(fragmentReconstructionOne),
    addressContinuityClaim(fragmentReconstructionTwo),
  );
  assert.equal(fragmentReconstructionOne.occurrenceClaim, "continuation-only");
  assert.equal(fragmentReconstructionTwo.occurrenceClaim, "continuation-only");
});

test("reticulate continuity preserves two evidenced parents and refuses a false single-parent story", () => {
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: mixedDescentClaim,
      lane: "text-schema",
      parents: [
        { ref: mixedDescentParentARef, claim: mixedDescentParentA },
        { ref: mixedDescentParentBRef, claim: mixedDescentParentB },
      ],
    }),
    { status: "conforming", reasonCodes: [] },
  );

  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: mixedDescentClaimSingleParent,
      lane: "text-schema",
      parents: [
        { ref: mixedDescentParentARef, claim: mixedDescentParentA },
        { ref: mixedDescentParentBRef, claim: mixedDescentParentB },
      ],
    }),
    { status: "refused", reasonCodes: ["MISSING_PARENT_CONTINUITY"] },
  );

  const reordered: ContinuityClaimV0 = {
    ...structuredClone(mixedDescentClaim),
    ancestorRoots: [...mixedDescentClaim.ancestorRoots].reverse(),
    parentContinuityRefs: [...mixedDescentClaim.parentContinuityRefs].reverse(),
  };
  assert.equal(addressContinuityClaim(reordered), addressContinuityClaim(mixedDescentClaim));
  assert.deepEqual(
    new Set(mixedDescentClaim.parentContinuityRefs),
    new Set([mixedDescentParentARef, mixedDescentParentBRef]),
  );
});
