export const WHOLE_RETURN_VERSION = "whole-return/v0" as const;

export type WholeReturnParticipant = {
  participantId: string;
  repoRef: string;
  revision: string;
  adapterVersion: string;
  identityDomain: string;
};

export type WholeReturnDeclaration = {
  version: typeof WHOLE_RETURN_VERSION;
  jobId: string;
  occurrenceId: string;
  purpose: string;
  allowedOperations: string[];
  completionCondition: string;
  participants: WholeReturnParticipant[];
};

export type WholeReturnNativeIdentity = {
  domain: string;
  ref: string;
};

type WholeReturnEventBase = {
  seq: number;
  eventId: string;
};

export type WholeReturnCrossingEvent = WholeReturnEventBase & {
  kind: "crossing";
  fromParticipantId: string;
  toParticipantId: string;
  sourceIdentity: WholeReturnNativeIdentity;
  destinationIdentity: WholeReturnNativeIdentity;
  sourceReceiptRef: string;
  mappingReceiptRef: string;
  sourceArtifactSha256: string;
  acceptedArtifactSha256: string;
};

export type WholeReturnInterruptEvent = WholeReturnEventBase & {
  kind: "interrupt";
  reason: string;
};

export type WholeReturnResumeEvent = WholeReturnEventBase & {
  kind: "resume";
  interruptionEventId: string;
};

export type WholeReturnCompleteEvent = WholeReturnEventBase & {
  kind: "complete";
  returnRefs: WholeReturnNativeIdentity[];
};

export type WholeReturnRefuseEvent = WholeReturnEventBase & {
  kind: "refuse";
  reasonCode: string;
  evidenceRefs: string[];
};

export type WholeReturnEvent =
  | WholeReturnCrossingEvent
  | WholeReturnInterruptEvent
  | WholeReturnResumeEvent
  | WholeReturnCompleteEvent
  | WholeReturnRefuseEvent;

export type WholeReturnStatus =
  | "declared"
  | "running"
  | "interrupted"
  | "completed"
  | "refused";

export type WholeReturnReplay = {
  jobId: string;
  occurrenceId: string;
  status: WholeReturnStatus;
  activeInterruptionEventId: string | null;
  crossingEventIds: string[];
  returnRefs: WholeReturnNativeIdentity[];
  resumeToken: string;
};
