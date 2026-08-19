import type {
  ContinuityClaimV0,
  ContinuityLaneClaim,
  ContinuityLaneKind,
} from "./types";
import { validateContinuityClaim } from "./validate";

export type ContinuityConformanceReason =
  | "MISSING_MATERIAL_ROOT"
  | "UNDECLARED_ROOT"
  | "MISSING_PARENT_CONTINUITY"
  | "MISSING_PARENT_ROOT"
  | "LANE_MISMATCH"
  | "BROKEN_PARENT_LANE"
  | "LOST_PARENT_LANE";

export type ContinuityConformanceResult = {
  status: "conforming" | "refused";
  reasonCodes: ContinuityConformanceReason[];
};

function conforming(): ContinuityConformanceResult {
  return { status: "conforming", reasonCodes: [] };
}

function refused(reasonCodes: ContinuityConformanceReason[]): ContinuityConformanceResult {
  return { status: "refused", reasonCodes };
}

function stringSet(values: readonly string[]): Set<string> {
  return new Set(values);
}

function laneClaim(
  claim: ContinuityClaimV0,
  lane: ContinuityLaneKind,
): ContinuityLaneClaim | undefined {
  return claim.lanes.find((item) => item.lane === lane);
}

export function checkContinuityClosure({
  claim: value,
  requiredMaterialRoots,
  allowedMaterialRoots,
}: {
  claim: ContinuityClaimV0;
  requiredMaterialRoots: readonly string[];
  allowedMaterialRoots: readonly string[];
}): ContinuityConformanceResult {
  const claim = validateContinuityClaim(value);
  const declared = stringSet(claim.ancestorRoots);
  const allowed = stringSet(allowedMaterialRoots);
  const reasons: ContinuityConformanceReason[] = [];

  if (requiredMaterialRoots.some((root) => !declared.has(root))) {
    reasons.push("MISSING_MATERIAL_ROOT");
  }
  if (claim.ancestorRoots.some((root) => !allowed.has(root))) {
    reasons.push("UNDECLARED_ROOT");
  }

  return reasons.length === 0 ? conforming() : refused(reasons);
}

export function claimEstablishesLane(
  value: ContinuityClaimV0,
  lane: ContinuityLaneKind,
): boolean {
  const claim = validateContinuityClaim(value);
  return laneClaim(claim, lane) !== undefined;
}

export function checkLaneComposition({
  proposedClaim: proposedValue,
  lane,
  parents: parentValues,
}: {
  proposedClaim: ContinuityClaimV0;
  lane: ContinuityLaneKind;
  parents: Array<{ ref: string; claim: ContinuityClaimV0 }>;
}): ContinuityConformanceResult {
  const proposedClaim = validateContinuityClaim(proposedValue);
  const parents = parentValues.map((parent) => ({
    ref: parent.ref,
    claim: validateContinuityClaim(parent.claim),
  }));
  const proposedParentRefs = stringSet(proposedClaim.parentContinuityRefs);
  const suppliedParentRefs = stringSet(parents.map((parent) => parent.ref));
  const proposedRoots = stringSet(proposedClaim.ancestorRoots);
  const proposedLane = laneClaim(proposedClaim, lane);
  const reasons: ContinuityConformanceReason[] = [];

  if (
    parents.some((parent) => !proposedParentRefs.has(parent.ref))
    || proposedClaim.parentContinuityRefs.some((ref) => !suppliedParentRefs.has(ref))
  ) {
    reasons.push("MISSING_PARENT_CONTINUITY");
  }

  if (parents.some((parent) => parent.claim.ancestorRoots.some((root) => !proposedRoots.has(root)))) {
    reasons.push("MISSING_PARENT_ROOT");
  }

  const parentLanes = parents.map((parent) => laneClaim(parent.claim, lane));
  if (proposedLane === undefined || parentLanes.some((item) => item === undefined)) {
    reasons.push("LANE_MISMATCH");
  }

  if (proposedLane !== undefined) {
    const uninterrupted = new Set(["preserved", "transformed", "transferred"]);
    if (uninterrupted.has(proposedLane.mode)) {
      if (parentLanes.some((item) => item?.mode === "broken")) {
        reasons.push("BROKEN_PARENT_LANE");
      }
      if (parentLanes.some((item) => item?.mode === "lost")) {
        reasons.push("LOST_PARENT_LANE");
      }
    }
  }

  return reasons.length === 0 ? conforming() : refused(reasons);
}
