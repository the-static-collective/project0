import assert from "node:assert/strict";
import test from "node:test";

const kernel = require("../src/reference-kernel/index.js") as Record<string, any>;

const policy = (overrides: Record<string, unknown> = {}) => ({
  policyRef: "policy:public",
  permittedScopes: ["scope:public"],
  permittedPurposes: ["publish-test"],
  permittedRecipients: ["human:lu"],
  permittedDisclosures: ["public"],
  ...overrides,
});

const request = (overrides: Record<string, unknown> = {}) => ({
  actor: "human:lu",
  capability: "publish",
  scopeId: "scope:public",
  purpose: "publish-test",
  disclosure: "public",
  evaluatedAt: "2026-08-16T12:00:00Z",
  ...overrides,
});

const grant = (overrides: Record<string, unknown> = {}) => ({
  receiptType: "LeaseGrant",
  issuedAt: "2026-08-16T11:00:00Z",
  issuer: "authority:root",
  subject: "scope:public",
  inputs: {},
  outputs: {
    recipient: "human:lu",
    capability: "publish",
    scopeId: "scope:public",
    purpose: "publish-test",
    invocationLimit: 2,
    validFrom: "2026-08-16T11:00:00Z",
    validUntil: "2026-08-17T11:00:00Z",
  },
  authorityRef: null,
  policyRefs: ["policy:public"],
  previousReceiptRefs: [],
  ...overrides,
});

function seededGrant(overrides: Record<string, unknown> = {}): { graph: any; grantRef: string } {
  const graph = new kernel.ReceiptGraph();
  const value = grant(overrides);
  const grantRef = kernel.addressReceipt(value).address;
  assert.equal(graph.append(value).status, "appended");
  return { graph, grantRef };
}

function evaluation(graph: any, grantRef: string, req = request(), pol = policy()): any {
  assert.equal(typeof kernel.evaluateAuthority, "function", "evaluateAuthority must be exported");
  return kernel.evaluateAuthority(graph, grantRef, pol, req);
}

test("P0-I7/P0-I18: complete bounded authority permits at explicit evaluation time", () => {
  const { graph, grantRef } = seededGrant();
  assert.deepEqual(evaluation(graph, grantRef), {
    status: "permitted",
    reasonCodes: [],
    grantRef,
    remainingInvocations: 2,
  });
});

test("P0-I6/P0-I7: retrieval or a missing grant never manufactures authority", () => {
  const graph = new kernel.ReceiptGraph();
  assert.deepEqual(evaluation(graph, "rect-missing"), {
    status: "refused",
    reasonCodes: ["AUTHORITY_MISSING"],
    grantRef: "rect-missing",
  });
});

test("P0-I7: recipient, capability, scope, and purpose are independently bounded", () => {
  const { graph, grantRef } = seededGrant();
  const cases = [
    [request({ actor: "human:other" }), "AUTHORITY_RECIPIENT_MISMATCH"],
    [request({ capability: "delete" }), "AUTHORITY_CAPABILITY_MISMATCH"],
    [request({ scopeId: "scope:private" }), "AUTHORITY_SCOPE_MISMATCH"],
    [request({ purpose: "other-purpose" }), "AUTHORITY_PURPOSE_MISMATCH"],
  ] as const;
  for (const [req, reason] of cases) {
    const result = evaluation(graph, grantRef, req);
    assert.equal(result.status, "refused");
    assert.deepEqual(result.reasonCodes, [reason]);
  }
});

test("P0-I7/P0-I18: expiry is evaluated only from explicit evaluatedAt", () => {
  const { graph, grantRef } = seededGrant();
  const before = evaluation(graph, grantRef, request({ evaluatedAt: "2026-08-16T10:59:59Z" }));
  assert.equal(before.status, "refused");
  assert.deepEqual(before.reasonCodes, ["AUTHORITY_NOT_YET_VALID"]);
  const expired = evaluation(graph, grantRef, request({ evaluatedAt: "2026-08-17T11:00:00Z" }));
  assert.equal(expired.status, "refused");
  assert.deepEqual(expired.reasonCodes, ["AUTHORITY_EXPIRED"]);
});

test("P0-I8/P0-I9: policy reference and disclosure bounds must both permit the act", () => {
  const { graph, grantRef } = seededGrant();
  const wrongDisclosure = evaluation(graph, grantRef, request({ disclosure: "private" }));
  assert.equal(wrongDisclosure.status, "refused");
  assert.deepEqual(wrongDisclosure.reasonCodes, ["DISCLOSURE_NOT_PERMITTED"]);
  const wrongPolicy = evaluation(graph, grantRef, request(), policy({ policyRef: "policy:other" }));
  assert.equal(wrongPolicy.status, "refused");
  assert.deepEqual(wrongPolicy.reasonCodes, ["DISCLOSURE_NOT_PERMITTED"]);
});

