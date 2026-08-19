import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

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
