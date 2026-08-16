import {
  CROSSING_KINDS,
  type CrossingDeclaration,
  type DifferenceObservation,
  type FrameSnapshot,
  type NavCrossingReceipt,
} from "./types";

export const NAV_VALIDATION_CODES = {
  INVALID_OBJECT: "NAV_INVALID_OBJECT",
  INVALID_STRING: "NAV_INVALID_STRING",
  INVALID_NULLABLE_STRING: "NAV_INVALID_NULLABLE_STRING",
  INVALID_STRING_ARRAY: "NAV_INVALID_STRING_ARRAY",
  INVALID_CROSSING_KIND: "NAV_INVALID_CROSSING_KIND",
  INVALID_RECORD_TYPE: "NAV_INVALID_RECORD_TYPE",
  INVALID_PARTICULARITY_ANCHOR: "NAV_INVALID_PARTICULARITY_ANCHOR",
  INVALID_OBSERVATION: "NAV_INVALID_OBSERVATION",
  INVALID_CROSSING_STATUS: "NAV_INVALID_CROSSING_STATUS",
} as const;

export type NavValidationCode = typeof NAV_VALIDATION_CODES[keyof typeof NAV_VALIDATION_CODES];

export class NavValidationError extends Error {
  constructor(readonly code: NavValidationCode) {
    super(code);
    this.name = "NavValidationError";
  }
}

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBJECT);
  }
}

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_STRING);
  }
}

function assertNullableString(value: unknown): asserts value is string | null {
  if (value !== null && typeof value !== "string") {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_NULLABLE_STRING);
  }
}

function assertStringArray(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_STRING_ARRAY);
  }
}

export function validateFrameSnapshot(value: unknown): asserts value is FrameSnapshot {
  assertObject(value);
  assertString(value.frameRef);
  assertNullableString(value.constitutionRef);
  assertStringArray(value.authorityRefs);
  assertNullableString(value.decoderRef);
  assertStringArray(value.evidenceRefs);
  assertNullableString(value.participantRef);
  assertObject(value.particularityAnchors);

  for (const anchor of Object.values(value.particularityAnchors)) {
    if (anchor !== null && typeof anchor !== "string") {
      throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_PARTICULARITY_ANCHOR);
    }
  }
}

export function validateCrossingDeclaration(value: unknown): asserts value is CrossingDeclaration {
  assertObject(value);
  assertString(value.crossingRef);
  if (typeof value.kind !== "string" || !CROSSING_KINDS.includes(value.kind as typeof CROSSING_KINDS[number])) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_CROSSING_KIND);
  }
  assertString(value.declaredPurpose);
  assertStringArray(value.evidenceRefs);
}

const DISPOSITIONS = new Set([
  "preserved",
  "changed",
  "absent_after",
  "new_after",
  "indeterminate",
]);

const CROSSING_STATUSES = new Set([
  "no_material_difference_observed",
  "materially_changed",
  "indeterminate",
]);

function validateDifferenceObservation(value: unknown): asserts value is DifferenceObservation {
  assertObject(value);
  if (
    typeof value.dimension !== "string" ||
    typeof value.disposition !== "string" ||
    !DISPOSITIONS.has(value.disposition)
  ) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBSERVATION);
  }
  assertStringArray(value.beforeRefs);
  assertStringArray(value.afterRefs);
  assertStringArray(value.evidenceRefs);
}

export function validateNavCrossingReceipt(value: unknown): asserts value is NavCrossingReceipt {
  assertObject(value);
  assertString(value.beforeSnapshotRef);
  assertString(value.crossingDeclarationRef);
  assertString(value.afterSnapshotRef);
  if (!Array.isArray(value.observations)) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBSERVATION);
  }
  for (const observation of value.observations) validateDifferenceObservation(observation);
  if (typeof value.crossingStatus !== "string" || !CROSSING_STATUSES.has(value.crossingStatus)) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_CROSSING_STATUS);
  }
}
