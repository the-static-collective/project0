import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

function singleCellInput() {
  const cell = { cellId: "defense-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const addressed = addressSnapStateRecord("cell", cell);
  const excitation = { excitationId: "defense-pulse", targetCellRef: addressed.ref, amount: 4 };
  const addressedExcitation = addressSnapStateRecord("excitation", excitation);
  return {
    cell,
    addressed,
    input: {
      declaration: {
        protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
        snapshotRef: "snapshot-defense",
        purposeRef: "purpose-defense",
        excitationRef: addressedExcitation.ref,
        cellRefs: [addressed.ref],
        couplingRefs: [],
        evaluatorId: "snap-state-reference",
        evaluatorVersion: "0.1.0",
        orderingRule: "cell-ref-lexicographic" as const,
        budget: { maxEvents: 4 },
      },
      cells: [cell],
      couplings: [],
      excitation,
    },
  };
}

test("a declared cycle cannot make one cell snap twice", () => {
  const A = { cellId: "cycle-A", threshold: 5, initialLoad: 0, recoilAmount: 0 };
  const B = { cellId: "cycle-B", threshold: 5, initialLoad: 0, recoilAmount: 0 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const abBody = {
    couplingId: "cycle-AB",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 5,
    activation: "on-source-snap" as const,
  };
  const baBody = {
    couplingId: "cycle-BA",
    fromCellRef: b.ref,
    toCellRef: a.ref,
    transferAmount: 5,
    activation: "on-source-snap" as const,
  };
  const ab = addressSnapStateRecord("coupling", abBody);
  const ba = addressSnapStateRecord("coupling", baBody);
  const excitationBody = { excitationId: "cycle-pulse", targetCellRef: a.ref, amount: 5 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-cycle",
    purposeRef: "purpose-cycle",
    excitationRef: excitation.ref,
    cellRefs: [a.ref, b.ref],
    couplingRefs: [ab.ref, ba.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };

  const result = runSnapState({
    declaration,
    cells: [A, B],
    couplings: [abBody, baBody],
    excitation: excitationBody,
  });

  const snaps = result.events.filter((event) => event.body.kind === "snap");
  assert.equal(snaps.filter((event) => event.body.cellRef === a.ref).length, 1);
  assert.equal(snaps.filter((event) => event.body.cellRef === b.ref).length, 1);
  assert.equal(result.terminal.body.disposition, "settled");
});

test("exhaustion after an admitted snap leaves no hidden transfer or recoil mutation", () => {
  const A = { cellId: "budget-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const B = { cellId: "budget-B", threshold: 10, initialLoad: 0, recoilAmount: 10 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const abBody = {
    couplingId: "budget-AB",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 3,
    activation: "on-source-snap" as const,
  };
  const ab = addressSnapStateRecord("coupling", abBody);
  const excitationBody = { excitationId: "budget-pulse", targetCellRef: a.ref, amount: 5 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-budget",
    purposeRef: "purpose-budget",
    excitationRef: excitation.ref,
    cellRefs: [a.ref, b.ref],
    couplingRefs: [ab.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 2 },
  };

  const result = runSnapState({
    declaration,
    cells: [A, B],
    couplings: [abBody],
    excitation: excitationBody,
  });

  assert.equal(result.terminal.body.disposition, "exhausted");
  assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation", "snap"]);
  assert.equal(result.terminal.body.finalLoads[a.ref], 5);
  assert.equal(result.terminal.body.finalLoads[b.ref], 0);
  assert.deepEqual(result.terminal.body.snappedCellRefs, [a.ref]);
  assert.deepEqual(result.terminal.body.activeCouplingRefs, [ab.ref]);
  assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
});

test("using the exact event budget may still settle", () => {
  const A = { cellId: "exact-budget-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const a = addressSnapStateRecord("cell", A);
  const excitationBody = { excitationId: "exact-budget-pulse", targetCellRef: a.ref, amount: 4 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-exact-budget",
    purposeRef: "purpose-exact-budget",
    excitationRef: excitation.ref,
    cellRefs: [a.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 1 },
  };

  const result = runSnapState({
    declaration,
    cells: [A],
    couplings: [],
    excitation: excitationBody,
  });

  assert.equal(result.terminal.body.disposition, "settled");
  assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
  assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation"]);
});

test("record validation rejects an accessor without executing it", () => {
  let calls = 0;
  const hostile = {
    cellId: "hostile-A",
    threshold: 5,
    initialLoad: 0,
    get recoilAmount() {
      calls += 1;
      return 5;
    },
  };

  assert.throws(
    () => addressSnapStateRecord("cell", hostile as never),
    /SNAPSTATE_INVALID_REPRESENTATION/,
  );
  assert.equal(calls, 0);
});

test("cell-list validation rejects an accessor entry without executing it", () => {
  const base = singleCellInput();
  let calls = 0;
  const cells = [base.cell];
  Object.defineProperty(cells, "0", {
    get() {
      calls += 1;
      return base.cell;
    },
    enumerable: true,
    configurable: true,
  });

  assert.throws(
    () => runSnapState({ ...base.input, cells: cells as never }),
    /SNAPSTATE_INVALID_REPRESENTATION/,
  );
  assert.equal(calls, 0);
});

test("cell-list validation rejects sparse, extra-property, and symbol arrays", () => {
  const base = singleCellInput();
  const sparse = new Array(2);
  sparse[0] = base.cell;

  const extra = [base.cell];
  Object.defineProperty(extra, "surprise", { value: 1, enumerable: true });

  const symbols = [base.cell];
  Object.defineProperty(symbols, Symbol("x"), { value: 1, enumerable: true });

  for (const cells of [sparse, extra, symbols]) {
    assert.throws(
      () => runSnapState({ ...base.input, cells: cells as never }),
      /SNAPSTATE_INVALID_REPRESENTATION/,
    );
  }
});

test("duplicate supplied addressed cells fail before declaration-set comparison", () => {
  const base = singleCellInput();
  assert.throws(
    () => runSnapState({ ...base.input, cells: [base.cell, base.cell] }),
    /SNAPSTATE_DUPLICATE_CELL/,
  );
});

test("duplicate supplied addressed couplings fail before declaration-set comparison", () => {
  const A = { cellId: "duplicate-coupling-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const B = { cellId: "duplicate-coupling-B", threshold: 10, initialLoad: 0, recoilAmount: 10 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const couplingBody = {
    couplingId: "duplicate-coupling-AB",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 1,
    activation: "on-source-snap" as const,
  };
  const coupling = addressSnapStateRecord("coupling", couplingBody);
  const excitationBody = { excitationId: "duplicate-coupling-pulse", targetCellRef: a.ref, amount: 1 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);

  assert.throws(
    () => runSnapState({
      declaration: {
        protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
        snapshotRef: "snapshot-duplicate-coupling",
        purposeRef: "purpose-duplicate-coupling",
        excitationRef: excitation.ref,
        cellRefs: [a.ref, b.ref],
        couplingRefs: [coupling.ref],
        evaluatorId: "snap-state-reference",
        evaluatorVersion: "0.1.0",
        orderingRule: "cell-ref-lexicographic",
        budget: { maxEvents: 4 },
      },
      cells: [A, B],
      couplings: [couplingBody, couplingBody],
      excitation: excitationBody,
    }),
    /SNAPSTATE_DUPLICATE_COUPLING/,
  );
});

test("declaration and supplied addressed input sets must match exactly", () => {
  const base = singleCellInput();
  const B = { cellId: "mismatch-B", threshold: 10, initialLoad: 0, recoilAmount: 10 };
  assert.throws(
    () => runSnapState({ ...base.input, cells: [base.cell, B] }),
    /SNAPSTATE_DECLARATION_INPUT_MISMATCH/,
  );
});

test("a coupling endpoint outside the declared cell envelope is an undeclared cell", () => {
  const base = singleCellInput();
  const outsider = addressSnapStateRecord("cell", {
    cellId: "outsider",
    threshold: 9,
    initialLoad: 0,
    recoilAmount: 9,
  });
  const couplingBody = {
    couplingId: "outside-endpoint",
    fromCellRef: base.addressed.ref,
    toCellRef: outsider.ref,
    transferAmount: 1,
    activation: "on-source-snap" as const,
  };
  const coupling = addressSnapStateRecord("coupling", couplingBody);

  assert.throws(
    () => runSnapState({
      ...base.input,
      declaration: {
        ...base.input.declaration,
        couplingRefs: [coupling.ref],
      },
      couplings: [couplingBody],
    }),
    /SNAPSTATE_UNDECLARED_CELL/,
  );
});

test("an excitation target outside the declared cell envelope is refused", () => {
  const base = singleCellInput();
  const outsider = addressSnapStateRecord("cell", {
    cellId: "excitation-outsider",
    threshold: 9,
    initialLoad: 0,
    recoilAmount: 9,
  });
  const excitationBody = {
    excitationId: "outside-excitation",
    targetCellRef: outsider.ref,
    amount: 1,
  };
  const excitation = addressSnapStateRecord("excitation", excitationBody);

  assert.throws(
    () => runSnapState({
      ...base.input,
      declaration: {
        ...base.input.declaration,
        excitationRef: excitation.ref,
      },
      excitation: excitationBody,
    }),
    /SNAPSTATE_UNDECLARED_CELL/,
  );
});
