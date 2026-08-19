import {
  L_BRANCH_PROTOCOL_VERSION,
  type LBranchCandidateV01,
  type LBranchDeclarationV01,
  type PropagationBudgetV01,
} from "./types";

export class LBranchValidationError extends Error {
  constructor(code: string) {
    super(code);
    this.name = "LBranchValidationError";
  }
}

function dataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const descriptor of Object.values(descriptors)) {
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
    }
  }

  return value as Record<string, unknown>;
}

function dataArray(value: unknown): unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) {
    throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
  }

  const propertyNames = Object.getOwnPropertyNames(value);
  const expectedNames = new Set<string>(["length"]);
  const items: unknown[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    expectedNames.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
    }
    items.push(descriptor.value);
  }

  if (propertyNames.some((name) => !expectedNames.has(name))) {
    throw new LBranchValidationError("LBRANCH_INVALID_REPRESENTATION");
  }

  return items;
}

function exactKeys(record: Record<string, unknown>, allowed: readonly string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(record)) {
    if (!allowedSet.has(key)) throw new LBranchValidationError("LBRANCH_UNKNOWN_FIELD");
  }
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      throw new LBranchValidationError("LBRANCH_MISSING_FIELD");
    }
  }
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new LBranchValidationError("LBRANCH_INVALID_FIELD");
  }
  return value;
}

function stringArray(record: Record<string, unknown>, key: string): string[] {
  const values = dataArray(record[key]);
  if (values.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new LBranchValidationError("LBRANCH_INVALID_FIELD");
  }
  return values as string[];
}

function positiveSafeInteger(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new LBranchValidationError("LBRANCH_INVALID_BUDGET");
  }
  return value as number;
}

export function validatePropagationBudget(value: unknown): asserts value is PropagationBudgetV01 {
  const record = dataRecord(value);
  exactKeys(record, ["maxSteps", "maxFrontierWidth", "maxDepth"]);
  positiveSafeInteger(record.maxSteps);
  positiveSafeInteger(record.maxFrontierWidth);
  positiveSafeInteger(record.maxDepth);
}

export function validateLBranchDeclaration(value: unknown): asserts value is LBranchDeclarationV01 {
  const record = dataRecord(value);
  exactKeys(record, [
    "protocolVersion",
    "snapshotRef",
    "excitationRef",
    "purposeRef",
    "participantRefs",
    "influenceRefs",
    "authorityRefs",
    "evaluatorId",
    "evaluatorVersion",
    "policyRef",
    "budget",
  ]);

  if (record.protocolVersion !== L_BRANCH_PROTOCOL_VERSION) {
    throw new LBranchValidationError("LBRANCH_PROTOCOL_UNSUPPORTED");
  }
  requiredString(record, "snapshotRef");
  requiredString(record, "excitationRef");
  requiredString(record, "purposeRef");
  stringArray(record, "participantRefs");
  stringArray(record, "influenceRefs");
  stringArray(record, "authorityRefs");
  requiredString(record, "evaluatorId");
  requiredString(record, "evaluatorVersion");
  requiredString(record, "policyRef");
  validatePropagationBudget(record.budget);
}

export function validateLBranchCandidate(value: unknown): asserts value is LBranchCandidateV01 {
  const record = dataRecord(value);
  exactKeys(record, [
    "candidateRef",
    "depth",
    "requiresInputRefs",
    "requiresInfluenceRefs",
    "requiresAuthorityRefs",
    "requiredPolicyRef",
    "terminal",
  ]);

  requiredString(record, "candidateRef");
  const depth = record.depth;
  if (!Number.isSafeInteger(depth) || (depth as number) <= 0) {
    throw new LBranchValidationError("LBRANCH_INVALID_DEPTH");
  }
  stringArray(record, "requiresInputRefs");
  stringArray(record, "requiresInfluenceRefs");
  stringArray(record, "requiresAuthorityRefs");
  requiredString(record, "requiredPolicyRef");
  if (typeof record.terminal !== "boolean") {
    throw new LBranchValidationError("LBRANCH_INVALID_FIELD");
  }
}

export function validateLBranchCandidateList(value: unknown): LBranchCandidateV01[] {
  const items = dataArray(value);
  for (const item of items) validateLBranchCandidate(item);
  return items as LBranchCandidateV01[];
}
