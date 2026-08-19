import assert from "node:assert/strict";
import test from "node:test";

import {
  validateContinuityClaim,
  type ContinuityClaimV0,
} from "../src/continuity-profile";

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
