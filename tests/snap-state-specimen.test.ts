import assert from "node:assert/strict";
import test from "node:test";

import { SNAP_STATE_SPECIMEN } from "../fixtures/snap-state/specimen";
import {
  addressSnapStateRecord,
  runSnapState,
} from "../src/snap-state/index";

test("baseline specimen replays identically and remains immutable", () => {
  const before = structuredClone(SNAP_STATE_SPECIMEN.baseline);
  const first = runSnapState(SNAP_STATE_SPECIMEN.baseline);
  const second = runSnapState(SNAP_STATE_SPECIMEN.baseline);

  assert.equal(first.declaration.ref, second.declaration.ref);
  assert.deepEqual(first.events.map((event) => event.ref), second.events.map((event) => event.ref));
  assert.equal(first.terminal.ref, second.terminal.ref);
  assert.deepEqual(SNAP_STATE_SPECIMEN.baseline, before);
  assert.ok(Object.isFrozen(SNAP_STATE_SPECIMEN));
  assert.ok(Object.isFrozen(SNAP_STATE_SPECIMEN.baseline.cells));
});

test("identical final loads remain distinct when the event path differs", () => {
  const baseline = runSnapState(SNAP_STATE_SPECIMEN.baseline);
  const contrast = runSnapState(SNAP_STATE_SPECIMEN.zeroTransferHistoryContrast);

  assert.deepEqual(baseline.terminal.body.finalLoads, contrast.terminal.body.finalLoads);
  assert.equal(contrast.events.length, baseline.events.length + 1);
  assert.notDeepEqual(baseline.terminal.body.eventRefs, contrast.terminal.body.eventRefs);
  assert.notEqual(baseline.terminal.ref, contrast.terminal.ref);
});

test("terminal identity preserves ordered event history", () => {
  const baseline = runSnapState(SNAP_STATE_SPECIMEN.baseline);
  const reversed = addressSnapStateRecord("terminal", {
    ...baseline.terminal.body,
    eventRefs: [...baseline.terminal.body.eventRefs].reverse(),
  });

  assert.notEqual(reversed.ref, baseline.terminal.ref);
  assert.deepEqual(reversed.body.eventRefs, [...baseline.terminal.body.eventRefs].reverse());
});

test("below-threshold and partial-chain fixtures preserve active-topology distinctions", () => {
  const below = runSnapState(SNAP_STATE_SPECIMEN.belowThreshold);
  assert.deepEqual(below.terminal.body.snappedCellRefs, []);
  assert.deepEqual(below.terminal.body.activeCouplingRefs, []);

  const partial = runSnapState(SNAP_STATE_SPECIMEN.partialChain);
  const aRef = addressSnapStateRecord("cell", SNAP_STATE_SPECIMEN.partialChain.cells[0]).ref;
  const bRef = addressSnapStateRecord("cell", SNAP_STATE_SPECIMEN.partialChain.cells[1]).ref;
  const abRef = addressSnapStateRecord("coupling", SNAP_STATE_SPECIMEN.partialChain.couplings[0]).ref;
  const bcRef = addressSnapStateRecord("coupling", SNAP_STATE_SPECIMEN.partialChain.couplings[1]).ref;

  assert.deepEqual(partial.terminal.body.snappedCellRefs, [aRef]);
  assert.deepEqual(partial.terminal.body.activeCouplingRefs, [abRef]);
  assert.equal(partial.terminal.body.finalLoads[aRef], 0);
  assert.equal(partial.terminal.body.finalLoads[bRef], 3);
  assert.ok(!partial.terminal.body.activeCouplingRefs.includes(bcRef));
});

test("simultaneous-order specimen snaps by addressed cell ref", () => {
  const specimen = SNAP_STATE_SPECIMEN.simultaneousOrder;
  const expected = specimen.cells
    .filter((cell) => cell.initialLoad >= cell.threshold)
    .map((cell) => addressSnapStateRecord("cell", cell).ref)
    .sort();
  const result = runSnapState(specimen);
  const actual = result.events
    .filter((event) => event.body.kind === "snap")
    .map((event) => event.body.cellRef);

  assert.deepEqual(actual, expected);
});

test("exhaustion fixture reconstructs the exact admitted partial state", () => {
  const result = runSnapState(SNAP_STATE_SPECIMEN.exhaustion);
  assert.equal(result.terminal.body.disposition, "exhausted");
  assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation", "snap"]);
  assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
});
