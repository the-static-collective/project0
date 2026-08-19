export const CONTINUITY_LANES = [
  "identity",
  "authority",
  "custody",
  "participants",
  "protocol",
  "text-schema",
  "purpose-meaning",
  "representation-story",
] as const;

export type ContinuityLaneKind = typeof CONTINUITY_LANES[number];

export const CONTINUITY_MODES = [
  "preserved",
  "transformed",
  "transferred",
  "reconstituted",
  "lost",
  "broken",
  "unresolved",
] as const;

export type ContinuityMode = typeof CONTINUITY_MODES[number];

export type ContinuityDimension = {
  dimension: string;
  evidenceRefs: string[];
  note?: string;
};

export type ContinuityLaneClaim = {
  lane: ContinuityLaneKind;
  mode: ContinuityMode;
  dimensions: ContinuityDimension[];
  transformationRefs: string[];
  residualRefs: string[];
  uncertainty: string[];
  doesNotEstablish: ContinuityLaneKind[];
};

export type ContinuityEnvironment = {
  decoderRef?: string;
  runtimeRef?: string;
  policyRefs: string[];
  contextRefs: string[];
};

export type ContinuityClaimV0 = {
  schema: "p0.continuity/0.1";
  purpose: string;
  subjectRef: string;
  ancestorRoots: string[];
  environment: ContinuityEnvironment;
  lanes: ContinuityLaneClaim[];
  outputRefs: string[];
  parentContinuityRefs: string[];
  occurrenceClaim: "continuation-only";
};
