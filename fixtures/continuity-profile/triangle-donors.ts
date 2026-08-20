export const tranchNodeBoundaryWitness = {
  schema: "tranchnode/continuity-boundary-witness/v0.1",
  spineId: "spine:intent-stroke",
  fromStageId: "intent-stroke-v0.1",
  toStageId: "intent-stroke-v0.2",
  originRef: "intent-stroke:v0.1",
  presentRef: "intent-stroke:v0.2",
  preserved: [
    "decoder-authority:none",
    "interface:intent-stroke-stdio-v0.1",
    "responsibility:canonical-layout-binding",
    "transport-authority:none",
  ],
  differentiated: [
    "interface:intent-stroke-stdio-v0.2",
    "layout-binding:tranchnode",
  ],
  lost: ["dependency:caller-constructs-fieldLayoutRef"],
  unresolved: ["collision-policy:unresolved"],
  completedTransferIds: ["transfer:canonical-layout-binding-to-tranchnode"],
  transitionWitnessRefs: ["transition:intent-stroke-v01-v02"],
  authority: "none",
  occurrenceClaim: "transition-witness-only",
} as const;

const priorRefusal = {
  cause: {
    trustId: "trust:casework.synthetic",
    authorityCut: "v0.1",
    actorId: "person:administrator",
    capacity: "administrator",
    subjectRef: "artifact:agreement-a",
    capabilityId: "synthetic.echo",
    capabilityOperation: "echo",
    trustRequestId: "request:prior-refused",
  },
  disposition: "session-refused",
  outputRefs: [],
} as const;

const currentCompletion = {
  cause: {
    trustId: "trust:casework.synthetic",
    authorityCut: "v0.2",
    actorId: "person:administrator",
    capacity: "administrator",
    subjectRef: "artifact:agreement-a",
    capabilityId: "synthetic.echo",
    capabilityOperation: "echo",
    trustRequestId: "request:current-amendment",
  },
  disposition: "completed",
  outputRefs: ["artifact:amendment-b"],
} as const;

const currentHostFailure = {
  cause: {
    trustId: "trust:casework.synthetic",
    authorityCut: "v0.2",
    actorId: "person:administrator",
    capacity: "administrator",
    subjectRef: "artifact:agreement-a",
    capabilityId: "synthetic.echo",
    capabilityOperation: "echo",
    trustRequestId: "request:current-host-failed",
  },
  disposition: "host-failed",
  outputRefs: [],
} as const;

export const corpusContinuityAttestation = {
  schema: "corpus/continuity-attestation/v0.1",
  priorCutRef: "world-cut:prior-v01",
  currentCutRef: "world-cut:current-v02",
  trustId: "trust:casework.synthetic",
  purpose: "corpus-worldcut-succession",
  preservedRefs: [
    "artifact:agreement-a",
    "artifact:correspondence-a",
  ],
  transformed: [
    {
      priorRef: "artifact:legacy-note",
      currentRef: "artifact:amendment-b",
      evidenceRef: "transition:legacy-to-amendment",
    },
  ],
  lost: [
    {
      priorRef: "artifact:superseded-appendix",
      evidenceRef: "transition:appendix-retired",
    },
  ],
  unresolvedRefs: ["artifact:unexplained-current"],
  priorTerminalHistory: [priorRefusal],
  currentTerminalHistory: [currentCompletion, currentHostFailure],
  priorUnresolved: [],
  currentUnresolved: [],
  priorOrphanObservations: [
    { ref: "artifact:orphan-shared", classification: "ORPHAN_OBSERVATION" },
  ],
  currentOrphanObservations: [
    { ref: "artifact:orphan-shared", classification: "ORPHAN_OBSERVATION" },
  ],
  transitionEvidenceRefs: [
    "transition:appendix-retired",
    "transition:legacy-to-amendment",
  ],
  authorityCutChange: {
    prior: "v0.1",
    current: "v0.2",
    changed: true,
  },
  authorityContinuity: "separately-evidenced",
  authorityEvidenceRefs: ["authority-evidence:adoption-v02"],
  whyCurrent: {
    currentCutRef: "world-cut:current-v02",
    authorityCut: "v0.2",
    constitutedRefs: [
      "artifact:agreement-a",
      "artifact:amendment-b",
      "artifact:correspondence-a",
      "artifact:unexplained-current",
    ],
    transitionEvidenceRefs: [
      "transition:appendix-retired",
      "transition:legacy-to-amendment",
    ],
  },
  legalValidity: "unclaimed",
} as const;
