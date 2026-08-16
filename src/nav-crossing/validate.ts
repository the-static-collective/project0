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

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBJECT);
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBJECT);
  }

  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBJECT);
    }
  }
}

function ownValue(value: Record<string, unknown>, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
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

function assertDataArray(
  value: unknown,
  code: NavValidationCode,
): asserts value is unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) {
    throw new NavValidationError(code);
  }

  const enumerableKeys = Object.keys(value);
  if (enumerableKeys.length !== value.length) {
    throw new NavValidationError(code);
  }

  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new NavValidationError(code);
    }
  }
}

function assertStringArray(value: unknown): asserts value is string[] {
  assertDataArray(value, NAV_VALIDATION_CODES.INVALID_STRING_ARRAY);
  for (let index = 0; index < value.length; index += 1) {
    if (typeof Object.getOwnPropertyDescriptor(value, String(index))?.value !== "string") {
      throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_STRING_ARRAY);
    }
  }
}

export function validateFrameSnapshot(value: unknown): asserts value is FrameSnapshot {
  assertObject(value);
  assertString(ownValue(value, "frameRef"));
  assertNullableString(ownValue(value, "constitutionRef"));
  assertStringArray(ownValue(value, "authorityRefs"));
  assertNullableString(ownValue(value, "decoderRef"));
  assertStringArray(ownValue(value, "evidenceRefs"));
  assertNullableString(ownValue(value, "participantRef"));

  const particularityAnchors = ownValue(value, "particularityAnchors");
  assertObject(particularityAnchors);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(particularityAnchors))) {
    if (descriptor.value !== null && typeof descriptor.value !== "string") {
      throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_PARTICULARITY_ANCHOR);
    }
  }
}

export function validateCrossingDeclaration(value: unknown): asserts value is CrossingDeclaration {
  assertObject(value);
  assertString(ownValue(value, "crossingRef"));
  const kind = ownValue(value, "kind");
  if (typeof kind !== "string" || !CROSSING_KINDS.includes(kind as typeof CROSSING_KINDS[number])) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_CROSSING_KIND);
  }
  assertString(ownValue(value, "declaredPurpose"));
  assertStringArray(ownValue(value, "evidenceRefs"));
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
  const dimension = ownValue(value, "dimension");
  const disposition = ownValue(value, "disposition");
  if (
    typeof dimension !== "string" ||
    typeof disposition !== "string" ||
    !DISPOSITIONS.has(disposition)
  ) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_OBSERVATION);
  }
  assertStringArray(ownValue(value, "beforeRefs"));
  assertStringArray(ownValue(value, "afterRefs"));
  assertStringArray(ownValue(value, "evidenceRefs"));
}

export function validateNavCrossingReceipt(value: unknown): asserts value is NavCrossingReceipt {
  assertObject(value);
  assertString(ownValue(value, "beforeSnapshotRef"));
  assertString(ownValue(value, "crossingDeclarationRef"));
  assertString(ownValue(value, "afterSnapshotRef"));

  const observations = ownValue(value, "observations");
  assertDataArray(observations, NAV_VALIDATION_CODES.INVALID_OBSERVATION);
  for (let index = 0; index < observations.length; index += 1) {
    validateDifferenceObservation(Object.getOwnPropertyDescriptor(observations, String(index))?.value);
  }

  const crossingStatus = ownValue(value, "crossingStatus");
  if (typeof crossingStatus !== "string" || !CROSSING_STATUSES.has(crossingStatus)) {
    throw new NavValidationError(NAV_VALIDATION_CODES.INVALID_CROSSING_STATUS);
  }
}
