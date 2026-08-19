import {
  SNAP_STATE_PROTOCOL_VERSION,
  type SnapCellV01,
  type SnapCouplingV01,
  type SnapEventRecordV01,
  type SnapExcitationV01,
  type SnapStateBudgetV01,
  type SnapStateDeclarationV01,
  type SnapStateTerminalRecordV01,
} from "./types";

export class SnapStateValidationError extends Error {
  constructor(code: string) {
    super(code);
    this.name = "SnapStateValidationError";
  }
}

const SNAP_REF = /^ssr-[0-9a-f]{64}$/;

function dataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const descriptor of Object.values(descriptors)) {
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    }
  }
  return value as Record<string, unknown>;
}

function dataArray(value: unknown): unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  const names = Object.getOwnPropertyNames(value);
  const expected = new Set<string>(["length"]);
  const out: unknown[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    expected.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    }
    out.push(descriptor.value);
  }
  if (names.some((name) => !expected.has(name))) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  return out;
}

function exactKeys(record: Record<string, unknown>, allowed: readonly string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(record)) {
    if (!allowedSet.has(key)) throw new SnapStateValidationError("SNAPSTATE_UNKNOWN_FIELD");
  }
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      throw new SnapStateValidationError("SNAPSTATE_MISSING_FIELD");
    }
  }
}

function requiredString(record: Record<string, unknown>, key: string, code = "SNAPSTATE_INVALID_FIELD"): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new SnapStateValidationError(code);
  }
  return value;
}

function requiredRef(record: Record<string, unknown>, key: string, code = "SNAPSTATE_INVALID_FIELD"): string {
  const value = requiredString(record, key, code);
  if (!SNAP_REF.test(value)) throw new SnapStateValidationError(code);
  return value;
}

function nullableRef(record: Record<string, unknown>, key: string, code: string): string | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== "string" || !SNAP_REF.test(value)) throw new SnapStateValidationError(code);
  return value;
}

function refArray(record: Record<string, unknown>, key: string, code = "SNAPSTATE_INVALID_FIELD"): string[] {
  const values = dataArray(record[key]);
  if (values.some((value) => typeof value !== "string" || !SNAP_REF.test(value))) {
    throw new SnapStateValidationError(code);
  }
  return values as string[];
}

function positiveSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) throw new SnapStateValidationError(code);
  return value as number;
}

function nonNegativeSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new SnapStateValidationError(code);
  return value as number;
}

function signedSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value)) throw new SnapStateValidationError(code);
  return value as number;
}

export function validateSnapStateBudget(value: unknown): asserts value is SnapStateBudgetV01 {
  const record = dataRecord(value);
  exactKeys(record, ["maxEvents"]);
  positiveSafeInteger(record.maxEvents, "SNAPSTATE_INVALID_BUDGET");
}

function validateRemainingBudget(value: unknown): asserts value is SnapStateBudgetV01 {
  const record = dataRecord(value);
  exactKeys(record, ["maxEvents"]);
  nonNegativeSafeInteger(record.maxEvents, "SNAPSTATE_INVALID_TERMINAL");
}

export function validateSnapCell(value: unknown): asserts value is SnapCellV01 {
  const record = dataRecord(value);
  exactKeys(record, ["cellId", "threshold", "initialLoad", "recoilAmount"]);
  requiredString(record, "cellId", "SNAPSTATE_INVALID_CELL");
  positiveSafeInteger(record.threshold, "SNAPSTATE_INVALID_CELL");
  nonNegativeSafeInteger(record.initialLoad, "SNAPSTATE_INVALID_CELL");
  nonNegativeSafeInteger(record.recoilAmount, "SNAPSTATE_INVALID_CELL");
}

export function validateSnapCoupling(value: unknown): asserts value is SnapCouplingV01 {
  const record = dataRecord(value);
  exactKeys(record, ["couplingId", "fromCellRef", "toCellRef", "transferAmount", "activation"]);
  requiredString(record, "couplingId", "SNAPSTATE_INVALID_COUPLING");
  requiredRef(record, "fromCellRef", "SNAPSTATE_INVALID_COUPLING");
  requiredRef(record, "toCellRef", "SNAPSTATE_INVALID_COUPLING");
  nonNegativeSafeInteger(record.transferAmount, "SNAPSTATE_INVALID_COUPLING");
  if (record.activation !== "on-source-snap") throw new SnapStateValidationError("SNAPSTATE_INVALID_COUPLING");
}

export function validateSnapExcitation(value: unknown): asserts value is SnapExcitationV01 {
  const record = dataRecord(value);
  exactKeys(record, ["excitationId", "targetCellRef", "amount"]);
  requiredString(record, "excitationId", "SNAPSTATE_INVALID_EXCITATION");
  requiredRef(record, "targetCellRef", "SNAPSTATE_INVALID_EXCITATION");
  nonNegativeSafeInteger(record.amount, "SNAPSTATE_INVALID_EXCITATION");
}

