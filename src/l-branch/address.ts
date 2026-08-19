import { canonicalizeDomainValue } from "../canonical-addressing/index";
import type {
  LBranchDeclarationV01,
  LBranchRecordType,
  LBranchStepRecordV01,
  LBranchTerminalRecordV01,
} from "./types";
import { LBranchValidationError, validateLBranchDeclaration } from "./validate";

export const L_BRANCH_DOMAIN_PREFIX = "Project0-LBranch-v0.1|";

export type AddressedLBranchRecord<T> = {
  ref: string;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: LBranchRecordType;
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

function normalizeStep(value: LBranchStepRecordV01): LBranchStepRecordV01 {
  return {
    branchRef: value.branchRef,
    stepIndex: value.stepIndex,
    depth: value.depth,
    inputRefs: sortedUnique(value.inputRefs),
    consideredRefs: sortedUnique(value.consideredRefs),
    eligibleOutputRefs: sortedUnique(value.eligibleOutputRefs),
    refusedOutputRefs: sortedUnique(value.refusedOutputRefs),
    refusalReasonCodes: Object.fromEntries(
      Object.entries(value.refusalReasonCodes).sort(([left], [right]) => left.localeCompare(right)),
    ),
    authorityRefsUsed: sortedUnique(value.authorityRefsUsed),
    influenceRefsConsulted: sortedUnique(value.influenceRefsConsulted),
    remainingBudget: {
      maxSteps: value.remainingBudget.maxSteps,
      maxFrontierWidth: value.remainingBudget.maxFrontierWidth,
      maxDepth: value.remainingBudget.maxDepth,
    },
  };
}

function normalizeTerminal(value: LBranchTerminalRecordV01): LBranchTerminalRecordV01 {
  return {
    branchRef: value.branchRef,
    disposition: value.disposition,
    stepRecordRefs: [...value.stepRecordRefs],
    finalOutputRefs: sortedUnique(value.finalOutputRefs),
    refusedAttemptRefs: sortedUnique(value.refusedAttemptRefs),
    authorityRefsUsed: sortedUnique(value.authorityRefsUsed),
    unusedAuthorityRefs: sortedUnique(value.unusedAuthorityRefs),
    remainingBudget: {
      maxSteps: value.remainingBudget.maxSteps,
      maxFrontierWidth: value.remainingBudget.maxFrontierWidth,
      maxDepth: value.remainingBudget.maxDepth,
    },
  };
}

export function addressLBranchRecord(
  recordType: "declaration",
  body: LBranchDeclarationV01,
): AddressedLBranchRecord<LBranchDeclarationV01>;
export function addressLBranchRecord(
  recordType: "step",
  body: LBranchStepRecordV01,
): AddressedLBranchRecord<LBranchStepRecordV01>;
export function addressLBranchRecord(
  recordType: "terminal",
  body: LBranchTerminalRecordV01,
): AddressedLBranchRecord<LBranchTerminalRecordV01>;
export function addressLBranchRecord(
  recordType: LBranchRecordType,
  body: LBranchDeclarationV01 | LBranchStepRecordV01 | LBranchTerminalRecordV01,
): AddressedLBranchRecord<LBranchDeclarationV01 | LBranchStepRecordV01 | LBranchTerminalRecordV01> {
  let normalized: LBranchDeclarationV01 | LBranchStepRecordV01 | LBranchTerminalRecordV01;
  if (recordType === "declaration") {
    validateLBranchDeclaration(body);
    normalized = normalizeDeclaration(body as LBranchDeclarationV01);
  } else if (recordType === "step") {
    normalized = normalizeStep(body as LBranchStepRecordV01);
  } else if (recordType === "terminal") {
    normalized = normalizeTerminal(body as LBranchTerminalRecordV01);
  } else {
    throw new LBranchValidationError("LBRANCH_INVALID_RECORD_TYPE");
  }

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
