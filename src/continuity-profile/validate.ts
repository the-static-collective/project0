import { validateForCanonicalization } from "../canonical-addressing";
import {
  CONTINUITY_LANES,
  CONTINUITY_MODES,
  type ContinuityClaimV0,
  type ContinuityEnvironment,
  type ContinuityLaneClaim,
  type ContinuityLaneKind,
  type ContinuityMode,
} from "./types";

export class ContinuityValidationError extends Error {
  constructor(code: string) {
    super(code);
    this.name = "ContinuityValidationError";
  }
}

const laneKinds = new Set<string>(CONTINUITY_LANES);
const modes = new Set<string>(CONTINUITY_MODES);

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new ContinuityValidationError("CONTINUITY_UNKNOWN_FIELD");
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new ContinuityValidationError("CONTINUITY_MISSING_FIELD");
    }
  }
}

function nonEmptyString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }
  return value;
}

function stringArray(value: unknown, options: { nonEmpty?: boolean } = {}): string[] {
  if (!Array.isArray(value)) throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  if (options.nonEmpty && value.length === 0) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }
  const result = value.map(nonEmptyString);
  assertUnique(result);
  return result;
}

function assertUnique(values: readonly string[]): void {
  if (new Set(values).size !== values.length) {
    throw new ContinuityValidationError("CONTINUITY_DUPLICATE");
  }
}

function validateEnvironment(value: unknown): ContinuityEnvironment {
  const env = record(value);
  exactKeys(env, ["policyRefs", "contextRefs"], ["decoderRef", "runtimeRef"]);
  if (env.decoderRef !== undefined) nonEmptyString(env.decoderRef);
  if (env.runtimeRef !== undefined) nonEmptyString(env.runtimeRef);
  stringArray(env.policyRefs);
  stringArray(env.contextRefs);
  return env as unknown as ContinuityEnvironment;
}

function validateLaneKind(value: unknown): ContinuityLaneKind {
  const lane = nonEmptyString(value);
  if (!laneKinds.has(lane)) throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  return lane as ContinuityLaneKind;
}

function validateMode(value: unknown): ContinuityMode {
  const mode = nonEmptyString(value);
  if (!modes.has(mode)) throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  return mode as ContinuityMode;
}

function validateLane(value: unknown): ContinuityLaneClaim {
  const laneRecord = record(value);
  exactKeys(laneRecord, [
    "lane",
    "mode",
    "dimensions",
    "transformationRefs",
    "residualRefs",
    "uncertainty",
    "doesNotEstablish",
  ]);

  const lane = validateLaneKind(laneRecord.lane);
  validateMode(laneRecord.mode);

  if (!Array.isArray(laneRecord.dimensions)) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }
  const dimensionNames: string[] = [];
  for (const value of laneRecord.dimensions) {
    const dimension = record(value);
    exactKeys(dimension, ["dimension", "evidenceRefs"], ["note"]);
    dimensionNames.push(nonEmptyString(dimension.dimension));
    stringArray(dimension.evidenceRefs, { nonEmpty: true });
    if (dimension.note !== undefined && typeof dimension.note !== "string") {
      throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
    }
  }
  assertUnique(dimensionNames);

  stringArray(laneRecord.transformationRefs);
  stringArray(laneRecord.residualRefs);
  stringArray(laneRecord.uncertainty);
  const doesNotEstablish = stringArray(laneRecord.doesNotEstablish).map(validateLaneKind);
  if (doesNotEstablish.includes(lane)) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }

  return laneRecord as unknown as ContinuityLaneClaim;
}

export function validateContinuityClaim(value: unknown): ContinuityClaimV0 {
  // Representation admission must happen before semantic property reads. The
  // canonicalization validator rejects getters, custom prototypes, cycles,
  // sparse arrays, symbols, functions, undefined values, and unsafe numbers.
  validateForCanonicalization(value);

  const claim = record(value);
  exactKeys(claim, [
    "schema",
    "purpose",
    "subjectRef",
    "ancestorRoots",
    "environment",
    "lanes",
    "outputRefs",
    "parentContinuityRefs",
    "occurrenceClaim",
  ]);

  if (claim.schema !== "p0.continuity/0.1") {
    throw new ContinuityValidationError("CONTINUITY_PROTOCOL_UNSUPPORTED");
  }
  nonEmptyString(claim.purpose);
  nonEmptyString(claim.subjectRef);
  stringArray(claim.ancestorRoots, { nonEmpty: true });
  validateEnvironment(claim.environment);

  if (!Array.isArray(claim.lanes) || claim.lanes.length === 0) {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }
  const lanes = claim.lanes.map(validateLane);
  assertUnique(lanes.map((lane) => lane.lane));

  stringArray(claim.outputRefs);
  stringArray(claim.parentContinuityRefs);
  if (claim.occurrenceClaim !== "continuation-only") {
    throw new ContinuityValidationError("CONTINUITY_INVALID_FIELD");
  }

  return claim as unknown as ContinuityClaimV0;
}
