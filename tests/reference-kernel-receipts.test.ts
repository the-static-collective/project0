import assert from "node:assert/strict";
import test from "node:test";

const kernel = require("../src/reference-kernel/index.js") as Record<string, any>;

const receipt = (overrides: Record<string, unknown> = {}) => ({
  receiptType: "WitnessReceipt",
  issuedAt: "2026-08-16T11:00:00Z",
  issuer: "human:lu",
  subject: "node-root",
  inputs: {},
  outputs: { observed: true },
  authorityRef: null,
  policyRefs: ["policy:public"],
  previousReceiptRefs: [],
  ...overrides,
});

function graph(): any {
  assert.equal(typeof kernel.ReceiptGraph, "function", "ReceiptGraph must be exported");
  return new kernel.ReceiptGraph();
}

test("P0-I14: append/get round trip preserves canonical receipt identity", () => {
  const g = graph();
  const root = receipt();
  const rootRef = kernel.addressReceipt(root).address;
  assert.deepEqual(g.append(root), { status: "appended", receiptRef: rootRef });
  assert.equal(g.has(rootRef), true);
  assert.deepEqual(g.get(rootRef), root);
});

test("P0-I14/P0-I18: byte-identical duplicate append is idempotent", () => {
  const g = graph();
  const root = receipt();
  const rootRef = kernel.addressReceipt(root).address;
  assert.deepEqual(g.append(root), { status: "appended", receiptRef: rootRef });
  assert.deepEqual(g.append(structuredClone(root)), { status: "idempotent", receiptRef: rootRef });
  assert.equal(g.all().length, 1);
});

test("P0-I14: every declared parent must exist before append", () => {
  const g = graph();
  const child = receipt({ previousReceiptRefs: ["rect-missing"], subject: "node-child" });
  assert.deepEqual(g.append(child), {
    status: "refused",
    reasonCodes: ["RECEIPT_PARENT_MISSING"],
  });
  assert.equal(g.all().length, 0);
});

test("P0-I1/P0-I14: reads cannot mutate stored canonical receipt state", () => {
  const g = graph();
  const root = receipt();
  const rootRef = kernel.addressReceipt(root).address;
  g.append(root);
  const first = g.get(rootRef);
  assert.ok(first);
  (first.outputs as Record<string, unknown>).observed = false;
  first.policyRefs.push("policy:private");
  const second = g.get(rootRef);
  assert.deepEqual(second, root);
});

test("P0-I14/P0-I18: branching ancestry is preserved with deterministic ordering", () => {
  const g = graph();
  const root = receipt();
  const rootRef = kernel.addressReceipt(root).address;
  g.append(root);
  const a = receipt({
    issuedAt: "2026-08-16T11:01:00Z",
    subject: "branch-a",
    previousReceiptRefs: [rootRef],
  });
  const b = receipt({
    issuedAt: "2026-08-16T11:02:00Z",
    subject: "branch-b",
    previousReceiptRefs: [rootRef],
  });
  g.append(b);
  g.append(a);
  const expectedChildren = [kernel.addressReceipt(a).address, kernel.addressReceipt(b).address].sort();
  assert.deepEqual(g.childrenOf(rootRef).map((item: any) => item.receiptRef), expectedChildren);
  const first = g.all().map((item: any) => item.receiptRef);
  const second = g.all().map((item: any) => item.receiptRef);
  assert.deepEqual(first, [...first].sort());
  assert.deepEqual(second, first);
});

test("P0-I7/P0-I14: lease consumption count is derived from receipt history", () => {
  const g = graph();
  const grant = receipt({
    receiptType: "LeaseGrant",
    subject: "scope:public",
    outputs: {
      recipient: "human:lu",
      capability: "publish",
      scopeId: "scope:public",
      purpose: "test",
      invocationLimit: 2,
    },
  });
  const grantRef = kernel.addressReceipt(grant).address;
  g.append(grant);
  const consumptionA = receipt({
    receiptType: "LeaseConsumption",
    issuedAt: "2026-08-16T11:03:00Z",
    subject: "act-a",
    authorityRef: grantRef,
    previousReceiptRefs: [grantRef],
    outputs: { grantRef },
  });
  const consumptionARef = kernel.addressReceipt(consumptionA).address;
  g.append(consumptionA);
  const consumptionB = receipt({
    receiptType: "LeaseConsumption",
    issuedAt: "2026-08-16T11:04:00Z",
    subject: "act-b",
    authorityRef: grantRef,
    previousReceiptRefs: [consumptionARef],
    outputs: { grantRef },
  });
  g.append(consumptionB);
  assert.equal(g.countConsumptions(grantRef), 2);
});
