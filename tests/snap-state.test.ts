import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_DOMAIN_PREFIX,
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

const A = { cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const B = { cellId: "B", threshold: 7, initialLoad: 4, recoilAmount: 7 };

test("freezes Snap-State identity", () => {
  assert.equal(SNAP_STATE_PROTOCOL_VERSION, "p0.snap-state/0.1");
  assert.equal(SNAP_STATE_DOMAIN_PREFIX, "Project0-SnapState-v0.1|");
  assert.match(addressSnapStateRecord("cell", A).ref, /^ssr-[0-9a-f]{64}$/);
});

test("normalizes only declaration sets", () => {
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const excitation = addressSnapStateRecord("excitation", {
    excitationId: "pulse-A",
    targetCellRef: a.ref,
    amount: 5,
  });
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-contract",
    purposeRef: "purpose-contract",
    excitationRef: excitation.ref,
    cellRefs: [b.ref, a.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };

  assert.equal(
    addressSnapStateRecord("declaration", declaration).ref,
    addressSnapStateRecord("declaration", { ...declaration, cellRefs: [a.ref, b.ref] }).ref,
  );
});

test("settles below threshold after one addressed excitation", () => {
  const cell = addressSnapStateRecord("cell", A);
  const excitationBody = {
    excitationId: "pulse-below",
    targetCellRef: cell.ref,
    amount: 4,
  };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-below",
    purposeRef: "purpose-below",
    excitationRef: excitation.ref,
    cellRefs: [cell.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 4 },
  };

  const result = runSnapState({
    declaration,
    cells: [A],
    couplings: [],
    excitation: excitationBody,
  });

  assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation"]);
  assert.equal(result.events[0].body.loadAfter, 4);
  assert.equal(result.terminal.body.disposition, "settled");
  assert.deepEqual(result.terminal.body.snappedCellRefs, []);
  assert.deepEqual(result.terminal.body.activeCouplingRefs, []);
  assert.equal(result.terminal.body.finalLoads[cell.ref], 4);
});

test("records one snap, declared transfer, and recoil with causal lineage", () => {
  const passiveB = { cellId: "B-passive", threshold: 10, initialLoad: 0, recoilAmount: 10 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", passiveB);
  const couplingBody = {
    couplingId: "AB",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 3,
    activation: "on-source-snap" as const,
  };
  const coupling = addressSnapStateRecord("coupling", couplingBody);
  const excitationBody = {
    excitationId: "pulse-threshold",
    targetCellRef: a.ref,
    amount: 5,
  };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-one-snap",
    purposeRef: "purpose-one-snap",
    excitationRef: excitation.ref,
    cellRefs: [a.ref, b.ref],
    couplingRefs: [coupling.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };

  const result = runSnapState({
    declaration,
    cells: [A, passiveB],
    couplings: [couplingBody],
    excitation: excitationBody,
  });

  assert.deepEqual(result.events.map((event) => event.body.kind), [
    "excitation",
    "snap",
    "transfer",
    "recoil",
  ]);
  const [excitationEvent, snapEvent, transferEvent, recoilEvent] = result.events;
  assert.equal(snapEvent.body.sourceEventRef, excitationEvent.ref);
  assert.equal(transferEvent.body.sourceEventRef, snapEvent.ref);
  assert.equal(transferEvent.body.couplingRef, coupling.ref);
  assert.equal(recoilEvent.body.sourceEventRef, snapEvent.ref);
  assert.deepEqual(result.terminal.body.snappedCellRefs, [a.ref]);
  assert.deepEqual(result.terminal.body.activeCouplingRefs, [coupling.ref]);
  assert.equal(result.terminal.body.finalLoads[a.ref], 0);
  assert.equal(result.terminal.body.finalLoads[b.ref], 3);
});

test("cascades the approved three-cell specimen and returns loads to baseline", () => {
  const C = { cellId: "C", threshold: 6, initialLoad: 2, recoilAmount: 6 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const c = addressSnapStateRecord("cell", C);
  const abBody = {
    couplingId: "AB",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 3,
    activation: "on-source-snap" as const,
  };
  const bcBody = {
    couplingId: "BC",
    fromCellRef: b.ref,
    toCellRef: c.ref,
    transferAmount: 4,
    activation: "on-source-snap" as const,
  };
  const ab = addressSnapStateRecord("coupling", abBody);
  const bc = addressSnapStateRecord("coupling", bcBody);
  const excitationBody = { excitationId: "pulse-baseline", targetCellRef: a.ref, amount: 5 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-baseline",
    purposeRef: "purpose-baseline",
    excitationRef: excitation.ref,
    cellRefs: [c.ref, a.ref, b.ref],
    couplingRefs: [bc.ref, ab.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 12 },
  };

  const result = runSnapState({
    declaration,
    cells: [C, A, B],
    couplings: [bcBody, abBody],
    excitation: excitationBody,
  });

  assert.equal(result.terminal.body.disposition, "settled");
  const snaps = result.events.filter((event) => event.body.kind === "snap");
  assert.deepEqual(snaps.map((event) => event.body.cellRef).sort(), [a.ref, b.ref, c.ref].sort());
  assert.equal(snaps.length, 3);
  assert.deepEqual(result.terminal.body.activeCouplingRefs, [ab.ref, bc.ref].sort());
  assert.equal(result.terminal.body.finalLoads[a.ref], 0);
  assert.equal(result.terminal.body.finalLoads[b.ref], 0);
  assert.equal(result.terminal.body.finalLoads[c.ref], 0);
});

test("orders simultaneously eligible cells by addressed cell ref", () => {
  const target = { cellId: "target", threshold: 10, initialLoad: 0, recoilAmount: 10 };
  const loadedOne = { cellId: "loaded-one", threshold: 5, initialLoad: 5, recoilAmount: 5 };
  const loadedTwo = { cellId: "loaded-two", threshold: 4, initialLoad: 4, recoilAmount: 4 };
  const t = addressSnapStateRecord("cell", target);
  const one = addressSnapStateRecord("cell", loadedOne);
  const two = addressSnapStateRecord("cell", loadedTwo);
  const excitationBody = { excitationId: "pulse-tie", targetCellRef: t.ref, amount: 1 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-tie",
    purposeRef: "purpose-tie",
    excitationRef: excitation.ref,
    cellRefs: [two.ref, t.ref, one.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };

  const result = runSnapState({
    declaration,
    cells: [loadedTwo, target, loadedOne],
    couplings: [],
    excitation: excitationBody,
  });

  const snapRefs = result.events
    .filter((event) => event.body.kind === "snap")
    .map((event) => event.body.cellRef);
  assert.deepEqual(snapRefs, [one.ref, two.ref].sort());
});
