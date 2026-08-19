import {
  addressContinuityClaim,
  type ContinuityClaimV0,
  type ContinuityLaneClaim,
} from "../../src/continuity-profile";

function claim(overrides: Partial<ContinuityClaimV0> = {}): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "portable continuity closure specimen",
    subjectRef: "subject:current",
    ancestorRoots: ["root:a"],
    environment: {
      decoderRef: "decoder:v1",
      runtimeRef: "runtime:v1",
      policyRefs: [],
      contextRefs: [],
    },
    lanes: [{
      lane: "text-schema",
      mode: "preserved",
      dimensions: [{
        dimension: "schema",
        evidenceRefs: ["evidence:schema-a"],
      }],
      transformationRefs: [],
      residualRefs: [],
      uncertainty: [],
      doesNotEstablish: ["identity", "authority"],
    }],
    outputRefs: ["output:current"],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
    ...overrides,
  };
}

function lane(
  laneName: ContinuityLaneClaim["lane"],
  mode: ContinuityLaneClaim["mode"],
  evidenceRef: string,
  doesNotEstablish: ContinuityLaneClaim["doesNotEstablish"] = [],
  residualRefs: string[] = [],
): ContinuityLaneClaim {
  return {
    lane: laneName,
    mode,
    dimensions: [{ dimension: `${laneName}-dimension`, evidenceRefs: [evidenceRef] }],
    transformationRefs: [],
    residualRefs,
    uncertainty: [],
    doesNotEstablish,
  };
}

export const exactOneRootClaim = claim();

export const multiRootClaim = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:multi"],
});

export const omittedRootClaim = claim({
  ancestorRoots: ["root:a"],
  outputRefs: ["output:omitted"],
});

export const inventedRootClaim = claim({
  ancestorRoots: ["root:a", "root:invented"],
  outputRefs: ["output:invented"],
});

export const pluralRealizationOne = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:realization-one"],
});

export const pluralRealizationTwo = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:realization-two"],
});

export const representationStoryParent = claim({
  purpose: "historical genealogy stress test",
  subjectRef: "subject:story-parent",
  ancestorRoots: ["root:story"],
  lanes: [lane(
    "representation-story",
    "preserved",
    "evidence:story",
    ["identity", "authority", "participants"],
  )],
  outputRefs: ["output:story-parent"],
});

export const representationStoryParentRef = addressContinuityClaim(representationStoryParent);

export const participantsParent = claim({
  purpose: "historical genealogy stress test",
  subjectRef: "subject:participants-parent",
  ancestorRoots: ["root:participants"],
  lanes: [lane(
    "participants",
    "preserved",
    "evidence:participants",
    ["identity", "authority"],
  )],
  outputRefs: ["output:participants-parent"],
});

export const participantsParentRef = addressContinuityClaim(participantsParent);

export const manufacturedIdentityClaim = claim({
  purpose: "historical genealogy stress test",
  subjectRef: "subject:manufactured-identity",
  ancestorRoots: ["root:story", "root:participants"],
  lanes: [lane("identity", "preserved", "evidence:identity-assertion")],
  outputRefs: ["output:manufactured-identity"],
  parentContinuityRefs: [representationStoryParentRef, participantsParentRef],
});

export const brokenProtocolParent = claim({
  purpose: "protocol revival stress test",
  subjectRef: "subject:broken-protocol",
  ancestorRoots: ["root:protocol"],
  lanes: [lane(
    "protocol",
    "broken",
    "evidence:protocol-break",
    ["identity", "authority"],
    ["residual:surviving-protocol-text"],
  )],
  outputRefs: ["output:broken-protocol"],
});

export const brokenProtocolParentRef = addressContinuityClaim(brokenProtocolParent);

export const reconstitutedProtocolClaim = claim({
  purpose: "protocol revival stress test",
  subjectRef: "subject:reconstituted-protocol",
  ancestorRoots: ["root:protocol"],
  lanes: [lane(
    "protocol",
    "reconstituted",
    "evidence:protocol-reconstitution",
    ["identity", "authority"],
    ["residual:surviving-protocol-text"],
  )],
  outputRefs: ["output:reconstituted-protocol"],
  parentContinuityRefs: [brokenProtocolParentRef],
});

export const falsePreservedProtocolClaim: ContinuityClaimV0 = {
  ...structuredClone(reconstitutedProtocolClaim),
  subjectRef: "subject:false-preserved-protocol",
  lanes: [lane(
    "protocol",
    "preserved",
    "evidence:false-unbroken-protocol",
    ["identity", "authority"],
    ["residual:surviving-protocol-text"],
  )],
  outputRefs: ["output:false-preserved-protocol"],
};

export const lostProtocolParent = claim({
  purpose: "protocol loss stress test",
  subjectRef: "subject:lost-protocol",
  ancestorRoots: ["root:lost-protocol"],
  lanes: [lane("protocol", "lost", "evidence:protocol-loss")],
  outputRefs: ["output:lost-protocol"],
});

export const lostProtocolParentRef = addressContinuityClaim(lostProtocolParent);

export const falseTransferredLostProtocolClaim = claim({
  purpose: "protocol loss stress test",
  subjectRef: "subject:false-transferred-protocol",
  ancestorRoots: ["root:lost-protocol"],
  lanes: [lane("protocol", "transferred", "evidence:false-transfer")],
  outputRefs: ["output:false-transferred-protocol"],
  parentContinuityRefs: [lostProtocolParentRef],
});
