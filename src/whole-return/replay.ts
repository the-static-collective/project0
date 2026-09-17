import { canonicalizeDomainValue } from "../canonical-addressing/index";

import {
  WHOLE_RETURN_VERSION,
  type WholeReturnCrossingEvent,
  type WholeReturnDeclaration,
  type WholeReturnEvent,
  type WholeReturnNativeIdentity,
  type WholeReturnReplay,
  type WholeReturnStatus,
} from "./types";

const WHOLE_RETURN_DOMAIN_PREFIX = "Project0-WholeReturn-v0|";
const SHA256_HEX = /^[0-9a-f]{64}$/;

function fail(code: string): never {
  throw new Error(code);
}

function requireNonBlank(value: unknown, code: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) fail(code);
}

function validateNativeIdentity(identity: WholeReturnNativeIdentity, code: string): void {
  if (!identity || typeof identity !== "object") fail(code);
  requireNonBlank(identity.domain, code);
  requireNonBlank(identity.ref, code);
}

export function validateWholeReturnDeclaration(declaration: WholeReturnDeclaration): void {
  if (!declaration || typeof declaration !== "object") fail("WHOLE_RETURN_INVALID_DECLARATION");
  if (declaration.version !== WHOLE_RETURN_VERSION) fail("WHOLE_RETURN_INVALID_VERSION");

  requireNonBlank(declaration.jobId, "WHOLE_RETURN_INVALID_JOB_ID");
  requireNonBlank(declaration.occurrenceId, "WHOLE_RETURN_INVALID_OCCURRENCE_ID");
  requireNonBlank(declaration.purpose, "WHOLE_RETURN_INVALID_PURPOSE");
  requireNonBlank(declaration.completionCondition, "WHOLE_RETURN_INVALID_COMPLETION_CONDITION");

  if (!Array.isArray(declaration.allowedOperations) || declaration.allowedOperations.length === 0) {
    fail("WHOLE_RETURN_INVALID_ALLOWED_OPERATIONS");
  }
  for (const operation of declaration.allowedOperations) {
    requireNonBlank(operation, "WHOLE_RETURN_INVALID_ALLOWED_OPERATIONS");
  }

  if (!Array.isArray(declaration.participants) || declaration.participants.length < 2) {
    fail("WHOLE_RETURN_TOO_FEW_PARTICIPANTS");
  }

  const participantIds = new Set<string>();
  const identityDomains = new Set<string>();

  for (const participant of declaration.participants) {
    requireNonBlank(participant.participantId, "WHOLE_RETURN_INVALID_PARTICIPANT");
    requireNonBlank(participant.repoRef, "WHOLE_RETURN_INVALID_PARTICIPANT");
    requireNonBlank(participant.revision, "WHOLE_RETURN_INVALID_PARTICIPANT");
    requireNonBlank(participant.adapterVersion, "WHOLE_RETURN_INVALID_PARTICIPANT");
    requireNonBlank(participant.identityDomain, "WHOLE_RETURN_INVALID_PARTICIPANT");

    if (participantIds.has(participant.participantId)) fail("WHOLE_RETURN_DUPLICATE_PARTICIPANT_ID");
    if (identityDomains.has(participant.identityDomain)) fail("WHOLE_RETURN_DUPLICATE_IDENTITY_DOMAIN");

    participantIds.add(participant.participantId);
    identityDomains.add(participant.identityDomain);
  }
}

function participantMap(declaration: WholeReturnDeclaration) {
  return new Map(declaration.participants.map((participant) => [participant.participantId, participant]));
}

function validateCrossing(
  event: WholeReturnCrossingEvent,
  declaration: WholeReturnDeclaration,
): void {
  const participants = participantMap(declaration);
  const producer = participants.get(event.fromParticipantId);
  const consumer = participants.get(event.toParticipantId);

  if (!producer || !consumer) fail("WHOLE_RETURN_UNKNOWN_PARTICIPANT");
  if (producer.participantId === consumer.participantId) fail("WHOLE_RETURN_SAME_PARTICIPANT_CROSSING");

  validateNativeIdentity(event.sourceIdentity, "WHOLE_RETURN_INVALID_NATIVE_IDENTITY");
  validateNativeIdentity(event.destinationIdentity, "WHOLE_RETURN_INVALID_NATIVE_IDENTITY");

  if (event.sourceIdentity.domain !== producer.identityDomain) {
    fail("WHOLE_RETURN_IDENTITY_DOMAIN_MISMATCH");
  }
  if (event.destinationIdentity.domain !== consumer.identityDomain) {
    fail("WHOLE_RETURN_IDENTITY_DOMAIN_MISMATCH");
  }

  requireNonBlank(event.sourceReceiptRef, "WHOLE_RETURN_INVALID_RECEIPT_REF");
  requireNonBlank(event.mappingReceiptRef, "WHOLE_RETURN_INVALID_RECEIPT_REF");

  if (!SHA256_HEX.test(event.sourceArtifactSha256) || !SHA256_HEX.test(event.acceptedArtifactSha256)) {
    fail("WHOLE_RETURN_INVALID_ARTIFACT_HASH");
  }
  if (event.sourceArtifactSha256 !== event.acceptedArtifactSha256) {
    fail("WHOLE_RETURN_ARTIFACT_HASH_MISMATCH");
  }
}

