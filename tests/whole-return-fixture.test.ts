import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  replayWholeReturn,
  type WholeReturnDeclaration,
  type WholeReturnEvent,
  type WholeReturnCrossingEvent,
} from "../src/whole-return/index";

type WholeReturnFixture = {
  note: string;
  declaration: WholeReturnDeclaration;
  events: WholeReturnEvent[];
};

function loadFixture(): WholeReturnFixture {
  const path = join(process.cwd(), "fixtures", "whole-return", "toaster-dogram-return.json");
  return JSON.parse(readFileSync(path, "utf8")) as WholeReturnFixture;
}

test("replays the ecosystem-shaped Toaster to Dogram return fixture", () => {
  const fixture = loadFixture();
  const result = replayWholeReturn(fixture.declaration, fixture.events);

  assert.equal(result.status, "completed");
  assert.match(fixture.note, /example-only/i);

  const toaster = fixture.declaration.participants.find((participant) => participant.participantId === "toaster");
  const dogram = fixture.declaration.participants.find((participant) => participant.participantId === "dogram");
  assert.equal(toaster?.revision, "e8e8fb0");
  assert.equal(dogram?.revision, "a50df93f201ff186f8f3fb73c5c1d2e679415754");

  const firstCrossing = fixture.events.find((event): event is WholeReturnCrossingEvent => event.kind === "crossing");
  assert.ok(firstCrossing);
  assert.equal(firstCrossing.sourceIdentity.domain, "toaster-artifact");
  assert.equal(firstCrossing.destinationIdentity.domain, "dogram-observation");
  assert.notEqual(firstCrossing.sourceIdentity.ref, firstCrossing.destinationIdentity.ref);

  assert.deepEqual(result.returnRefs, [
    { domain: "toaster-artifact", ref: "toaster://render/paired-control/example" },
    { domain: "tranchnode-continuity", ref: "tranchnode://whole-return/example-001" },
  ]);
});
