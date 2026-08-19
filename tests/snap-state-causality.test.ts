import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

test("zero-delta transfer does not falsely become a later snap cause", () => {
  const A = { cellId: "cause-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const B = { cellId: "cause-B", threshold: 5, initialLoad: 5, recoilAmount: 5 };
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const abBody = {
    couplingId: "cause-AB-zero",
    fromCellRef: a.ref,
    toCellRef: b.ref,
    transferAmount: 0,
    activation: "on-source-snap" as const,
  };
  const ab = addressSnapStateRecord("coupling", abBody);
  const excitationBody = { excitationId: "cause-pulse", targetCellRef: a.ref, amount: 5 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-cause",
    purposeRef: "purpose-cause",
    excitationRef: excitation.ref,
    cellRefs: [a.ref, b.ref],
    couplingRefs: [ab.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };

  const result = runSnapState({
    declaration,
    cells: [A, B],
    couplings: [abBody],
    excitation: excitationBody,
  });

  const bSnap = result.events.find(
    (event) => event.body.kind === "snap" && event.body.cellRef === b.ref,
  );
  assert.ok(bSnap);
  assert.equal(bSnap.body.sourceEventRef, null);
});

test("zero-delta excitation does not falsely become a snap cause", () => {
  const A = { cellId: "cause-excitation-A", threshold: 5, initialLoad: 5, recoilAmount: 5 };
  const a = addressSnapStateRecord("cell", A);
  const excitationBody = { excitationId: "cause-zero-pulse", targetCellRef: a.ref, amount: 0 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-cause-zero",
    purposeRef: "purpose-cause-zero",
    excitationRef: excitation.ref,
    cellRefs: [a.ref],
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

  const snap = result.events.find((event) => event.body.kind === "snap");
  assert.ok(snap);
  assert.equal(snap.body.sourceEventRef, null);
});
