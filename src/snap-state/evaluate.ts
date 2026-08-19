import {
  addressSnapStateRecord,
  type AddressedSnapStateRecord,
} from "./address";
import type {
  SnapCellV01,
  SnapCouplingV01,
  SnapEventRecordV01,
  SnapExcitationV01,
  SnapStateDeclarationV01,
  SnapStateTerminalRecordV01,
} from "./types";
import {
  SnapStateValidationError,
  validateSnapCellList,
  validateSnapCouplingList,
  validateSnapExcitation,
  validateSnapStateDeclaration,
} from "./validate";

export type SnapStateExecutionInputV01 = {
  declaration: SnapStateDeclarationV01;
  cells: SnapCellV01[];
  couplings: SnapCouplingV01[];
  excitation: SnapExcitationV01;
};

export type SnapStateExecutionResultV01 = {
  declaration: AddressedSnapStateRecord<SnapStateDeclarationV01>;
  inputs: {
    cells: AddressedSnapStateRecord<SnapCellV01>[];
    couplings: AddressedSnapStateRecord<SnapCouplingV01>[];
    excitation: AddressedSnapStateRecord<SnapExcitationV01>;
  };
  events: AddressedSnapStateRecord<SnapEventRecordV01>[];
  terminal: AddressedSnapStateRecord<SnapStateTerminalRecordV01>;
};

function readExecutionEnvelope(value: unknown): SnapStateExecutionInputV01 {
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
  const expected = ["declaration", "cells", "couplings", "excitation"] as const;
  const expectedSet = new Set<string>(expected);
  if (Object.keys(descriptors).some((key) => !expectedSet.has(key))) {
    throw new SnapStateValidationError("SNAPSTATE_UNKNOWN_FIELD");
  }
  for (const key of expected) {
    const descriptor = descriptors[key];
    if (!descriptor) throw new SnapStateValidationError("SNAPSTATE_MISSING_FIELD");
    if (descriptor.get || descriptor.set || !descriptor.enumerable || !("value" in descriptor)) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    }
  }

  return {
    declaration: descriptors.declaration.value as SnapStateDeclarationV01,
    cells: descriptors.cells.value as SnapCellV01[],
    couplings: descriptors.couplings.value as SnapCouplingV01[],
    excitation: descriptors.excitation.value as SnapExcitationV01,
  };
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

function sameRefs(left: readonly string[], right: readonly string[]): boolean {
  const l = sorted(left);
  const r = sorted(right);
  return l.length === r.length && l.every((value, index) => value === r[index]);
}

function requireUniqueRefs(refs: readonly string[], code: string): void {
  if (new Set(refs).size !== refs.length) throw new SnapStateValidationError(code);
}

