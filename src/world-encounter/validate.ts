import { validateForCanonicalization } from "../canonical-addressing/index";
import {
  SOURCE_EPISTEMIC_KINDS,
  SOURCE_VERIFICATION_STATES,
  WORLD_ENCOUNTER_PROTOCOL,
  type DestinationEncounterContextV01,
  type EncounterDispositionV01,
  type ExchangeEnvelopeV01,
  type NodeManifestV01,
  type SafeSourceRefV01,
} from "./types";

export const ENCOUNTER_VALIDATION_CODES = {
  INVALID_REPRESENTATION: "ENCOUNTER_INVALID_REPRESENTATION",
  INVALID_STRING: "ENCOUNTER_INVALID_STRING",
  INVALID_STRING_ARRAY: "ENCOUNTER_INVALID_STRING_ARRAY",
  UNKNOWN_FIELD: "ENCOUNTER_UNKNOWN_FIELD",
  MISSING_FIELD: "ENCOUNTER_MISSING_FIELD",
  PROTOCOL_UNSUPPORTED: "ENCOUNTER_PROTOCOL_UNSUPPORTED",
  SOURCE_INVALID: "ENCOUNTER_SOURCE_INVALID",
  SOURCE_AUTHORITY_TRANSFER: "ENCOUNTER_SOURCE_AUTHORITY_TRANSFER",
  DISPOSITION_INCONSISTENT: "ENCOUNTER_DISPOSITION_INCONSISTENT",
} as const;

export class EncounterValidationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "EncounterValidationError";
  }
}

function fail(code: string): never {
  throw new EncounterValidationError(code);
}

function guardCanonicalRepresentation(value: unknown): void {
  try {
    validateForCanonicalization(value);
  } catch {
    fail(ENCOUNTER_VALIDATION_CODES.INVALID_REPRESENTATION);
  }
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(ENCOUNTER_VALIDATION_CODES.INVALID_REPRESENTATION);
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(ENCOUNTER_VALIDATION_CODES.UNKNOWN_FIELD);
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) fail(ENCOUNTER_VALIDATION_CODES.MISSING_FIELD);
  }
}

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length === 0) fail(ENCOUNTER_VALIDATION_CODES.INVALID_STRING);
}

function assertNullableString(value: unknown): asserts value is string | null {
  if (value !== null) assertString(value);
}

function assertStringArray(value: unknown): asserts value is string[] {
  if (!Array.isArray(value)) fail(ENCOUNTER_VALIDATION_CODES.INVALID_STRING_ARRAY);
  for (const item of value) assertString(item);
}

function validateManifestAfterGuard(value: unknown): asserts value is NodeManifestV01 {
  assertRecord(value);
  assertExactKeys(value, [
    "nodeRef",
    "protocolVersion",
    "accepts",
    "emits",
    "capabilities",
    "requiredScopes",
    "mustNever",
  ]);
  assertString(value.nodeRef);
  if (value.protocolVersion !== WORLD_ENCOUNTER_PROTOCOL) fail(ENCOUNTER_VALIDATION_CODES.PROTOCOL_UNSUPPORTED);
  assertStringArray(value.accepts);
  assertStringArray(value.emits);
  assertStringArray(value.capabilities);
  assertStringArray(value.requiredScopes);
  assertStringArray(value.mustNever);
}

function validateSafeSourceAfterGuard(value: unknown): asserts value is SafeSourceRefV01 {
  assertRecord(value);
  assertExactKeys(value, ["objectRef", "mediaType", "sourceReceiptRefs", "disclosureClass"]);
  assertString(value.objectRef);
  assertNullableString(value.mediaType);
  assertStringArray(value.sourceReceiptRefs);
  assertString(value.disclosureClass);
}

export function validateExchangeEnvelope(value: unknown): asserts value is ExchangeEnvelopeV01 {
  guardCanonicalRepresentation(value);
  assertRecord(value);
  assertExactKeys(value, [
    "protocolVersion",
    "originNodeRef",
    "originFrameRef",
    "originVersionRef",
    "offered",
    "sourceProvenanceRefs",
    "sourceAuthorityRefs",
    "sourceEpistemicKind",
    "sourceVerificationState",
    "capabilityUsed",
    "limitations",
  ]);

  if (value.protocolVersion !== WORLD_ENCOUNTER_PROTOCOL) fail(ENCOUNTER_VALIDATION_CODES.PROTOCOL_UNSUPPORTED);
  assertString(value.originNodeRef);
  assertString(value.originFrameRef);
  assertString(value.originVersionRef);
  validateSafeSourceAfterGuard(value.offered);
  assertStringArray(value.sourceProvenanceRefs);
  assertStringArray(value.sourceAuthorityRefs);
  if (!SOURCE_EPISTEMIC_KINDS.includes(value.sourceEpistemicKind as never)) {
    fail(ENCOUNTER_VALIDATION_CODES.SOURCE_INVALID);
  }
  if (!SOURCE_VERIFICATION_STATES.includes(value.sourceVerificationState as never)) {
    fail(ENCOUNTER_VALIDATION_CODES.SOURCE_INVALID);
  }
  assertString(value.capabilityUsed);
  assertStringArray(value.limitations);
}

export function validateDestinationEncounterContext(
  value: unknown,
): asserts value is DestinationEncounterContextV01 {
  guardCanonicalRepresentation(value);
  assertRecord(value);
  assertExactKeys(value, [
    "destinationNodeRef",
    "destinationFrameRef",
    "manifest",
    "grantedScopes",
    "destinationAuthorityRefs",
  ]);
  assertString(value.destinationNodeRef);
  assertString(value.destinationFrameRef);
  validateManifestAfterGuard(value.manifest);
  assertStringArray(value.grantedScopes);
  assertStringArray(value.destinationAuthorityRefs);
}

const REFUSAL_DISPOSITION_REASONS = new Set([
  "ENCOUNTER_TYPE_NOT_ACCEPTED",
  "ENCOUNTER_CAPABILITY_UNDECLARED",
  "ENCOUNTER_SCOPE_REQUIRED",
  "ENCOUNTER_DISCLOSURE_REFUSED",
]);

export function validateEncounterDisposition(value: unknown): asserts value is EncounterDispositionV01 {
  guardCanonicalRepresentation(value);
  assertRecord(value);
  assertExactKeys(value, [
    "envelopeRef",
    "destinationFrameRef",
    "status",
    "reasonCode",
    "inspectedObject",
    "destinationAuthorityRefs",
    "evidenceRefs",
  ]);
  assertString(value.envelopeRef);
  assertString(value.destinationFrameRef);
  if (value.status !== "admitted" && value.status !== "refused" && value.status !== "indeterminate") {
    fail(ENCOUNTER_VALIDATION_CODES.SOURCE_INVALID);
  }
  assertString(value.reasonCode);
  if (typeof value.inspectedObject !== "boolean") fail(ENCOUNTER_VALIDATION_CODES.INVALID_REPRESENTATION);
  assertStringArray(value.destinationAuthorityRefs);
  assertStringArray(value.evidenceRefs);

  const consistent =
    (value.status === "admitted"
      && value.reasonCode === "ENCOUNTER_ADMITTED"
      && value.inspectedObject === true)
    || (value.status === "indeterminate"
      && value.reasonCode === "ENCOUNTER_INDETERMINATE"
      && value.inspectedObject === false)
    || (value.status === "refused"
      && REFUSAL_DISPOSITION_REASONS.has(value.reasonCode)
      && value.inspectedObject === false);

  if (!consistent) fail(ENCOUNTER_VALIDATION_CODES.DISPOSITION_INCONSISTENT);
}
