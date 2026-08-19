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
