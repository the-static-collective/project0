import assert from "node:assert/strict";
import test from "node:test";

import {
  addressEncounterRecord,
  evaluateEncounter,
  validateDestinationEncounterContext,
  validateExchangeEnvelope,
  verifyEncounterRecord,
} from "../src/world-encounter/index";

const envelope = {
  protocolVersion: "p0.exchange/0.1" as const,
  originNodeRef: "project0",
  originFrameRef: "frame-project0",
  originVersionRef: "commit-project0",
  offered: {
    objectRef: "source-object-1",
    mediaType: null,
    sourceReceiptRefs: [],
    disclosureClass: "public",
  },
  sourceProvenanceRefs: ["source-provenance-1"],
  sourceAuthorityRefs: ["source-authority-1"],
  sourceEpistemicKind: "witness" as const,
  sourceVerificationState: "verified" as const,
  capabilityUsed: "offer_public_witness",
  limitations: [],
};

const context = {
  destinationNodeRef: "destination",
  destinationFrameRef: "frame-destination",
  manifest: {
    nodeRef: "destination",
    protocolVersion: "p0.exchange/0.1" as const,
    accepts: ["witness"],
    emits: [],
    capabilities: ["receive_public_witness"],
    requiredScopes: ["public"],
    mustNever: [],
  },
  grantedScopes: ["public"],
  destinationAuthorityRefs: ["destination-authority-1"],
};

const options = {
  requiredCapability: "receive_public_witness",
  requiredScope: "public",
  localDetermination: "admit" as const,
  evidenceRefs: [],
};

test("verifies exact encounter identity and rejects a tampered body", () => {
  const addressed = addressEncounterRecord("exchange_envelope", envelope);
  assert.doesNotThrow(() => verifyEncounterRecord("exchange_envelope", addressed.ref, envelope));

  assert.throws(
    () => verifyEncounterRecord(
      "exchange_envelope",
      addressed.ref,
      { ...structuredClone(envelope), originFrameRef: "tampered-frame" },
    ),
    /ENCOUNTER_ADDRESS_MISMATCH/,
  );
});

test("refuses undeclared destination capability even when local determination says admit", () => {
  const result = evaluateEncounter(envelope, {
    ...structuredClone(context),
    manifest: { ...structuredClone(context.manifest), capabilities: [] },
  }, options);

  assert.equal(result.body.status, "refused");
  assert.equal(result.body.reasonCode, "ENCOUNTER_CAPABILITY_UNDECLARED");
  assert.equal(result.body.inspectedObject, false);
});

test("envelope disclosure cannot be weakened by a caller-selected required scope", () => {
  const privateEnvelope = {
    ...structuredClone(envelope),
    offered: { ...structuredClone(envelope.offered), disclosureClass: "private" },
  };
  const result = evaluateEncounter(privateEnvelope, context, options);

  assert.equal(result.body.status, "refused");
  assert.equal(result.body.reasonCode, "ENCOUNTER_SCOPE_REQUIRED");
  assert.equal(result.body.inspectedObject, false);
});

test("rejects sparse arrays before canonicalization or evaluation", () => {
  const sparse: any = structuredClone(envelope);
  sparse.limitations = new Array(1);
  assert.throws(() => validateExchangeEnvelope(sparse), /ENCOUNTER_INVALID_REPRESENTATION/);
});

test("nested hostile accessors are rejected without executing them", () => {
  let touched = false;
  const hostileOffered = Object.create(null);
  Object.defineProperty(hostileOffered, "objectRef", {
    enumerable: true,
    get() {
      touched = true;
      return "secret";
    },
  });
  Object.assign(hostileOffered, {
    mediaType: null,
    sourceReceiptRefs: [],
    disclosureClass: "public",
  });

  assert.throws(
    () => validateExchangeEnvelope({ ...structuredClone(envelope), offered: hostileOffered }),
    /ENCOUNTER_INVALID_REPRESENTATION/,
  );
  assert.equal(touched, false);
});

test("destination manifest protocol mismatch fails closed", () => {
  assert.throws(
    () => validateDestinationEncounterContext({
      ...structuredClone(context),
      manifest: { ...structuredClone(context.manifest), protocolVersion: "p0.exchange/9.9" },
    }),
    /ENCOUNTER_PROTOCOL_UNSUPPORTED/,
  );
});

test("receiving creates only experimental encounter identity, never canonical receipt identity", () => {
  const result = evaluateEncounter(envelope, context, options);
  assert.match(result.ref, /^enc-[0-9a-f]{64}$/);
  assert.equal(result.ref.startsWith("rect-"), false);
});
