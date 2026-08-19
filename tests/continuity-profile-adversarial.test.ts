import assert from "node:assert/strict";
import test from "node:test";

import * as continuityApi from "../src/continuity-profile";
import {
  addressContinuityClaim,
  checkContinuityClosure,
  checkLaneComposition,
  claimEstablishesLane,
  validateContinuityClaim,
  type ContinuityClaimV0,
  type ContinuityLaneKind,
} from "../src/continuity-profile";
import {
  brokenProtocolParent,
  brokenProtocolParentRef,
  manufacturedIdentityClaim,
  omittedRootClaim,
  participantsParent,
  participantsParentRef,
  reconstitutedProtocolClaim,
  representationStoryParent,
  representationStoryParentRef,
} from "../fixtures/continuity-profile/specimens";

function makeClaim(): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "prove a bounded continuity claim",
    subjectRef: "subject:b",
    ancestorRoots: ["root:a"],
    environment: {
      decoderRef: "decoder:v1",
      runtimeRef: "runtime:v1",
      policyRefs: ["policy:one"],
      contextRefs: ["context:one"],
    },
    lanes: [{
      lane: "protocol",
      mode: "transformed",
      dimensions: [{
        dimension: "procedure",
        evidenceRefs: ["evidence:one"],
      }],
      transformationRefs: ["transform:one"],
      residualRefs: ["residual:one"],
      uncertainty: ["uncertainty:one"],
      doesNotEstablish: ["identity", "authority"],
    }],
    outputRefs: ["output:b"],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
  };
}

function cloneClaim(): ContinuityClaimV0 {
  return structuredClone(makeClaim());
}

function authorityLookingClaim(lane: Exclude<ContinuityLaneKind, "authority">): ContinuityClaimV0 {
  return {
    ...cloneClaim(),
    subjectRef: `subject:${lane}`,
    lanes: [{
      lane,
      mode: "preserved",
      dimensions: [{
        dimension: `${lane}-dimension`,
        evidenceRefs: ["external:warrant-looking"],
        note: "looks like authority but is evidence under a non-authority lane",
      }],
      transformationRefs: [],
      residualRefs: [],
      uncertainty: [],
      doesNotEstablish: ["authority"],
    }],
  };
}

test("accepts one structurally conforming typed continuity claim", () => {
  const claim = makeClaim();
  assert.equal(validateContinuityClaim(claim), claim);
});

test("rejects accessors before evaluating them", () => {
  const claim = makeClaim() as ContinuityClaimV0 & { trap?: string };
  Object.defineProperty(claim, "trap", {
    enumerable: true,
    get() {
      throw new Error("getter executed");
    },
  });
  assert.throws(() => validateContinuityClaim(claim), /ACCESSOR_PROPERTY/);
});

test("rejects wrong protocol, historical occurrence impersonation, and convenience authority fields", () => {
  const wrongSchema = { ...cloneClaim(), schema: "p0.continuity/9.9" };
  assert.throws(() => validateContinuityClaim(wrongSchema), /CONTINUITY_PROTOCOL_UNSUPPORTED/);

  const historicalOccurrence = { ...cloneClaim(), occurrenceClaim: "historical-occurrence" };
  assert.throws(() => validateContinuityClaim(historicalOccurrence), /CONTINUITY_INVALID_FIELD/);

  const authorityShortcut = { ...cloneClaim(), authorityRef: "warrant:old" };
  assert.throws(() => validateContinuityClaim(authorityShortcut), /CONTINUITY_UNKNOWN_FIELD/);
});

test("rejects empty required fields and empty lane/evidence structures", () => {
  const emptyPurpose = cloneClaim();
  emptyPurpose.purpose = "";
  assert.throws(() => validateContinuityClaim(emptyPurpose), /CONTINUITY_INVALID_FIELD/);

  const noRoots = cloneClaim();
  noRoots.ancestorRoots = [];
  assert.throws(() => validateContinuityClaim(noRoots), /CONTINUITY_INVALID_FIELD/);

  const noLanes = cloneClaim();
  noLanes.lanes = [];
  assert.throws(() => validateContinuityClaim(noLanes), /CONTINUITY_INVALID_FIELD/);

  const noEvidence = cloneClaim();
  noEvidence.lanes[0].dimensions[0].evidenceRefs = [];
  assert.throws(() => validateContinuityClaim(noEvidence), /CONTINUITY_INVALID_FIELD/);
});

test("rejects duplicate roots, lanes, dimensions, evidence, and non-establishment declarations", () => {
  const duplicateRoot = cloneClaim();
  duplicateRoot.ancestorRoots = ["root:a", "root:a"];
  assert.throws(() => validateContinuityClaim(duplicateRoot), /CONTINUITY_DUPLICATE/);

  const duplicateLane = cloneClaim();
  duplicateLane.lanes.push(structuredClone(duplicateLane.lanes[0]));
  assert.throws(() => validateContinuityClaim(duplicateLane), /CONTINUITY_DUPLICATE/);

  const duplicateDimension = cloneClaim();
  duplicateDimension.lanes[0].dimensions.push(structuredClone(duplicateDimension.lanes[0].dimensions[0]));
  assert.throws(() => validateContinuityClaim(duplicateDimension), /CONTINUITY_DUPLICATE/);

  const duplicateEvidence = cloneClaim();
  duplicateEvidence.lanes[0].dimensions[0].evidenceRefs = ["evidence:one", "evidence:one"];
  assert.throws(() => validateContinuityClaim(duplicateEvidence), /CONTINUITY_DUPLICATE/);

  const duplicateNonEstablishment = cloneClaim();
  duplicateNonEstablishment.lanes[0].doesNotEstablish = ["identity", "identity"];
  assert.throws(() => validateContinuityClaim(duplicateNonEstablishment), /CONTINUITY_DUPLICATE/);
});

