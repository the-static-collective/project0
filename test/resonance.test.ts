import test from "node:test";
import assert from "node:assert/strict";
import {
  attachPosition,
  missingPositions,
  openMotif,
  proposeClosure,
  recognizeClosure
} from "../src/resonance.js";

function provisional() {
  let motif = openMotif({ source: "source:0", ruptureIntent: "experimental_cut", attractors: ["need:return"] }).motif;
  motif = attachPosition(motif, "transformation", ["rupture:1"]).motif;
  motif = attachPosition(motif, "tension", ["need:return"]).motif;
  motif = attachPosition(motif, "response", ["response:1"]).motif;
  motif = attachPosition(motif, "anchor_state", ["anchor-state:1"]).motif;
  return proposeClosure(motif, [{
    anchor: "anchor:old",
    outcome: "transfigured",
    successorAnchor: "anchor:new",
    evidence: ["anchor-state:1"]
  }]).motif;
}

test("closes a spiral without rewriting the source", () => {
  const before = provisional();
  const after = recognizeClosure(before, {
    disposition: "novel_but_continuous",
    receipt: "recognition:1",
    statedReasons: ["reason:verb-fidelity"]
  }, {
    artifact: "source:1",
    derivedFromSource: "source:0",
    informedByRecognition: "recognition:1"
  }).motif;

  assert.equal(before.positions.source?.[0], "source:0");
  assert.equal(after.positions.source?.[0], "source:0");
  assert.equal(after.successorSource?.artifact, "source:1");
  assert.equal(after.state, "recognized_closed");
  assert.deepEqual(missingPositions(after), []);
});

test("rejects a counterfeit successor source", () => {
  const motif = provisional();
  assert.throws(() => recognizeClosure(motif, {
    disposition: "belongs",
    receipt: "recognition:1",
    statedReasons: ["reason:1"]
  }, {
    artifact: "source:1",
    derivedFromSource: "wrong-source",
    informedByRecognition: "recognition:1"
  }), /immutable source/);
});

test("requires evidence for transfiguration", () => {
  let motif = openMotif({ source: "source:0" }).motif;
  motif = attachPosition(motif, "transformation", ["rupture:1"]).motif;
  motif = attachPosition(motif, "tension", ["tension:1"]).motif;
  motif = attachPosition(motif, "response", ["response:1"]).motif;
  motif = attachPosition(motif, "anchor_state", ["anchor-state:1"]).motif;
  assert.throws(() => proposeClosure(motif, [{
    anchor: "anchor:old",
    outcome: "transfigured",
    evidence: ["anchor-state:1"]
  }]), /successor anchor/);
});
