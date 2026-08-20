import {
  addressContinuityClaim,
  type ContinuityClaimV0,
  type ContinuityLaneClaim,
} from "../../src/continuity-profile";

function meaningLane({
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
    lane: "purpose-meaning",
    mode,
    dimensions: [{
      dimension: "branch-intent",
      evidenceRefs,
    }],
    transformationRefs,
    residualRefs,
    uncertainty,
    doesNotEstablish: [
      "identity",
      "authority",
      "custody",
      "participants",
      "protocol",
      "text-schema",
      "representation-story",
    ],
  };
}

function claim(overrides: Partial<ContinuityClaimV0>): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "forkability pressure test: mergeability is not merge obligation",
    subjectRef: "branch:synthetic",
    ancestorRoots: ["root:forkability-shared"],
    environment: {
      policyRefs: [],
      contextRefs: [],
    },
    lanes: [meaningLane({
      mode: "preserved",
      evidenceRefs: ["evidence:synthetic"],
    })],
    outputRefs: ["artifact:synthetic"],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
    ...overrides,
  };
}

export const branchA = claim({
  subjectRef: "branch:a",
  environment: {
    policyRefs: ["policy:branch-sovereignty"],
    contextRefs: ["branch-point:shared"],
  },
  lanes: [meaningLane({
    mode: "preserved",
    evidenceRefs: ["witness:branch-a"],
  })],
  outputRefs: ["artifact:branch-a"],
});

export const branchARef = addressContinuityClaim(branchA);

export const branchB = claim({
  subjectRef: "branch:b",
  environment: {
    policyRefs: ["policy:branch-sovereignty"],
    contextRefs: ["branch-point:shared"],
  },
  lanes: [meaningLane({
    mode: "preserved",
    evidenceRefs: ["witness:branch-b"],
  })],
  outputRefs: ["artifact:branch-b"],
});

export const branchBRef = addressContinuityClaim(branchB);

const parentRefs = [branchARef, branchBRef];
const encounterEvidence = [
  "witness:branch-a",
  "witness:branch-b",
  "encounter:a-b",
];

export const mergeCandidate = claim({
  subjectRef: "candidate:merge-a-b",
  environment: {
    policyRefs: ["policy:reconcile-only-if-separately-admitted"],
    contextRefs: ["encounter:a-b", "status:proposal-only"],
  },
  lanes: [meaningLane({
    mode: "transformed",
    evidenceRefs: encounterEvidence,
    transformationRefs: ["proposal:reconcile-a-b"],
    residualRefs: ["difference:a-b-remains-attributable"],
  })],
  outputRefs: ["proposal:merge-a-b"],
  parentContinuityRefs: parentRefs,
});

export const coexistenceCandidate = claim({
  subjectRef: "candidate:coexist-a-b",
  environment: {
    policyRefs: ["policy:plural-continuation"],
    contextRefs: ["encounter:a-b", "disposition:coexist"],
  },
  lanes: [meaningLane({
    mode: "unresolved",
    evidenceRefs: encounterEvidence,
    residualRefs: ["difference:a-b-remains-live"],
  })],
  outputRefs: ["relation:coexist-a-b"],
  parentContinuityRefs: parentRefs,
});

export const refusalCandidate = claim({
  subjectRef: "candidate:refuse-merge-a-b",
  environment: {
    policyRefs: ["policy:merge-refused"],
    contextRefs: ["encounter:a-b", "disposition:refuse"],
  },
  lanes: [meaningLane({
    mode: "unresolved",
    evidenceRefs: encounterEvidence,
    residualRefs: [
      "refusal:merge-a-b",
      "difference:a-b-remains-live",
    ],
  })],
  outputRefs: ["receipt:merge-refused-a-b"],
  parentContinuityRefs: parentRefs,
});
