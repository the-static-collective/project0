import assert from "node:assert/strict";
import test from "node:test";

import { addressSnapStateRecord } from "../src/snap-state/index";

const declarationRef = `ssr-${"a".repeat(64)}`;
const cellRef = `ssr-${"b".repeat(64)}`;
const eventRef = `ssr-${"c".repeat(64)}`;
const couplingRef = `ssr-${"d".repeat(64)}`;

function event(overrides: Record<string, unknown> = {}) {
  return {
    declarationRef,
    eventIndex: 0,
    kind: "transfer",
    cellRef,
    sourceEventRef: eventRef,
    couplingRef,
    loadBefore: 2,
    loadDelta: 3,
    loadAfter: 5,
    ...overrides,
  };
}

test("rejects arithmetically inconsistent addressed events", () => {
  assert.throws(
    () => addressSnapStateRecord("event", event({ loadAfter: 6 }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
});

test("transfer events require snap lineage and a coupling", () => {
  assert.throws(
    () => addressSnapStateRecord("event", event({ sourceEventRef: null }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
  assert.throws(
    () => addressSnapStateRecord("event", event({ couplingRef: null }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
});

test("excitation, snap, and recoil fields obey their event-kind contract", () => {
  assert.throws(
    () => addressSnapStateRecord("event", event({
      kind: "excitation",
      sourceEventRef: eventRef,
      couplingRef: null,
    }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
  assert.throws(
    () => addressSnapStateRecord("event", event({
      kind: "snap",
      couplingRef,
      loadDelta: 0,
      loadAfter: 2,
    }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
  assert.throws(
    () => addressSnapStateRecord("event", event({
      kind: "recoil",
      couplingRef: null,
      sourceEventRef: eventRef,
      loadDelta: 1,
      loadAfter: 3,
    }) as never),
    /SNAPSTATE_INVALID_EVENT/,
  );
});
