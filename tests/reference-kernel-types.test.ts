import assert from "node:assert/strict";
import test from "node:test";

type Kernel = Record<string, (...args: any[]) => any>;

function loadKernel(): Kernel {
  try {
    return require("../src/reference-kernel/index.js") as Kernel;
  } catch {
    assert.fail("reference kernel module is missing");
  }
}

const nodeKinds = [
  "source",
  "observation",
  "claim",
  "proposal",
  "tension",
  "rejection",
  "witness",
  "harvest",
  "inference",
] as const;

const node = (overrides: Record<string, unknown> = {}) => ({
  kind: "claim",
  body: { text: "same payload" },
  createdAt: "2026-08-16T10:00:00Z",
  createdBy: "human:lu",
  provenance: ["node-parent"],
  disclosure: "public",
  relationships: [],
  ...overrides,
});

const relationship = (overrides: Record<string, unknown> = {}) => ({
  type: "supports",
  from: "node-a",
  to: "node-b",
  assertedBy: "human:lu",
  createdAt: "2026-08-16T10:01:00Z",
  scopeId: "scope:public",
  basis: null,
  disclosure: "public",
  ...overrides,
});

const receipt = (overrides: Record<string, unknown> = {}) => ({
  receiptType: "WitnessReceipt",
  issuedAt: "2026-08-16T10:02:00Z",
  issuer: "human:lu",
  subject: "node-a",
  inputs: {},
  outputs: {},
  authorityRef: null,
  policyRefs: ["policy:public"],
  previousReceiptRefs: [],
  ...overrides,
});

test("P0-I4/P0-I18: all nine frozen node kinds validate and address deterministically", () => {
  const kernel = loadKernel();
  for (const kind of nodeKinds) {
    const value = node({ kind });
    assert.deepEqual(kernel.validateNode(value), { status: "valid", reasonCodes: [] });
    const first = kernel.addressNode(value);
    const second = kernel.addressNode(structuredClone(value));
    assert.equal(first.address, second.address);
    assert.equal(first.digestHex, second.digestHex);
    assert.deepEqual(first.canonicalBytes, second.canonicalBytes);
  }
});

test("P0-I4: materially different provenance or disclosure changes node identity", () => {
  const kernel = loadKernel();
  const base = kernel.addressNode(node()).address;
  assert.notEqual(kernel.addressNode(node({ provenance: ["node-other"] })).address, base);
  assert.notEqual(kernel.addressNode(node({ disclosure: "private" })).address, base);
});

test("P0-I2/P0-I20: node validation reports invalid kind and missing provenance explicitly", () => {
  const kernel = loadKernel();
  assert.deepEqual(kernel.validateNode(node({ kind: "banana" })), {
    status: "invalid",
    reasonCodes: ["INVALID_NODE_KIND"],
  });
  const missing = node();
  delete (missing as any).provenance;
  assert.deepEqual(kernel.validateNode(missing), {
    status: "invalid",
    reasonCodes: ["PROVENANCE_REQUIRED"],
  });
});

test("P0-I2: unresolved provenance is distinct from structurally missing provenance", () => {
  const kernel = loadKernel();
  assert.deepEqual(kernel.validateProvenanceRefs(node(), new Set(["node-parent"])), {
    status: "valid",
    reasonCodes: [],
  });
  assert.deepEqual(kernel.validateProvenanceRefs(node(), new Set()), {
    status: "invalid",
    reasonCodes: ["PROVENANCE_UNRESOLVED"],
  });
});

test("P0-I18: relationship and receipt addresses reuse the settled semantic domains", () => {
  const kernel = loadKernel();
  assert.deepEqual(kernel.validateRelationship(relationship()), { status: "valid", reasonCodes: [] });
  assert.match(kernel.addressRelationship(relationship()).address, /^edge-/);
  assert.deepEqual(kernel.validateReceipt(receipt()), { status: "valid", reasonCodes: [] });
  assert.match(kernel.addressReceipt(receipt()).address, /^rect-/);
});

test("P0-I20: unsupported relationship type and receipt family fail with stable codes", () => {
  const kernel = loadKernel();
  assert.deepEqual(kernel.validateRelationship(relationship({ type: "imagines" })), {
    status: "invalid",
    reasonCodes: ["INVALID_RELATIONSHIP_TYPE"],
  });
  assert.deepEqual(kernel.validateReceipt(receipt({ receiptType: "MagicReceipt" })), {
    status: "invalid",
    reasonCodes: ["INVALID_RECEIPT_TYPE"],
  });
});
