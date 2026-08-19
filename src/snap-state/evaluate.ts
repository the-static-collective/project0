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
  const snapped = new Set<string>();
  const activeCouplings = new Set<string>();
  const causeByCell = new Map<string, string>();
  const cellByRef = new Map(cells.map((cell) => [cell.ref, cell]));
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
  }, (eventRef) => {
    currentLoads.set(targetRef, after);
    causeByCell.set(targetRef, eventRef);
  });

  const targetCell = cellByRef.get(targetRef)!;
  if (!exhausted && currentLoads.get(targetRef)! >= targetCell.body.threshold) {
    const snapLoad = currentLoads.get(targetRef)!;
    let snapEventRef: string | null = null;
    const outgoing = couplings
      .filter((coupling) => coupling.body.fromCellRef === targetRef)
      .sort((left, right) => left.ref.localeCompare(right.ref));

    const snapAdmitted = admitEvent({
      declarationRef: declaration.ref,
      eventIndex: events.length,
      kind: "snap",
      cellRef: targetRef,
      sourceEventRef: causeByCell.get(targetRef) ?? null,
      couplingRef: null,
      loadBefore: snapLoad,
      loadDelta: 0,
      loadAfter: snapLoad,
    }, (eventRef) => {
      snapEventRef = eventRef;
      snapped.add(targetRef);
      for (const coupling of outgoing) activeCouplings.add(coupling.ref);
    });

    if (snapAdmitted && snapEventRef !== null) {
      for (const coupling of outgoing) {
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
        })) break;
      }

      if (!exhausted) {
        const recoilBefore = currentLoads.get(targetRef)!;
        const recoilAfter = Math.max(0, recoilBefore - targetCell.body.recoilAmount);
        const recoilDelta = recoilAfter - recoilBefore;
        admitEvent({
          declarationRef: declaration.ref,
          eventIndex: events.length,
          kind: "recoil",
          cellRef: targetRef,
          sourceEventRef: snapEventRef,
          couplingRef: null,
          loadBefore: recoilBefore,
          loadDelta: recoilDelta,
          loadAfter: recoilAfter,
        }, (eventRef) => {
          currentLoads.set(targetRef, recoilAfter);
          causeByCell.set(targetRef, eventRef);
        });
      }
    }
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
