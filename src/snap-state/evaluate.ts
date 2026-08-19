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
  validateSnapStateDeclaration(input.declaration);
  const cellValues = validateSnapCellList(input.cells);
  const couplingValues = validateSnapCouplingList(input.couplings);
  validateSnapExcitation(input.excitation);

  const cells = cellValues.map((cell) => addressSnapStateRecord("cell", cell));
  const couplings = couplingValues.map((coupling) => addressSnapStateRecord("coupling", coupling));
  const excitation = addressSnapStateRecord("excitation", input.excitation);

  requireUniqueRefs(cells.map((cell) => cell.ref), "SNAPSTATE_DUPLICATE_CELL");
  requireUniqueRefs(couplings.map((coupling) => coupling.ref), "SNAPSTATE_DUPLICATE_COUPLING");

  if (!sameRefs(cells.map((cell) => cell.ref), input.declaration.cellRefs)
    || !sameRefs(couplings.map((coupling) => coupling.ref), input.declaration.couplingRefs)
    || excitation.ref !== input.declaration.excitationRef) {
    throw new SnapStateValidationError("SNAPSTATE_DECLARATION_INPUT_MISMATCH");
  }

  const cellRefs = new Set(cells.map((cell) => cell.ref));
  if (!cellRefs.has(excitation.body.targetCellRef)) {
    throw new SnapStateValidationError("SNAPSTATE_UNDECLARED_CELL");
  }
  for (const coupling of couplings) {
    if (!cellRefs.has(coupling.body.fromCellRef) || !cellRefs.has(coupling.body.toCellRef)) {
      throw new SnapStateValidationError("SNAPSTATE_UNDECLARED_COUPLING");
    }
  }

  const declaration = addressSnapStateRecord("declaration", input.declaration);
  const currentLoads = new Map(cells.map((cell) => [cell.ref, cell.body.initialLoad]));
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
  }, () => {
    currentLoads.set(targetRef, after);
  });

  const terminal = addressSnapStateRecord("terminal", {
    declarationRef: declaration.ref,
    disposition: exhausted ? "exhausted" : "settled",
    eventRefs: events.map((event) => event.ref),
    snappedCellRefs: [],
    finalLoads: Object.fromEntries(currentLoads.entries()),
    activeCouplingRefs: [],
    remainingBudget: { maxEvents: remainingEvents },
  });

  return {
    declaration,
    inputs: { cells, couplings, excitation },
    events,
    terminal,
  };
}
