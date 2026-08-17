import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  corpusEncounterContext,
  encounterAdmittedOptions,
  project0EncounterEnvelope,
} from "../fixtures/world-encounter/project0-to-corpus-os";
import { addressEncounterRecord } from "../src/world-encounter/index";

function run(request: unknown) {
  return spawnSync(process.execPath, [".build/scripts/world-encounter-stdio.js"], {
    input: JSON.stringify(request),
    encoding: "utf8",
  });
}

test("process port returns the exact native encounter identity", () => {
  const native = addressEncounterRecord("exchange_envelope", project0EncounterEnvelope);
  const child = run({
    schema: "project0.world-encounter-process/v0.1",
    operation: "address",
    recordType: "exchange_envelope",
    body: project0EncounterEnvelope,
  });

  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.status, "ok");
  assert.equal(result.addressed.ref, native.ref);
  assert.equal(result.addressed.recordType, "exchange_envelope");
});

test("tampered addressed encounter fails before destination evaluation", () => {
  const addressed = addressEncounterRecord("exchange_envelope", project0EncounterEnvelope);
  const tampered = structuredClone(addressed.body);
  tampered.offered.objectRef = `${tampered.offered.objectRef}-tampered`;

  const child = run({
    schema: "project0.world-encounter-process/v0.1",
    operation: "verify",
    recordType: "exchange_envelope",
    expectedRef: addressed.ref,
    body: tampered,
  });

  assert.notEqual(child.status, 0);
  const result = JSON.parse(child.stdout);
  assert.equal(result.status, "error");
  assert.equal(result.code, "ENCOUNTER_ADDRESS_MISMATCH");
});

test("evaluate operation delegates destination-local disposition", () => {
  const child = run({
    schema: "project0.world-encounter-process/v0.1",
    operation: "evaluate",
    envelope: project0EncounterEnvelope,
    context: corpusEncounterContext,
    options: encounterAdmittedOptions,
  });

  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.status, "ok");
  assert.equal(result.addressed.body.status, "admitted");
  assert.equal(result.addressed.body.reasonCode, "ENCOUNTER_ADMITTED");
});
