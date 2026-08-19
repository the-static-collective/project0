import assert from "node:assert/strict";
import test from "node:test";

import {
  L_BRANCH_DOMAIN_PREFIX,
  addressLBranchRecord,
  validateLBranchDeclaration,
} from "../src/l-branch/index";

const declaration = {
  protocolVersion: "p0.l-branch/0.1" as const,
  snapshotRef: "snapshot-001",
  excitationRef: "excitation-E",
  purposeRef: "purpose-compose",
  participantRefs: ["A", "B", "C"],
  influenceRefs: [],
  authorityRefs: ["lease-A"],
  evaluatorId: "fixture-evaluator",
  evaluatorVersion: "0.1.0",
  policyRef: "policy-public",
  budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 },
};

test("accepts one bounded v0.1 declaration", () => {
  assert.doesNotThrow(() => validateLBranchDeclaration(declaration));
});

test("addresses declarations under a distinct experimental domain", () => {
  const addressed = addressLBranchRecord("declaration", declaration);
  assert.equal(L_BRANCH_DOMAIN_PREFIX, "Project0-LBranch-v0.1|");
  assert.match(addressed.ref, /^lbr-[0-9a-f]{64}$/);
  assert.equal(addressed.ref.startsWith("rect-"), false);
  assert.equal(addressed.ref.startsWith("enc-"), false);
});

test("normalizes set-like declaration fields before addressing", () => {
  const left = addressLBranchRecord("declaration", {
    ...structuredClone(declaration),
    participantRefs: ["C", "A", "B", "A"],
    influenceRefs: ["R2", "R1", "R1"],
    authorityRefs: ["lease-B", "lease-A", "lease-A"],
  });
  const right = addressLBranchRecord("declaration", {
    ...structuredClone(declaration),
    participantRefs: ["A", "B", "C"],
    influenceRefs: ["R1", "R2"],
    authorityRefs: ["lease-A", "lease-B"],
  });

  assert.equal(left.ref, right.ref);
  assert.deepEqual(left.canonicalBytes, right.canonicalBytes);
});

test("fails closed on unsupported protocol and hostile accessors", () => {
  assert.throws(
    () => validateLBranchDeclaration({ ...structuredClone(declaration), protocolVersion: "p0.l-branch/9.9" }),
    /LBRANCH_PROTOCOL_UNSUPPORTED/,
  );

  let touched = false;
  const hostile = Object.create(null);
  Object.defineProperty(hostile, "protocolVersion", {
    enumerable: true,
    get() {
      touched = true;
      return "p0.l-branch/0.1";
    },
  });

  assert.throws(() => validateLBranchDeclaration(hostile), /LBRANCH_INVALID_REPRESENTATION/);
  assert.equal(touched, false);
});
