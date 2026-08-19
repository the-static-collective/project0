import { canonicalizeDomainValue } from "../canonical-addressing";
import type {
  ContinuityClaimV0,
  ContinuityDimension,
  ContinuityLaneClaim,
} from "./types";
import { validateContinuityClaim } from "./validate";

const CONTINUITY_DOMAIN_PREFIX = "Project0-Continuity-v0.1|";
const CONTINUITY_REF_PATTERN = /^cty-[0-9a-f]{64}$/;

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort();
}

function normalizeDimension(value: ContinuityDimension): ContinuityDimension {
  return {
    dimension: value.dimension,
    evidenceRefs: sortedStrings(value.evidenceRefs),
    ...(value.note === undefined ? {} : { note: value.note }),
  };
}

function normalizeLane(value: ContinuityLaneClaim): ContinuityLaneClaim {
  return {
    lane: value.lane,
    mode: value.mode,
    dimensions: value.dimensions
      .map(normalizeDimension)
      .sort((left, right) => left.dimension.localeCompare(right.dimension)),
    transformationRefs: sortedStrings(value.transformationRefs),
    residualRefs: sortedStrings(value.residualRefs),
    uncertainty: sortedStrings(value.uncertainty),
    doesNotEstablish: [...value.doesNotEstablish].sort(),
  };
}

export function normalizeContinuityClaim(value: unknown): ContinuityClaimV0 {
  const claim = validateContinuityClaim(value);

  return {
    schema: claim.schema,
    purpose: claim.purpose,
    subjectRef: claim.subjectRef,
    ancestorRoots: sortedStrings(claim.ancestorRoots),
    environment: {
      ...(claim.environment.decoderRef === undefined ? {} : { decoderRef: claim.environment.decoderRef }),
      ...(claim.environment.runtimeRef === undefined ? {} : { runtimeRef: claim.environment.runtimeRef }),
      policyRefs: sortedStrings(claim.environment.policyRefs),
      contextRefs: sortedStrings(claim.environment.contextRefs),
    },
    lanes: claim.lanes
      .map(normalizeLane)
      .sort((left, right) => left.lane.localeCompare(right.lane)),
    outputRefs: sortedStrings(claim.outputRefs),
    parentContinuityRefs: sortedStrings(claim.parentContinuityRefs),
    occurrenceClaim: claim.occurrenceClaim,
  };
}

export function addressContinuityClaim(value: unknown): string {
  const normalized = normalizeContinuityClaim(value);
  const { digestHex } = canonicalizeDomainValue(CONTINUITY_DOMAIN_PREFIX, normalized);
  return `cty-${digestHex}`;
}

export function verifyContinuityClaim(ref: string, value: unknown): boolean {
  if (!CONTINUITY_REF_PATTERN.test(ref)) return false;
  try {
    return addressContinuityClaim(value) === ref;
  } catch {
    return false;
  }
}
