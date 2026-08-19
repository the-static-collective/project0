import {
  addressContinuityClaim,
  type ContinuityClaimV0,
  type ContinuityLaneClaim,
} from "../../src/continuity-profile";

function textLane({
  mode,
  evidenceRefs,
  transformationRefs = [],
  residualRefs = [],
  uncertainty = [],
}: {
  mode: ContinuityLaneClaim["mode"];
  evidenceRefs: string[];
  transformationRefs?: string[];
  residualRefs?: string[];
  uncertainty?: string[];
}): ContinuityLaneClaim {
  return {
    lane: "text-schema",
    mode,
    dimensions: [{
      dimension: "textual-state",
      evidenceRefs,
    }],
    transformationRefs,
    residualRefs,
    uncertainty,
    doesNotEstablish: ["identity", "authority", "custody", "participants", "purpose-meaning", "representation-story"],
  };
}

function claim(overrides: Partial<ContinuityClaimV0>): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "synthetic manuscript transmission stress test",
    subjectRef: "witness:synthetic",
    ancestorRoots: ["root:synthetic"],
    environment: {
      policyRefs: [],
      contextRefs: [],
    },
    lanes: [textLane({
      mode: "preserved",
      evidenceRefs: ["evidence:synthetic-text"],
    })],
    outputRefs: ["artifact:synthetic"],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
    ...overrides,
  };
}

export const manuscriptCopyParent = claim({
  purpose: "copy is not composition occurrence",
  subjectRef: "composition:c0",
  ancestorRoots: ["composition-root:c0"],
  environment: {
    policyRefs: [],
    contextRefs: ["occurrence:composition-c0"],
  },
  lanes: [textLane({
    mode: "preserved",
    evidenceRefs: ["text-state:lamp-stands-beside-door"],
  })],
  outputRefs: ["artifact:composition-c0"],
});

export const manuscriptCopyParentRef = addressContinuityClaim(manuscriptCopyParent);

export const manuscriptCopyClaim = claim({
  purpose: "copy is not composition occurrence",
  subjectRef: "copy:c1",
  ancestorRoots: ["composition-root:c0"],
  environment: {
    policyRefs: [],
    contextRefs: [
      "occurrence:copy-c1",
      "unknown:intermediate-transmission",
    ],
  },
  lanes: [textLane({
    mode: "preserved",
    evidenceRefs: ["text-state:lamp-stands-beside-door"],
    transformationRefs: ["transmission:copying"],
    uncertainty: ["unknown:intermediate-transmission"],
  })],
  outputRefs: ["artifact:copy-c1"],
  parentContinuityRefs: [manuscriptCopyParentRef],
});

export const sourceLanguageParent = claim({
  purpose: "translation is not exact source form",
  subjectRef: "source-witness:s0",
  ancestorRoots: ["source-root:s0"],
  environment: {
    policyRefs: [],
    contextRefs: [
      "language:source-synthetic",
      "script:source-synthetic",
    ],
  },
  lanes: [textLane({
    mode: "preserved",
    evidenceRefs: ["source-form:LAMPA-DORA"],
  })],
  outputRefs: ["artifact:source-form"],
});

export const sourceLanguageParentRef = addressContinuityClaim(sourceLanguageParent);

export const translationClaim = claim({
  purpose: "translation is not exact source form",
  subjectRef: "translation-witness:t1",
  ancestorRoots: ["source-root:s0"],
  environment: {
    policyRefs: ["translation-policy:literal-v1"],
    contextRefs: [
      "language:source-synthetic",
      "script:source-synthetic",
      "language:target-synthetic",
      "script:target-synthetic",
      "translation-direction:source-to-target",
      "ambiguity:source-form-residual",
    ],
  },
  lanes: [textLane({
    mode: "transformed",
    evidenceRefs: ["target-form:lamp-by-door"],
    transformationRefs: ["transform:translation-source-to-target"],
    residualRefs: ["residual:lexical-ambiguity"],
    uncertainty: ["uncertainty:semantic-equivalence-not-adjudicated"],
  })],
  outputRefs: ["artifact:target-form"],
  parentContinuityRefs: [sourceLanguageParentRef],
});