function validateReturnRefs(
  refs: WholeReturnNativeIdentity[],
  declaration: WholeReturnDeclaration,
): void {
  if (!Array.isArray(refs) || refs.length === 0) fail("WHOLE_RETURN_MISSING_RETURN_REF");
  const domains = new Set(declaration.participants.map((participant) => participant.identityDomain));

  for (const ref of refs) {
    validateNativeIdentity(ref, "WHOLE_RETURN_INVALID_RETURN_REF");
    if (!domains.has(ref.domain)) fail("WHOLE_RETURN_UNKNOWN_RETURN_DOMAIN");
  }
}

function assertTransition(status: WholeReturnStatus, event: WholeReturnEvent): void {
  const allowed =
    (status === "declared" && ["crossing", "interrupt", "refuse"].includes(event.kind)) ||
    (status === "running" && ["crossing", "interrupt", "complete", "refuse"].includes(event.kind)) ||
    (status === "interrupted" && ["resume", "refuse"].includes(event.kind));

  if (!allowed) fail("WHOLE_RETURN_ILLEGAL_TRANSITION");
}

export function resumeTokenFor(
  declaration: WholeReturnDeclaration,
  events: WholeReturnEvent[],
  status: WholeReturnStatus,
): string {
  const { digestHex } = canonicalizeDomainValue(WHOLE_RETURN_DOMAIN_PREFIX, {
    declaration,
    events,
    status,
  });
  return `whole-return-sha256:${digestHex}`;
}

export function replayWholeReturn(
  declaration: WholeReturnDeclaration,
  events: WholeReturnEvent[],
): WholeReturnReplay {
  validateWholeReturnDeclaration(declaration);
  if (!Array.isArray(events)) fail("WHOLE_RETURN_INVALID_EVENTS");

  let status: WholeReturnStatus = "declared";
  let activeInterruptionEventId: string | null = null;
  let returnRefs: WholeReturnNativeIdentity[] = [];
  const crossingEventIds: string[] = [];
  const eventIds = new Set<string>();

  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    if (!event || typeof event !== "object") fail("WHOLE_RETURN_INVALID_EVENT");
    if (!Number.isSafeInteger(event.seq) || event.seq !== index + 1) fail("WHOLE_RETURN_SEQUENCE_GAP");
    requireNonBlank(event.eventId, "WHOLE_RETURN_INVALID_EVENT_ID");
    if (eventIds.has(event.eventId)) fail("WHOLE_RETURN_DUPLICATE_EVENT_ID");
    eventIds.add(event.eventId);

    assertTransition(status, event);

    switch (event.kind) {
      case "crossing":
        validateCrossing(event, declaration);
        crossingEventIds.push(event.eventId);
        status = "running";
        break;

      case "interrupt":
        requireNonBlank(event.reason, "WHOLE_RETURN_INVALID_INTERRUPT_REASON");
        activeInterruptionEventId = event.eventId;
        status = "interrupted";
        break;

      case "resume":
        requireNonBlank(event.interruptionEventId, "WHOLE_RETURN_RESUME_MISMATCH");
        if (event.interruptionEventId !== activeInterruptionEventId) {
          fail("WHOLE_RETURN_RESUME_MISMATCH");
        }
        activeInterruptionEventId = null;
        status = "running";
        break;

      case "complete":
        validateReturnRefs(event.returnRefs, declaration);
        returnRefs = event.returnRefs.map((ref) => ({ ...ref }));
        status = "completed";
        break;

      case "refuse":
        requireNonBlank(event.reasonCode, "WHOLE_RETURN_INVALID_REFUSAL");
        if (!Array.isArray(event.evidenceRefs)) fail("WHOLE_RETURN_INVALID_REFUSAL");
        for (const evidenceRef of event.evidenceRefs) {
          requireNonBlank(evidenceRef, "WHOLE_RETURN_INVALID_REFUSAL");
        }
        status = "refused";
        break;

      default: {
        const exhaustive: never = event;
        return exhaustive;
      }
    }
  }

  return {
    jobId: declaration.jobId,
    occurrenceId: declaration.occurrenceId,
    status,
    activeInterruptionEventId,
    crossingEventIds,
    returnRefs,
    resumeToken: resumeTokenFor(declaration, events, status),
  };
}
