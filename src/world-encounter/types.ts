export const WORLD_ENCOUNTER_PROTOCOL = "p0.exchange/0.1" as const;

export const SOURCE_EPISTEMIC_KINDS = [
  "source",
  "observation",
  "claim",
  "proposal",
  "tension",
  "rejection",
  "witness",
  "harvest",
  "inference",
] as const;

export type SourceEpistemicKind = typeof SOURCE_EPISTEMIC_KINDS[number];

export const SOURCE_VERIFICATION_STATES = [
  "unverified",
  "verified",
  "disputed",
  "unknown",
] as const;

export type SourceVerificationState = typeof SOURCE_VERIFICATION_STATES[number];

export type NodeManifestV01 = {
  nodeRef: string;
  protocolVersion: typeof WORLD_ENCOUNTER_PROTOCOL;
  accepts: string[];
  emits: string[];
  capabilities: string[];
  requiredScopes: string[];
  mustNever: string[];
};

export type SafeSourceRefV01 = {
  objectRef: string;
  mediaType: string | null;
  sourceReceiptRefs: string[];
  disclosureClass: string;
};

export type ExchangeEnvelopeV01 = {
  protocolVersion: typeof WORLD_ENCOUNTER_PROTOCOL;
  originNodeRef: string;
  originFrameRef: string;
  originVersionRef: string;
  offered: SafeSourceRefV01;
  sourceProvenanceRefs: string[];
  sourceAuthorityRefs: string[];
  sourceEpistemicKind: SourceEpistemicKind;
  sourceVerificationState: SourceVerificationState;
  capabilityUsed: string;
  limitations: string[];
};

export type DestinationEncounterContextV01 = {
  destinationNodeRef: string;
  destinationFrameRef: string;
  manifest: NodeManifestV01;
  grantedScopes: string[];
  destinationAuthorityRefs: string[];
};

export type EncounterStatusV01 = "admitted" | "refused" | "indeterminate";

export type EncounterReasonCode =
  | "ENCOUNTER_ADMITTED"
  | "ENCOUNTER_PROTOCOL_UNSUPPORTED"
  | "ENCOUNTER_TYPE_NOT_ACCEPTED"
  | "ENCOUNTER_CAPABILITY_UNDECLARED"
  | "ENCOUNTER_SCOPE_REQUIRED"
  | "ENCOUNTER_DISCLOSURE_REFUSED"
  | "ENCOUNTER_SOURCE_INVALID"
  | "ENCOUNTER_INDETERMINATE";

export type EncounterDispositionV01 = {
  envelopeRef: string;
  destinationFrameRef: string;
  status: EncounterStatusV01;
  reasonCode: EncounterReasonCode;
  inspectedObject: boolean;
  destinationAuthorityRefs: string[];
  evidenceRefs: string[];
};

export type EncounterRecordType = "exchange_envelope" | "encounter_disposition";

export type EncounterEvaluationOptionsV01 = {
  offeredClass: string;
  requiredCapability: string;
  requiredScope: string;
  localDetermination: "admit" | "refuse" | "indeterminate";
  evidenceRefs: string[];
};
