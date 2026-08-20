import assert from "node:assert/strict";
import test from "node:test";

import {
  addressContinuityClaim,
  validateContinuityClaim,
} from "../src/continuity-profile";
import {
  corpusContinuityAttestation,
  tranchNodeBoundaryWitness,
} from "../fixtures/continuity-profile/triangle-donors";
import {
  mapCorpusContinuityAttestation,
  mapTranchNodeBoundaryWitness,
} from "../fixtures/continuity-profile/triangle-conformance";

function dimensions(result: ReturnType<typeof mapCorpusContinuityAttestation>) {
  const lane = result.claim.lanes.find((item) => item.lane === "representation-story");
  assert.ok(lane);
  return new Map(lane.dimensions.map((dimension) => [dimension.dimension, dimension]));
}

test("TranchNode donor preserves four boundary classes without portable authority", () => {
  const result = mapTranchNodeBoundaryWitness(tranchNodeBoundaryWitness);
  const lane = result.claim.lanes[0];

  assert.equal(result.donor, "tranchnode");
  assert.equal(result.grammarGap, "NO_GAP");
  assert.equal(result.claim.lanes.some((item) => item.lane === "authority"), false);
  assert.deepEqual(lane.doesNotEstablish, ["authority"]);
  assert.deepEqual(
    lane.dimensions.map((dimension) => dimension.dimension),
    [
      "tranchnode.preserved",
      "tranchnode.differentiated",
      "tranchnode.lost",
      "tranchnode.unresolved",
      "tranchnode.transition-witness",
    ],
  );
  assert.deepEqual(lane.dimensions[0].evidenceRefs, [...tranchNodeBoundaryWitness.preserved]);
  assert.deepEqual(lane.dimensions[1].evidenceRefs, [...tranchNodeBoundaryWitness.differentiated]);
  assert.deepEqual(lane.dimensions[2].evidenceRefs, [...tranchNodeBoundaryWitness.lost]);
  assert.deepEqual(lane.dimensions[3].evidenceRefs, [...tranchNodeBoundaryWitness.unresolved]);
  assert.equal(result.claim.occurrenceClaim, "continuation-only");
});

test("Corpus donor keeps constituted classes, terminal history, and orphan residue distinct", () => {
  const result = mapCorpusContinuityAttestation(corpusContinuityAttestation);
  const mapped = dimensions(result);

  assert.equal(result.donor, "corpus-os");
  assert.equal(result.grammarGap, "NO_GAP");
  assert.deepEqual(mapped.get("corpus.preserved")?.evidenceRefs, [
    "artifact:agreement-a",
    "artifact:correspondence-a",
  ]);
  assert.deepEqual(mapped.get("corpus.transformed:artifact:legacy-note")?.evidenceRefs, [
    "artifact:legacy-note",
    "artifact:amendment-b",
    "transition:legacy-to-amendment",
  ]);
  assert.deepEqual(mapped.get("corpus.lost:artifact:superseded-appendix")?.evidenceRefs, [
    "artifact:superseded-appendix",
    "transition:appendix-retired",
  ]);
  assert.deepEqual(mapped.get("corpus.unresolved")?.evidenceRefs, [
    "artifact:unexplained-current",
  ]);
  assert.deepEqual(mapped.get("corpus.terminal.prior.session-refused")?.evidenceRefs, [
    "request:prior-refused",
  ]);
  assert.deepEqual(mapped.get("corpus.terminal.current.completed")?.evidenceRefs, [
    "request:current-amendment",
  ]);
  assert.deepEqual(mapped.get("corpus.terminal.current.host-failed")?.evidenceRefs, [
    "request:current-host-failed",
  ]);
  assert.deepEqual(mapped.get("corpus.orphan.prior")?.evidenceRefs, ["artifact:orphan-shared"]);
  assert.deepEqual(mapped.get("corpus.orphan.current")?.evidenceRefs, ["artifact:orphan-shared"]);
  assert.equal(mapped.get("corpus.preserved")?.evidenceRefs.includes("artifact:orphan-shared"), false);
});

