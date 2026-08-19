import { normalizeContinuityClaim } from "./address";
import type {
  ContinuityClaimV0,
  ContinuityLaneClaim,
  StillAliveProjection,
  WhyCurrentProjection,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export function deriveWhyCurrent(value: ContinuityClaimV0): WhyCurrentProjection {
  const claim = normalizeContinuityClaim(value);
  return deepFreeze({
    subjectRef: claim.subjectRef,
    purpose: claim.purpose,
    ancestorRoots: claim.ancestorRoots,
    parentContinuityRefs: claim.parentContinuityRefs,
    environment: claim.environment,
    outputRefs: claim.outputRefs,
    lanes: claim.lanes,
  });
}

export function deriveStillAlive(value: ContinuityClaimV0): StillAliveProjection {
  const claim = normalizeContinuityClaim(value);
  const continuingModes = new Set(["preserved", "transformed", "transferred", "reconstituted"]);
  const continuing: ContinuityLaneClaim[] = [];
  const unresolved: ContinuityLaneClaim[] = [];
  const ended: ContinuityLaneClaim[] = [];

  for (const lane of claim.lanes) {
    if (continuingModes.has(lane.mode)) continuing.push(lane);
    else if (lane.mode === "unresolved") unresolved.push(lane);
    else ended.push(lane);
  }

  const authorityLane = claim.lanes.find((lane) => lane.lane === "authority");
  const authorityEvidence = authorityLane === undefined
    ? []
    : uniqueSorted(authorityLane.dimensions.flatMap((dimension) => dimension.evidenceRefs));

  return deepFreeze({
    continuing,
    unresolved,
    ended,
    residualRefs: uniqueSorted(claim.lanes.flatMap((lane) => lane.residualRefs)),
    authority: {
      declaredMode: authorityLane?.mode ?? null,
      evidenceRefs: authorityEvidence,
      portableEffect: "none",
      externalAdmissionRequired: true,
    },
  });
}
