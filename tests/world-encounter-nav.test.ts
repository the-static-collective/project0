import assert from "node:assert/strict";
import test from "node:test";

import { createNavCrossingReceipt } from "../src/nav-crossing/index";
import { evaluateEncounter } from "../src/world-encounter/index";
import {
  corpusEncounterContext,
  encounterAdmittedOptions,
  encounterIndeterminateOptions,
  encounterRefusedContext,
  project0EncounterEnvelope,
  worldEncounterBefore,
  worldEncounterCrossing,
  buildAdmittedEncounterAfter,
} from "../fixtures/world-encounter/project0-to-corpus-os";

test("Project0 testimony can be admitted by Corpus OS without authority transfer", () => {
  const sourceBefore = structuredClone(project0EncounterEnvelope);
  const result = evaluateEncounter(project0EncounterEnvelope, corpusEncounterContext, encounterAdmittedOptions);
  const after = buildAdmittedEncounterAfter(result);
  const nav = createNavCrossingReceipt(worldEncounterBefore, worldEncounterCrossing, after);

  assert.equal(result.body.status, "admitted");
  assert.equal(result.body.inspectedObject, true);
  assert.deepEqual(result.body.destinationAuthorityRefs, []);
  assert.deepEqual(after.authorityRefs, []);
  assert.equal(after.evidenceRefs.includes(result.ref), true);
  assert.equal(nav.receipt.body.crossingStatus, "materially_changed");
  assert.equal(
    nav.receipt.body.observations.find((item) => item.dimension === "authority")?.disposition,
    "preserved",
  );
  assert.deepEqual(project0EncounterEnvelope, sourceBefore);
});

test("Corpus OS can refuse the same offered witness before inspection", () => {
  const result = evaluateEncounter(project0EncounterEnvelope, encounterRefusedContext, encounterAdmittedOptions);

  assert.equal(result.body.status, "refused");
  assert.equal(result.body.reasonCode, "ENCOUNTER_SCOPE_REQUIRED");
  assert.equal(result.body.inspectedObject, false);
  assert.deepEqual(result.body.destinationAuthorityRefs, []);
});

test("Corpus OS can preserve an indeterminate encounter without coercion", () => {
  const result = evaluateEncounter(project0EncounterEnvelope, corpusEncounterContext, encounterIndeterminateOptions);

  assert.equal(result.body.status, "indeterminate");
  assert.equal(result.body.reasonCode, "ENCOUNTER_INDETERMINATE");
  assert.equal(result.body.inspectedObject, false);
});
