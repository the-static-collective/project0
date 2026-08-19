import { canonicalizeDomainValue } from "../canonical-addressing/index";
import type { LBranchDeclarationV01 } from "./types";
import { LBranchValidationError, validateLBranchDeclaration } from "./validate";

export const L_BRANCH_DOMAIN_PREFIX = "Project0-LBranch-v0.1|";

export type AddressedLBranchRecord<T> = {
  ref: string;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: "declaration";
  body: T;
};

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeDeclaration(value: LBranchDeclarationV01): LBranchDeclarationV01 {
  return {
    protocolVersion: value.protocolVersion,
    snapshotRef: value.snapshotRef,
    excitationRef: value.excitationRef,
    purposeRef: value.purposeRef,
    participantRefs: sortedUnique(value.participantRefs),
    influenceRefs: sortedUnique(value.influenceRefs),
    authorityRefs: sortedUnique(value.authorityRefs),
    evaluatorId: value.evaluatorId,
    evaluatorVersion: value.evaluatorVersion,
    policyRef: value.policyRef,
    budget: {
      maxSteps: value.budget.maxSteps,
      maxFrontierWidth: value.budget.maxFrontierWidth,
      maxDepth: value.budget.maxDepth,
    },
  };
}

export function addressLBranchRecord(
  recordType: "declaration",
  body: LBranchDeclarationV01,
): AddressedLBranchRecord<LBranchDeclarationV01> {
  if (recordType !== "declaration") {
    throw new LBranchValidationError("LBRANCH_INVALID_RECORD_TYPE");
  }
  validateLBranchDeclaration(body);
  const normalized = normalizeDeclaration(body);
  const addressed = canonicalizeDomainValue(L_BRANCH_DOMAIN_PREFIX, {
    recordType,
    body: normalized,
  });

  return {
    ref: `lbr-${addressed.digestHex}`,
    digestHex: addressed.digestHex,
    canonicalBytes: addressed.canonicalBytes,
    recordType,
    body: normalized,
  };
}

export function verifyLBranchRecord(
  recordType: "declaration",
  expectedRef: string,
  body: LBranchDeclarationV01,
): AddressedLBranchRecord<LBranchDeclarationV01> {
  if (typeof expectedRef !== "string" || !/^lbr-[0-9a-f]{64}$/.test(expectedRef)) {
    throw new LBranchValidationError("LBRANCH_ADDRESS_MISMATCH");
  }
  const addressed = addressLBranchRecord(recordType, body);
  if (addressed.ref !== expectedRef) {
    throw new LBranchValidationError("LBRANCH_ADDRESS_MISMATCH");
  }
  return addressed;
}
