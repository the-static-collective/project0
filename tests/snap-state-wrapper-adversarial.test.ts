import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

test("execution wrapper rejects accessors without executing them", () => {
  const cell = { cellId: "wrapper-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const addressedCell = addressSnapStateRecord("cell", cell);
  const excitation = { excitationId: "wrapper-pulse", targetCellRef: addressedCell.ref, amount: 4 };
  const addressedExcitation = addressSnapStateRecord("excitation", excitation);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-wrapper",
    purposeRef: "purpose-wrapper",
    excitationRef: addressedExcitation.ref,
    cellRefs: [addressedCell.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 4 },
  };

  let calls = 0;
  const hostile = {
    get declaration() {
      calls += 1;
      return declaration;
    },
    cells: [cell],
    couplings: [],
    excitation,
  };

  assert.throws(
    () => runSnapState(hostile as never),
    /SNAPSTATE_INVALID_REPRESENTATION/,
  );
  assert.equal(calls, 0);
});
