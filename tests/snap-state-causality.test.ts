import assert from "node:assert/strict";
import test from "node:test";

import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

test("zero-delta transfer does not falsely become a later snap cause", () => {
  const A = { cellId: "cause-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
  const a = addressSnapStateRecord("cell", A);

  let B = { cellId: "cause-B-0", threshold: 5, initialLoad: 5, recoilAmount: 5 };
  let b = addressSnapStateRecord("cell", B);
  for (let index = 1; b.ref <= a.ref && index < 1000; index += 1) {
    B = { cellId: `cause-B-${index}`, threshold: 5, initialLoad: 5, recoilAmount: 5 };
    b = addressSnapStateRecord("cell", B);
  }
  assert.ok(a.ref < b.ref, "fixture must force A to snap before initially eligible B");

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

  const snaps = result.events.filter((event) => event.body.kind === "snap");
  assert.equal(snaps[0].body.cellRef, a.ref);
  const bSnap = snaps.find((event) => event.body.cellRef === b.ref);
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

test("positive excitation does not become cause when the cell was already eligible", () => {
  const A = { cellId: "cause-positive-excitation-A", threshold: 5, initialLoad: 5, recoilAmount: 6 };
  const a = addressSnapStateRecord("cell", A);
  const excitationBody = { excitationId: "cause-positive-pulse", targetCellRef: a.ref, amount: 1 };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-cause-positive",
    purposeRef: "purpose-cause-positive",
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

test("later load changes do not overwrite the event that crossed threshold", () => {
  const sourceCandidates = Array.from({ length: 32 }, (_, index) => {
    const body = { cellId: `source-${index}`, threshold: 5, initialLoad: 5, recoilAmount: 5 };
    return { body, addressed: addressSnapStateRecord("cell", body) };
  }).sort((left, right) => left.addressed.ref.localeCompare(right.addressed.ref));

  const targetCandidates = Array.from({ length: 32 }, (_, index) => {
    const body = { cellId: `target-${index}`, threshold: 5, initialLoad: 0, recoilAmount: 6 };
    return { body, addressed: addressSnapStateRecord("cell", body) };
  }).sort((left, right) => right.addressed.ref.localeCompare(left.addressed.ref));

  const firstSource = sourceCandidates[0];
  const secondSource = sourceCandidates[1];
  const target = targetCandidates.find(
    (candidate) => candidate.addressed.ref > secondSource.addressed.ref,
  );
  assert.ok(target, "fixture must place target after both initially eligible sources");

  const firstCouplingBody = {
    couplingId: "first-threshold-crossing",
    fromCellRef: firstSource.addressed.ref,
    toCellRef: target.addressed.ref,
    transferAmount: 5,
    activation: "on-source-snap" as const,
  };
  const secondCouplingBody = {
    couplingId: "later-load-change",
    fromCellRef: secondSource.addressed.ref,
    toCellRef: target.addressed.ref,
    transferAmount: 1,
    activation: "on-source-snap" as const,
  };
  const firstCoupling = addressSnapStateRecord("coupling", firstCouplingBody);
  const secondCoupling = addressSnapStateRecord("coupling", secondCouplingBody);

  const excitationBody = {
    excitationId: "cause-ordering-pulse",
    targetCellRef: firstSource.addressed.ref,
    amount: 0,
  };
  const excitation = addressSnapStateRecord("excitation", excitationBody);
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-cause-ordering",
    purposeRef: "purpose-cause-ordering",
    excitationRef: excitation.ref,
    cellRefs: [firstSource.addressed.ref, secondSource.addressed.ref, target.addressed.ref],
    couplingRefs: [firstCoupling.ref, secondCoupling.ref],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 12 },
  };

  const result = runSnapState({
    declaration,
    cells: [firstSource.body, secondSource.body, target.body],
    couplings: [firstCouplingBody, secondCouplingBody],
    excitation: excitationBody,
  });

  const transfers = result.events.filter(
    (event) => event.body.kind === "transfer" && event.body.cellRef === target.addressed.ref,
  );
  assert.equal(transfers.length, 2);
  const targetSnap = result.events.find(
    (event) => event.body.kind === "snap" && event.body.cellRef === target.addressed.ref,
  );
  assert.ok(targetSnap);
  assert.equal(targetSnap.body.sourceEventRef, transfers[0].ref);
});