export function runSnapState(input: SnapStateExecutionInputV01): SnapStateExecutionResultV01 {
  const safeInput = readExecutionEnvelope(input);
  validateSnapStateDeclaration(safeInput.declaration);
  const cellValues = validateSnapCellList(safeInput.cells);
  const couplingValues = validateSnapCouplingList(safeInput.couplings);
  validateSnapExcitation(safeInput.excitation);

  const cells = cellValues.map((cell) => addressSnapStateRecord("cell", cell));
  const couplings = couplingValues.map((coupling) => addressSnapStateRecord("coupling", coupling));
  const excitation = addressSnapStateRecord("excitation", safeInput.excitation);

  requireUniqueRefs(cells.map((cell) => cell.ref), "SNAPSTATE_DUPLICATE_CELL");
  requireUniqueRefs(couplings.map((coupling) => coupling.ref), "SNAPSTATE_DUPLICATE_COUPLING");

  if (!sameRefs(cells.map((cell) => cell.ref), safeInput.declaration.cellRefs)
    || !sameRefs(couplings.map((coupling) => coupling.ref), safeInput.declaration.couplingRefs)
    || excitation.ref !== safeInput.declaration.excitationRef) {
    throw new SnapStateValidationError("SNAPSTATE_DECLARATION_INPUT_MISMATCH");
  }

  const cellRefs = new Set(cells.map((cell) => cell.ref));
  if (!cellRefs.has(excitation.body.targetCellRef)) {
    throw new SnapStateValidationError("SNAPSTATE_UNDECLARED_CELL");
  }
  for (const coupling of couplings) {
    if (!cellRefs.has(coupling.body.fromCellRef) || !cellRefs.has(coupling.body.toCellRef)) {
      throw new SnapStateValidationError("SNAPSTATE_UNDECLARED_CELL");
    }
  }

  const declaration = addressSnapStateRecord("declaration", safeInput.declaration);
  const currentLoads = new Map(cells.map((cell) => [cell.ref, cell.body.initialLoad]));
  const snapped = new Set<string>();
  const activeCouplings = new Set<string>();
  const causeByCell = new Map<string, string>();
  const cellByRef = new Map(cells.map((cell) => [cell.ref, cell]));
  const outgoing = new Map<string, AddressedSnapStateRecord<SnapCouplingV01>[]>();
  for (const coupling of couplings) {
    const list = outgoing.get(coupling.body.fromCellRef) ?? [];
    list.push(coupling);
    outgoing.set(coupling.body.fromCellRef, list);
  }
  for (const list of outgoing.values()) {
    list.sort((left, right) => left.ref.localeCompare(right.ref));
  }

  const events: AddressedSnapStateRecord<SnapEventRecordV01>[] = [];
  let remainingEvents = declaration.body.budget.maxEvents;
  let exhausted = false;

  function admitEvent(body: SnapEventRecordV01, mutate: (eventRef: string) => void): boolean {
    if (remainingEvents === 0) {
      exhausted = true;
      return false;
    }
    const addressed = addressSnapStateRecord("event", body);
    events.push(addressed);
    mutate(addressed.ref);
    remainingEvents -= 1;
    return true;
  }

  function eligibleCellRefs(): string[] {
    return cells
      .filter((cell) => !snapped.has(cell.ref))
      .filter((cell) => (currentLoads.get(cell.ref) ?? 0) >= cell.body.threshold)
      .map((cell) => cell.ref)
      .sort();
  }

  function processSnap(cellRef: string): boolean {
    const cell = cellByRef.get(cellRef)!;
    const snapLoad = currentLoads.get(cellRef)!;
    const cellOutgoing = outgoing.get(cellRef) ?? [];
    let snapEventRef: string | null = null;

    if (!admitEvent({
      declarationRef: declaration.ref,
      eventIndex: events.length,
      kind: "snap",
      cellRef,
      sourceEventRef: causeByCell.get(cellRef) ?? null,
      couplingRef: null,
      loadBefore: snapLoad,
      loadDelta: 0,
      loadAfter: snapLoad,
    }, (eventRef) => {
      snapEventRef = eventRef;
      snapped.add(cellRef);
      for (const coupling of cellOutgoing) activeCouplings.add(coupling.ref);
    })) return false;

    for (const coupling of cellOutgoing) {
      const transferBefore = currentLoads.get(coupling.body.toCellRef)!;
      const transferAfter = transferBefore + coupling.body.transferAmount;
      if (!Number.isSafeInteger(transferAfter)) {
        throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");
      }
      if (!admitEvent({
        declarationRef: declaration.ref,
        eventIndex: events.length,
        kind: "transfer",
        cellRef: coupling.body.toCellRef,
        sourceEventRef: snapEventRef,
        couplingRef: coupling.ref,
        loadBefore: transferBefore,
        loadDelta: coupling.body.transferAmount,
        loadAfter: transferAfter,
      }, (eventRef) => {
        currentLoads.set(coupling.body.toCellRef, transferAfter);
        causeByCell.set(coupling.body.toCellRef, eventRef);
      })) return false;
    }

    const recoilBefore = currentLoads.get(cellRef)!;
    const recoilAfter = Math.max(0, recoilBefore - cell.body.recoilAmount);
    if (!admitEvent({
      declarationRef: declaration.ref,
      eventIndex: events.length,
      kind: "recoil",
      cellRef,
      sourceEventRef: snapEventRef,
      couplingRef: null,
      loadBefore: recoilBefore,
      loadDelta: recoilAfter - recoilBefore,
      loadAfter: recoilAfter,
    }, (eventRef) => {
      currentLoads.set(cellRef, recoilAfter);
      causeByCell.set(cellRef, eventRef);
    })) return false;

    return true;
  }

  const targetRef = excitation.body.targetCellRef;
  const before = currentLoads.get(targetRef)!;
  const after = before + excitation.body.amount;
  if (!Number.isSafeInteger(after)) throw new SnapStateValidationError("SNAPSTATE_INVALID_EVENT");

  admitEvent({
    declarationRef: declaration.ref,
    eventIndex: events.length,
    kind: "excitation",
    cellRef: targetRef,
    sourceEventRef: null,
    couplingRef: null,
    loadBefore: before,
    loadDelta: excitation.body.amount,
    loadAfter: after,
  }, (eventRef) => {
    currentLoads.set(targetRef, after);
    causeByCell.set(targetRef, eventRef);
  });

  while (!exhausted) {
    const next = eligibleCellRefs()[0];
    if (!next) break;
    if (!processSnap(next)) break;
  }

  const terminal = addressSnapStateRecord("terminal", {
    declarationRef: declaration.ref,
    disposition: exhausted ? "exhausted" : "settled",
    eventRefs: events.map((event) => event.ref),
    snappedCellRefs: [...snapped],
    finalLoads: Object.fromEntries(currentLoads.entries()),
    activeCouplingRefs: [...activeCouplings],
    remainingBudget: { maxEvents: remainingEvents },
  });

  return {
    declaration,
    inputs: { cells, couplings, excitation },
    events,
    terminal,
  };
}