export const translationClaimPolicyVariant: ContinuityClaimV0 = {
  ...structuredClone(translationClaim),
  environment: {
    ...structuredClone(translationClaim.environment),
    policyRefs: ["translation-policy:dynamic-v1"],
  },
};

const fragmentRoots = ["fragment:f1", "fragment:f2", "fragment:f3"];

export const fragmentReconstructionOne = claim({
  purpose: "fragments do not force one whole",
  subjectRef: "reconstruction:r1",
  ancestorRoots: fragmentRoots,
  environment: {
    policyRefs: ["assembly-policy:r1"],
    contextRefs: ["assembly-order:f1-f2-f3"],
  },
  lanes: [textLane({
    mode: "reconstituted",
    evidenceRefs: ["fragment:f1", "fragment:f2", "fragment:f3"],
    transformationRefs: ["assembly:r1"],
    uncertainty: ["uncertainty:historical-order-not-established"],
  })],
  outputRefs: ["proposal:r1:f1-f2-f3"],
});

export const fragmentReconstructionTwo = claim({
  purpose: "fragments do not force one whole",
  subjectRef: "reconstruction:r2",
  ancestorRoots: fragmentRoots,
  environment: {
    policyRefs: ["assembly-policy:r2"],
    contextRefs: ["assembly-order:f3-f2-f1"],
  },
  lanes: [textLane({
    mode: "reconstituted",
    evidenceRefs: ["fragment:f1", "fragment:f2", "fragment:f3"],
    transformationRefs: ["assembly:r2"],
    uncertainty: ["uncertainty:historical-order-not-established"],
  })],
  outputRefs: ["proposal:r2:f3-f2-f1"],
});

export const mixedDescentParentA = claim({
  purpose: "mixed-exemplar descent without single-parent collapse",
  subjectRef: "exemplar:a",
  ancestorRoots: ["root:exemplar-a"],
  lanes: [textLane({
    mode: "preserved",
    evidenceRefs: ["text-state:exemplar-a"],
  })],
  outputRefs: ["artifact:exemplar-a"],
});

export const mixedDescentParentARef = addressContinuityClaim(mixedDescentParentA);

export const mixedDescentParentB = claim({
  purpose: "mixed-exemplar descent without single-parent collapse",
  subjectRef: "exemplar:b",
  ancestorRoots: ["root:exemplar-b"],
  lanes: [textLane({
    mode: "preserved",
    evidenceRefs: ["text-state:exemplar-b"],
  })],
  outputRefs: ["artifact:exemplar-b"],
});

export const mixedDescentParentBRef = addressContinuityClaim(mixedDescentParentB);

export const mixedDescentClaim = claim({
  purpose: "mixed-exemplar descent without single-parent collapse",
  subjectRef: "mixed-witness:d",
  ancestorRoots: ["root:exemplar-a", "root:exemplar-b"],
  environment: {
    policyRefs: ["transmission-policy:successive-block-mixture"],
    contextRefs: [
      "descent:mixed-exemplar",
      "block:1-2-from-a",
      "block:3-4-from-b",
    ],
  },
  lanes: [textLane({
    mode: "transformed",
    evidenceRefs: [
      "transmission-evidence:block-1-2-from-a",
      "transmission-evidence:block-3-4-from-b",
    ],
    transformationRefs: ["transmission:successive-block-mixture"],
  })],
  outputRefs: ["artifact:mixed-witness-d"],
  parentContinuityRefs: [mixedDescentParentARef, mixedDescentParentBRef],
});

export const mixedDescentClaimSingleParent: ContinuityClaimV0 = {
  ...structuredClone(mixedDescentClaim),
  subjectRef: "mixed-witness:false-single-parent",
  parentContinuityRefs: [mixedDescentParentARef],
};
