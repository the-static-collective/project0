import { canonicalizeDomainValue } from "../canonical-addressing/index";
import type {
  SnapCellV01,
  SnapCouplingV01,
  SnapEventRecordV01,
  SnapExcitationV01,
  SnapStateDeclarationV01,
  SnapStateRecordTypeV01,
  SnapStateTerminalRecordV01,
} from "./types";
import {
  SnapStateValidationError,
  validateSnapCell,
  validateSnapCoupling,
  validateSnapEvent,
  validateSnapExcitation,
  validateSnapStateDeclaration,
  validateSnapStateTerminal,
} from "./validate";

export const SNAP_STATE_DOMAIN_PREFIX = "Project0-SnapState-v0.1|";

export type AddressedSnapStateRecord<T> = {
  ref: string;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: SnapStateRecordTypeV01;
  body: T;
};

type SnapStateRecordBody =
  | SnapCellV01
  | SnapCouplingV01
  | SnapExcitationV01
  | SnapStateDeclarationV01
  | SnapEventRecordV01
  | SnapStateTerminalRecordV01;

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeDeclaration(value: SnapStateDeclarationV01): SnapStateDeclarationV01 {
  return {
    protocolVersion: value.protocolVersion,
    snapshotRef: value.snapshotRef,
    purposeRef: value.purposeRef,
    excitationRef: value.excitationRef,
    cellRefs: sortedUnique(value.cellRefs),
    couplingRefs: sortedUnique(value.couplingRefs),
    evaluatorId: value.evaluatorId,
    evaluatorVersion: value.evaluatorVersion,
    orderingRule: value.orderingRule,
    budget: { maxEvents: value.budget.maxEvents },
  };
}

function normalizeEvent(value: SnapEventRecordV01): SnapEventRecordV01 {
  return {
    declarationRef: value.declarationRef,
    eventIndex: value.eventIndex,
    kind: value.kind,
    cellRef: value.cellRef,
    sourceEventRef: value.sourceEventRef,
    couplingRef: value.couplingRef,
    loadBefore: value.loadBefore,
    loadDelta: value.loadDelta,
    loadAfter: value.loadAfter,
  };
}

function normalizeTerminal(value: SnapStateTerminalRecordV01): SnapStateTerminalRecordV01 {
  const finalLoads = Object.fromEntries(
    Object.entries(value.finalLoads).sort(([left], [right]) => left.localeCompare(right)),
  );
  return {
    declarationRef: value.declarationRef,
    disposition: value.disposition,
    eventRefs: [...value.eventRefs],
    snappedCellRefs: sortedUnique(value.snappedCellRefs),
    finalLoads,
    activeCouplingRefs: sortedUnique(value.activeCouplingRefs),
    remainingBudget: { maxEvents: value.remainingBudget.maxEvents },
  };
}

function validateAndNormalize(recordType: SnapStateRecordTypeV01, body: SnapStateRecordBody): SnapStateRecordBody {
  switch (recordType) {
    case "cell":
      validateSnapCell(body);
      return { ...(body as SnapCellV01) };
    case "coupling":
      validateSnapCoupling(body);
      return { ...(body as SnapCouplingV01) };
    case "excitation":
      validateSnapExcitation(body);
      return { ...(body as SnapExcitationV01) };
    case "declaration":
      validateSnapStateDeclaration(body);
      return normalizeDeclaration(body as SnapStateDeclarationV01);
    case "event":
      validateSnapEvent(body);
      return normalizeEvent(body as SnapEventRecordV01);
    case "terminal":
      validateSnapStateTerminal(body);
      return normalizeTerminal(body as SnapStateTerminalRecordV01);
    default:
      throw new SnapStateValidationError("SNAPSTATE_INVALID_RECORD_TYPE");
  }
}

export function addressSnapStateRecord(recordType: "cell", body: SnapCellV01): AddressedSnapStateRecord<SnapCellV01>;
export function addressSnapStateRecord(recordType: "coupling", body: SnapCouplingV01): AddressedSnapStateRecord<SnapCouplingV01>;
export function addressSnapStateRecord(recordType: "excitation", body: SnapExcitationV01): AddressedSnapStateRecord<SnapExcitationV01>;
export function addressSnapStateRecord(recordType: "declaration", body: SnapStateDeclarationV01): AddressedSnapStateRecord<SnapStateDeclarationV01>;
export function addressSnapStateRecord(recordType: "event", body: SnapEventRecordV01): AddressedSnapStateRecord<SnapEventRecordV01>;
export function addressSnapStateRecord(recordType: "terminal", body: SnapStateTerminalRecordV01): AddressedSnapStateRecord<SnapStateTerminalRecordV01>;
export function addressSnapStateRecord(
  recordType: SnapStateRecordTypeV01,
  body: SnapStateRecordBody,
): AddressedSnapStateRecord<SnapStateRecordBody> {
  const normalized = validateAndNormalize(recordType, body);
  const addressed = canonicalizeDomainValue(SNAP_STATE_DOMAIN_PREFIX, {
    recordType,
    body: normalized,
  });
  return {
    ref: `ssr-${addressed.digestHex}`,
    digestHex: addressed.digestHex,
    canonicalBytes: addressed.canonicalBytes,
    recordType,
    body: normalized,
  };
}

export function verifySnapStateRecord(
  recordType: SnapStateRecordTypeV01,
  expectedRef: string,
  body: SnapStateRecordBody,
): AddressedSnapStateRecord<SnapStateRecordBody> {
  if (typeof expectedRef !== "string" || !/^ssr-[0-9a-f]{64}$/.test(expectedRef)) {
    throw new SnapStateValidationError("SNAPSTATE_ADDRESS_MISMATCH");
  }
  const addressed = addressSnapStateRecord(recordType as never, body as never) as AddressedSnapStateRecord<SnapStateRecordBody>;
  if (addressed.ref !== expectedRef) {
    throw new SnapStateValidationError("SNAPSTATE_ADDRESS_MISMATCH");
  }
  return addressed;
}