test("Corpus authority evidence remains inert context and never creates an authority lane", () => {
  const result = mapCorpusContinuityAttestation(corpusContinuityAttestation);
  const mapped = dimensions(result);

  assert.equal(result.claim.lanes.some((item) => item.lane === "authority"), false);
  assert.deepEqual(result.claim.lanes[0].doesNotEstablish, ["authority"]);
  assert.equal(
    result.claim.environment.contextRefs.includes("authority-evidence:adoption-v02"),
    true,
  );
  assert.deepEqual(mapped.get("corpus.authority-cut-change")?.evidenceRefs, [
    "authority-evidence:adoption-v02",
  ]);
  assert.deepEqual(mapped.get("corpus.legal-validity-unclaimed")?.evidenceRefs, [
    "world-cut:current-v02",
  ]);
});

test("omitted donor loss never becomes preservation", () => {
  const omittedLoss = structuredClone(corpusContinuityAttestation) as Record<string, unknown>;
  omittedLoss.lost = [];
  omittedLoss.transitionEvidenceRefs = ["transition:legacy-to-amendment"];
  omittedLoss.whyCurrent = {
    ...(omittedLoss.whyCurrent as Record<string, unknown>),
    transitionEvidenceRefs: ["transition:legacy-to-amendment"],
  };

  const result = mapCorpusContinuityAttestation(omittedLoss);
  const mapped = dimensions(result);
  const preserved = mapped.get("corpus.preserved")?.evidenceRefs ?? [];

  assert.equal(preserved.includes("artifact:superseded-appendix"), false);
  assert.equal(
    [...mapped.keys()].some((name) => name === "corpus.lost:artifact:superseded-appendix"),
    false,
  );
});

test("copied warrant-shaped donor field is refused rather than laundered into continuity", () => {
  const laundered = {
    ...structuredClone(corpusContinuityAttestation),
    warrant: {
      authorityCut: "v0.1",
      capability: "admin",
      spent: false,
    },
  };

  assert.throws(() => mapCorpusContinuityAttestation(laundered));
});

test("semantic lookalike ref remains unresolved without exact donor preservation evidence", () => {
  const lookalike = structuredClone(corpusContinuityAttestation) as Record<string, unknown>;
  lookalike.preservedRefs = ["artifact:correspondence-a"];
  lookalike.unresolvedRefs = [
    "artifact:agreement-a-v2",
    "artifact:unexplained-current",
  ];

  const result = mapCorpusContinuityAttestation(lookalike);
  const mapped = dimensions(result);

  assert.deepEqual(mapped.get("corpus.preserved")?.evidenceRefs, ["artifact:correspondence-a"]);
  assert.deepEqual(mapped.get("corpus.unresolved")?.evidenceRefs, [
    "artifact:agreement-a-v2",
    "artifact:unexplained-current",
  ]);
});

test("mapped donor claims are ordinary valid Project0 continuity claims", () => {
  const tranch = mapTranchNodeBoundaryWitness(tranchNodeBoundaryWitness);
  const corpus = mapCorpusContinuityAttestation(corpusContinuityAttestation);

  assert.doesNotThrow(() => validateContinuityClaim(tranch.claim));
  assert.doesNotThrow(() => validateContinuityClaim(corpus.claim));
});

test("same donor witness produces the same Project0 continuity address", () => {
  const first = mapCorpusContinuityAttestation(corpusContinuityAttestation);
  const second = mapCorpusContinuityAttestation(structuredClone(corpusContinuityAttestation));

  assert.deepEqual(second, first);
  assert.equal(addressContinuityClaim(second.claim), addressContinuityClaim(first.claim));
});

test("accessor-backed donor representation fails closed without executing the accessor", () => {
  let executed = false;
  const hostile = structuredClone(corpusContinuityAttestation) as Record<string, unknown>;
  Object.defineProperty(hostile, "preservedRefs", {
    enumerable: true,
    configurable: true,
    get() {
      executed = true;
      return ["artifact:agreement-a"];
    },
  });

  assert.throws(() => mapCorpusContinuityAttestation(hostile));
  assert.equal(executed, false);
});
