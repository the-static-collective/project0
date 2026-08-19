import type {
  ContinuityClaimV0,
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

// Imported now because the same bounded module will own explicit composition
// checks in the next TDD task. It is intentionally unused until those tests
// demand behavior; no automatic composition is provided here.
void (undefined as unknown as ContinuityLaneKind);