test("rejects unknown or blended lane modes and self non-establishment", () => {
  const unknownLane = cloneClaim() as unknown as Record<string, unknown>;
  (unknownLane.lanes as Array<Record<string, unknown>>)[0].lane = "institutional-vibes";
  assert.throws(() => validateContinuityClaim(unknownLane), /CONTINUITY_INVALID_FIELD/);

  const blendedMode = cloneClaim() as unknown as Record<string, unknown>;
  (blendedMode.lanes as Array<Record<string, unknown>>)[0].mode = "broken\/unresolved";
  assert.throws(() => validateContinuityClaim(blendedMode), /CONTINUITY_INVALID_FIELD/);

  const blendedModeTwo = cloneClaim() as unknown as Record<string, unknown>;
  (blendedModeTwo.lanes as Array<Record<string, unknown>>)[0].mode = "preserved\/transformed";
  assert.throws(() => validateContinuityClaim(blendedModeTwo), /CONTINUITY_INVALID_FIELD/);

  const selfRefusal = cloneClaim();
  selfRefusal.lanes[0].doesNotEstablish = ["protocol"];
  assert.throws(() => validateContinuityClaim(selfRefusal), /CONTINUITY_INVALID_FIELD/);
});

test("inherits canonicalization refusals for hostile runtime values", () => {
  const cyclic = cloneClaim() as unknown as { self?: unknown } & ContinuityClaimV0;
  cyclic.self = cyclic;
  assert.throws(() => validateContinuityClaim(cyclic), /CYCLIC_VALUE/);

  const sparse = cloneClaim() as unknown as Record<string, unknown>;
  sparse.outputRefs = ["output:b", , "output:c"];
  assert.throws(() => validateContinuityClaim(sparse), /SPARSE_ARRAY/);

  const custom = cloneClaim() as unknown as Record<string, unknown>;
  custom.environment = Object.create({ inherited: true });
  assert.throws(() => validateContinuityClaim(custom), /CUSTOM_PROTOTYPE/);
});

test("broken or reconstituted continuity cannot be rewritten as preserved without evidence change", () => {
  const falsePreserved = structuredClone(reconstitutedProtocolClaim);
  falsePreserved.lanes[0].mode = "preserved";

  assert.notEqual(
    addressContinuityClaim(falsePreserved),
    addressContinuityClaim(reconstitutedProtocolClaim),
  );
  assert.deepEqual(
    checkLaneComposition({
      proposedClaim: falsePreserved,
      lane: "protocol",
      parents: [{ ref: brokenProtocolParentRef, claim: brokenProtocolParent }],
    }),
    { status: "refused", reasonCodes: ["BROKEN_PARENT_LANE"] },
  );
});

test("deleting a residual to make a cleaner story changes claim identity", () => {
  const cleaned = structuredClone(reconstitutedProtocolClaim);
  cleaned.lanes[0].residualRefs = [];
  assert.notEqual(
    addressContinuityClaim(cleaned),
    addressContinuityClaim(reconstitutedProtocolClaim),
  );
});

test("semantic or perceptual similarity notes cannot satisfy a missing material root", () => {
  const similarityOnly = structuredClone(omittedRootClaim);
  similarityOnly.lanes[0].dimensions[0].note = "perceptually and semantically identical to root:b";

  assert.deepEqual(
    checkContinuityClosure({
      claim: similarityOnly,
      requiredMaterialRoots: ["root:a", "root:b"],
      allowedMaterialRoots: ["root:a", "root:b"],
    }),
    { status: "refused", reasonCodes: ["MISSING_MATERIAL_ROOT"] },
  );
});

test("decoder and runtime drift changes continuity identity", () => {
  const base = cloneClaim();
  const drifted = cloneClaim();
  drifted.environment.decoderRef = "decoder:v2";
  drifted.environment.runtimeRef = "runtime:v2";
  assert.notEqual(addressContinuityClaim(base), addressContinuityClaim(drifted));
});

test("same output refs with different lineage remain distinct", () => {
  const left = cloneClaim();
  const right = cloneClaim();
  right.ancestorRoots = ["root:different"];
  assert.deepEqual(left.outputRefs, right.outputRefs);
  assert.notEqual(addressContinuityClaim(left), addressContinuityClaim(right));
});

test("shared story plus later participants cannot satisfy institutional identity", () => {
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

test("authority-looking evidence outside the authority lane grants no authority continuity", () => {
  const nonAuthorityLanes: Array<Exclude<ContinuityLaneKind, "authority">> = [
    "custody",
    "protocol",
    "identity",
    "purpose-meaning",
    "representation-story",
  ];

  for (const lane of nonAuthorityLanes) {
    const claim = authorityLookingClaim(lane);
    assert.equal(claimEstablishesLane(claim, "authority"), false, lane);
  }
});

test("public continuity API exposes no authority or automatic genealogy capability", () => {
  for (const forbidden of [
    "grantAuthority",
    "executeAuthority",
    "admitWarrant",
    "composeClaims",
    "inferLane",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(continuityApi, forbidden), false, forbidden);
  }
});