test("P0-I7/P0-I14: non-root authority lineage must resolve", () => {
  const { graph, grantRef } = seededGrant({ authorityRef: "rect-missing" });
  const result = evaluation(graph, grantRef);
  assert.equal(result.status, "refused");
  assert.deepEqual(result.reasonCodes, ["AUTHORITY_LINEAGE_INVALID"]);
});

test("P0-I7/P0-I14: non-root authority lineage must resolve to an authority-bearing grant", () => {
  const graph = new kernel.ReceiptGraph();
  const witness = {
    receiptType: "WitnessReceipt",
    issuedAt: "2026-08-16T10:30:00Z",
    issuer: "human:witness",
    subject: "event:one",
    inputs: {},
    outputs: { observed: true },
    authorityRef: null,
    policyRefs: ["policy:public"],
    previousReceiptRefs: [],
  };
  const witnessRef = kernel.addressReceipt(witness).address;
  assert.equal(graph.append(witness).status, "appended");
  const delegated = grant({ authorityRef: witnessRef });
  const delegatedRef = kernel.addressReceipt(delegated).address;
  assert.equal(graph.append(delegated).status, "appended");
  const result = evaluation(graph, delegatedRef);
  assert.equal(result.status, "refused");
  assert.deepEqual(result.reasonCodes, ["AUTHORITY_LINEAGE_INVALID"]);
});

test("P0-I7/P0-I14: successful use appends consumption without mutating the grant", () => {
  const { graph, grantRef } = seededGrant();
  const original = graph.get(grantRef);
  assert.equal(typeof kernel.recordLeaseConsumption, "function", "recordLeaseConsumption must be exported");
  const result = kernel.recordLeaseConsumption(graph, grantRef, policy(), request(), "act:one", "human:lu");
  assert.equal(result.status, "consumed");
  assert.match(result.receiptRef, /^rect-/);
  assert.equal(graph.countConsumptions(grantRef), 1);
  assert.deepEqual(graph.get(grantRef), original);
  assert.equal(evaluation(graph, grantRef).remainingInvocations, 1);
});

test("P0-I7/P0-I14: replaying the identical consumption is idempotent even after authority is exhausted", () => {
  const { graph, grantRef } = seededGrant({
    outputs: {
      recipient: "human:lu",
      capability: "publish",
      scopeId: "scope:public",
      purpose: "publish-test",
      invocationLimit: 1,
      validFrom: "2026-08-16T11:00:00Z",
      validUntil: "2026-08-17T11:00:00Z",
    },
  });
  const first = kernel.recordLeaseConsumption(graph, grantRef, policy(), request(), "act:one", "human:lu");
  assert.equal(first.status, "consumed");
  assert.equal(evaluation(graph, grantRef).status, "refused");
  assert.deepEqual(evaluation(graph, grantRef).reasonCodes, ["AUTHORITY_EXHAUSTED"]);
  const replay = kernel.recordLeaseConsumption(graph, grantRef, policy(), request(), "act:one", "human:lu");
  assert.equal(replay.status, "idempotent");
  assert.equal(replay.receiptRef, first.receiptRef);
  assert.equal(graph.countConsumptions(grantRef), 1);
});

test("P0-I7/P0-I14: two-use grant exhausts from history and refuses a third use", () => {
  const { graph, grantRef } = seededGrant();
  assert.equal(kernel.recordLeaseConsumption(graph, grantRef, policy(), request(), "act:one", "human:lu").status, "consumed");
  assert.equal(kernel.recordLeaseConsumption(
    graph,
    grantRef,
    policy(),
    request({ evaluatedAt: "2026-08-16T12:01:00Z" }),
    "act:two",
    "human:lu",
  ).status, "consumed");
  const exhausted = evaluation(graph, grantRef, request({ evaluatedAt: "2026-08-16T12:02:00Z" }));
  assert.equal(exhausted.status, "refused");
  assert.deepEqual(exhausted.reasonCodes, ["AUTHORITY_EXHAUSTED"]);
  assert.equal(exhausted.remainingInvocations, 0);
  const third = kernel.recordLeaseConsumption(
    graph,
    grantRef,
    policy(),
    request({ evaluatedAt: "2026-08-16T12:02:00Z" }),
    "act:three",
    "human:lu",
  );
  assert.equal(third.status, "refused");
  assert.deepEqual(third.reasonCodes, ["AUTHORITY_EXHAUSTED"]);
  assert.equal(graph.countConsumptions(grantRef), 2);
});

test("P0-I7/P0-I14: refused attempt never consumes authority", () => {
  const { graph, grantRef } = seededGrant();
  const result = kernel.recordLeaseConsumption(
    graph,
    grantRef,
    policy(),
    request({ scopeId: "scope:private" }),
    "act:refused",
    "human:lu",
  );
  assert.equal(result.status, "refused");
  assert.deepEqual(result.reasonCodes, ["AUTHORITY_SCOPE_MISMATCH"]);
  assert.equal(graph.countConsumptions(grantRef), 0);
  assert.equal(evaluation(graph, grantRef).remainingInvocations, 2);
});
