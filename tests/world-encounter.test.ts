import assert from "node:assert/strict";
import test from "node:test";

import {
  WORLD_ENCOUNTER_DOMAIN_PREFIX,
  addressEncounterRecord,
  evaluateEncounter,
  validateDestinationEncounterContext,
  validateExchangeEnvelope,
} from "../src/world-encounter/index";

const envelope = {
  protocolVersion: "p0.exchange/0.1" as const,
  originNodeRef: "project0",
  originFrameRef: "frame-project0-main",
  originVersionRef: "1c4decea33e0d22babb4a48be29cf5034c9318f9",
  offered: {
    objectRef: "nav-evidence-project0-corpus",
    mediaType: "application/json",
    sourceReceiptRefs: ["nav-receipt-001"],
    disclosureClass: "public",
  },
  sourceProvenanceRefs: ["project0-pr-38"],
  sourceAuthorityRefs: ["project0-local-authority"],
  sourceEpistemicKind: "witness" as const,
  sourceVerificationState: "verified" as const,
  capabilityUsed: "offer_public_witness",
  limitations: ["fixture-only", "not-destination-authority"],
};

const context = {
  destinationNodeRef: "corpus-os",
  destinationFrameRef: "frame-corpus-main",
  manifest: {
    nodeRef: "corpus-os",
    protocolVersion: "p0.exchange/0.1" as const,
    accepts: ["witness"],
    emits: ["witness"],
    capabilities: ["receive_public_witness"],
    requiredScopes: ["public"],
    mustNever: ["accept_source_authority_as_local"],
  },
  grantedScopes: ["public"],
  destinationAuthorityRefs: ["corpus-local-authority"],
};

const admittedOptions = {
  offeredClass: "witness",
  requiredCapability: "receive_public_witness",
  requiredScope: "public",
  localDetermination: "admit" as const,
  evidenceRefs: ["corpus-policy-evidence"],
};

test("accepts explicit v0.1 envelope and destination context", () => {
  assert.doesNotThrow(() => validateExchangeEnvelope(envelope));
  assert.doesNotThrow(() => validateDestinationEncounterContext(context));
});

test("addresses encounter records under the fixed experimental domain", () => {
  const addressed = addressEncounterRecord("exchange_envelope", envelope);
  assert.equal(WORLD_ENCOUNTER_DOMAIN_PREFIX, "Project0-WorldEncounter-v0.1|");
  assert.match(addressed.ref, /^enc-[0-9a-f]{64}$/);
  assert.equal(addressed.ref.startsWith("rect-"), false);
  assert.equal(addressed.ref.startsWith("nav-"), false);
});

test("normalizes set-like envelope fields before addressing", () => {
  const left = addressEncounterRecord("exchange_envelope", {
    ...structuredClone(envelope),
    sourceAuthorityRefs: ["b", "a", "a"],
    sourceProvenanceRefs: ["z", "y"],
    limitations: ["two", "one"],
  });
  const right = addressEncounterRecord("exchange_envelope", {
    ...structuredClone(envelope),
    sourceAuthorityRefs: ["a", "b"],
    sourceProvenanceRefs: ["y", "z", "z"],
    limitations: ["one", "two", "two"],
  });
  assert.equal(left.ref, right.ref);
  assert.deepEqual(left.canonicalBytes, right.canonicalBytes);
});

test("admits testimony only under destination-local authority", () => {
  const sourceBefore = structuredClone(envelope);
  const contextBefore = structuredClone(context);
  const result = evaluateEncounter(envelope, context, admittedOptions);

  assert.equal(result.body.status, "admitted");
  assert.equal(result.body.reasonCode, "ENCOUNTER_ADMITTED");
  assert.equal(result.body.inspectedObject, true);
  assert.deepEqual(result.body.destinationAuthorityRefs, ["corpus-local-authority"]);
  assert.equal(result.body.destinationAuthorityRefs.includes("project0-local-authority"), false);
  assert.deepEqual(envelope, sourceBefore);
  assert.deepEqual(context, contextBefore);
});

test("refuses missing disclosure scope before object inspection", () => {
  const result = evaluateEncounter(envelope, { ...structuredClone(context), grantedScopes: [] }, admittedOptions);

  assert.equal(result.body.status, "refused");
  assert.equal(result.body.reasonCode, "ENCOUNTER_SCOPE_REQUIRED");
  assert.equal(result.body.inspectedObject, false);
});

test("manifest capability declaration is not itself a grant", () => {
  const result = evaluateEncounter(envelope, context, {
    ...admittedOptions,
    localDetermination: "indeterminate",
    evidenceRefs: ["authority-not-established"],
  });

  assert.equal(result.body.status, "indeterminate");
  assert.equal(result.body.reasonCode, "ENCOUNTER_INDETERMINATE");
  assert.deepEqual(result.body.destinationAuthorityRefs, ["corpus-local-authority"]);
});

test("refused and indeterminate remain distinct", () => {
  const refused = evaluateEncounter(envelope, context, {
    ...admittedOptions,
    offeredClass: "claim",
    evidenceRefs: [],
  });
  const indeterminate = evaluateEncounter(envelope, context, {
    ...admittedOptions,
    localDetermination: "indeterminate",
    evidenceRefs: [],
  });

  assert.equal(refused.body.status, "refused");
  assert.equal(refused.body.reasonCode, "ENCOUNTER_TYPE_NOT_ACCEPTED");
  assert.equal(indeterminate.body.status, "indeterminate");
  assert.equal(indeterminate.body.reasonCode, "ENCOUNTER_INDETERMINATE");
});

test("fails closed on unsupported protocol and unknown top-level fields", () => {
  assert.throws(
    () => validateExchangeEnvelope({ ...structuredClone(envelope), protocolVersion: "p0.exchange/9.9" }),
    /ENCOUNTER_PROTOCOL_UNSUPPORTED/,
  );
  assert.throws(
    () => validateExchangeEnvelope({ ...structuredClone(envelope), surprise: true }),
    /ENCOUNTER_UNKNOWN_FIELD/,
  );
});

test("destination authority cannot overlap source authority by transport", () => {
  const contaminatedContext = {
    ...structuredClone(context),
    destinationAuthorityRefs: ["corpus-local-authority", "project0-local-authority"],
  };

  assert.throws(
    () => evaluateEncounter(envelope, contaminatedContext, admittedOptions),
    /ENCOUNTER_SOURCE_AUTHORITY_TRANSFER/,
  );
});

test("validation does not execute hostile accessors", () => {
  let touched = false;
  const hostile = Object.create(null);
  Object.defineProperty(hostile, "protocolVersion", {
    enumerable: true,
    get() {
      touched = true;
      return "p0.exchange/0.1";
    },
  });

  assert.throws(() => validateExchangeEnvelope(hostile), /ENCOUNTER_INVALID_REPRESENTATION/);
  assert.equal(touched, false);
});
