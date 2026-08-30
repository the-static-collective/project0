import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  addressEncounterRecord,
  evaluateEncounter,
} from "../src/world-encounter/index";
import {
  addressContinuityClaim,
  verifyContinuityClaim,
} from "../src/continuity-profile/index";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/phaselift/CROSSING-001-source.json", import.meta.url), "utf8"),
);

test("CROSSING-001 source uses existing Project 0 contracts only", () => {
  assert.equal(fixture.schema, "phaselift.source-fixture/v0");
  const addressedEnvelope = addressEncounterRecord("exchange_envelope", fixture.envelope);
  const continuityRef = addressContinuityClaim(fixture.continuityClaim);

  assert.match(addressedEnvelope.ref, /^enc-[0-9a-f]{64}$/);
  assert.match(continuityRef, /^cty-[0-9a-f]{64}$/);
  assert.equal(verifyContinuityClaim(continuityRef, fixture.continuityClaim), true);
  assert.deepEqual(fixture.envelope.sourceAuthorityRefs, ["authority:source-repo-write"]);
  assert.equal(fixture.continuityClaim.occurrenceClaim, "continuation-only");
});

test("LOADOUT-shaped destination may inspect without inheriting source authority", () => {
  const result = evaluateEncounter(
    fixture.envelope,
    fixture.destinationContext,
    fixture.encounterOptions,
  );

  assert.equal(result.body.status, "admitted");
  assert.equal(result.body.inspectedObject, true);
  assert.deepEqual(result.body.destinationAuthorityRefs, ["authority:loadout-local-read"]);
  assert.equal(result.body.destinationAuthorityRefs.includes("authority:source-repo-write"), false);
});
