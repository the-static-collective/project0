import {
  attachPosition,
  missingPositions,
  openMotif,
  proposeClosure,
  recognizeClosure
} from "./resonance.js";

let current = openMotif({
  source: "artifact:source-particular-001",
  ruptureIntent: "experimental_cut",
  attractors: ["artifact:attractor-return-to-particular-001"]
}).motif;

current = attachPosition(current, "transformation", ["artifact:rupture-001"]).motif;
current = attachPosition(current, "tension", ["artifact:attractor-return-to-particular-001"]).motif;
current = attachPosition(current, "response", ["artifact:response-practical-comic-return-001"]).motif;
current = attachPosition(current, "anchor_state", ["artifact:anchor-transition-001"]).motif;
current = proposeClosure(current, [{
  anchor: "artifact:anchor-mundane-object-001",
  outcome: "transfigured",
  successorAnchor: "artifact:anchor-mundane-object-practical-return-001",
  evidence: ["artifact:anchor-transition-001"]
}]).motif;
current = recognizeClosure(current, {
  disposition: "novel_but_continuous",
  receipt: "artifact:recognition-receipt-001",
  statedReasons: ["artifact:reason-verb-fidelity-001"]
}, {
  artifact: "artifact:source-particular-002",
  derivedFromSource: "artifact:source-particular-001",
  informedByRecognition: "artifact:recognition-receipt-001"
}).motif;

console.log(JSON.stringify({ motif: current, missingPositions: missingPositions(current) }, null, 2));