export function validateSnapStateDeclaration(value: unknown): asserts value is SnapStateDeclarationV01 {
  const record = dataRecord(value);
  exactKeys(record, [
    "protocolVersion",
    "snapshotRef",
    "purposeRef",
    "excitationRef",
    "cellRefs",
    "couplingRefs",
    "evaluatorId",
    "evaluatorVersion",
    "orderingRule",
    "budget",
  ]);
  if (record.protocolVersion !== SNAP_STATE_PROTOCOL_VERSION) {
    throw new SnapStateValidationError("SNAPSTATE_PROTOCOL_UNSUPPORTED");
  }
  requiredString(record, "snapshotRef");
  requiredString(record, "purposeRef");
  requiredRef(record, "excitationRef");
  refArray(record, "cellRefs");
  refArray(record, "couplingRefs");
  requiredString(record, "evaluatorId");
  requiredString(record, "evaluatorVersion");
  if (record.orderingRule !== "cell-ref-lexicographic") {
    throw new SnapStateValidationError("SNAPSTATE_ORDERING_UNSUPPORTED");
  }
  validateSnapStateBudget(record.budget);
}

export function validateSnapEvent(value: unknown): asserts value is SnapEventRecordV01 {
  const record = dataRecord(value);
  exactKeys(record, [
    "declarationRef",
    "eventIndex",
    "kind",
    "cellRef",
    "sourceEventRef",
    "couplingRef",
    "loadBefore",
    "loadDelta",
    "loadAfter",
  ]);
  requiredRef(record, "declarationRef", "SNAPSTATE_INVALID_EVENT");
  nonNegativeSafeInteger(record.eventIndex, "SNAPSTATE_INVALID_EVENT");
  const kind = record.kind;
  if (kind !== "excitation" && kind !== "snap" && kind !== "transfer" && kind !== "recoil") {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
  }
  requiredRef(record, "cellRef", "SNAPSTATE_INVALID_EVENT");
  const sourceEventRef = nullableRef(record, "sourceEventRef", "SNAPSTATE_INVALID_EVENT");
  const couplingRef = nullableRef(record, "couplingRef", "SNAPSTATE_INVALID_EVENT");
  const loadBefore = nonNegativeSafeInteger(record.loadBefore, "SNAPSTATE_INVALID_EVENT");
  const loadDelta = signedSafeInteger(record.loadDelta, "SNAPSTATE_INVALID_EVENT");
  const loadAfter = nonNegativeSafeInteger(record.loadAfter, "SNAPSTATE_INVALID_EVENT");

  const computedAfter = loadBefore + loadDelta;
  if (!Number.isSafeInteger(computedAfter) || computedAfter !== loadAfter) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
  }

  if (kind === "excitation") {
    if (sourceEventRef !== null || couplingRef !== null || loadDelta < 0) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
    }
  } else if (kind === "snap") {
    if (couplingRef !== null || loadDelta !== 0) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
    }
  } else if (kind === "transfer") {
    if (sourceEventRef === null || couplingRef === null || loadDelta < 0) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
    }
  } else if (sourceEventRef === null || couplingRef !== null || loadDelta > 0) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
  }
}

export function validateSnapStateTerminal(value: unknown): asserts value is SnapStateTerminalRecordV01 {
  const record = dataRecord(value);
  exactKeys(record, [
    "declarationRef",
    "disposition",
    "eventRefs",
    "snappedCellRefs",
    "finalLoads",
    "activeCouplingRefs",
    "remainingBudget",
  ]);
  requiredRef(record, "declarationRef", "SNAPSTATE_INVALID_TERMINAL");
  if (record.disposition !== "settled" && record.disposition !== "exhausted") {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_TERMINAL");
  }
  refArray(record, "eventRefs", "SNAPSTATE_INVALID_TERMINAL");
  refArray(record, "snappedCellRefs", "SNAPSTATE_INVALID_TERMINAL");
  refArray(record, "activeCouplingRefs", "SNAPSTATE_INVALID_TERMINAL");
  const finalLoads = dataRecord(record.finalLoads);
  for (const [key, load] of Object.entries(finalLoads)) {
    if (!SNAP_REF.test(key)) throw new SnapStateValidationError("SNAPSTATE_INVALID_TERMINAL");
    nonNegativeSafeInteger(load, "SNAPSTATE_INVALID_TERMINAL");
  }
  validateRemainingBudget(record.remainingBudget);
}

export function validateSnapCellList(value: unknown): SnapCellV01[] {
  const items = dataArray(value);
  for (const item of items) validateSnapCell(item);
  return items as SnapCellV01[];
}

export function validateSnapCouplingList(value: unknown): SnapCouplingV01[] {
  const items = dataArray(value);
  for (const item of items) validateSnapCoupling(item);
  return items as SnapCouplingV01[];
}
