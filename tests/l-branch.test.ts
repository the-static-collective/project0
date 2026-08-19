import assert from "node:assert/strict";
import test from "node:test";

import {
  L_BRANCH_DOMAIN_PREFIX,
  addressLBranchRecord,
  runLBranch,
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

const candidates = [
  {
    candidateRef: "A",
    depth: 1,
    requiresInputRefs: ["excitation-E"],
    requiresInfluenceRefs: [],
    requiresAuthorityRefs: ["lease-A"],
    requiredPolicyRef: "policy-public",
    terminal: false,
  },
  {
    candidateRef: "B",
    depth: 2,
    requiresInputRefs: ["A"],
    requiresInfluenceRefs: [],
    requiresAuthorityRefs: ["lease-A"],
    requiredPolicyRef: "policy-public",
    terminal: false,
  },
  {
    candidateRef: "C",
    depth: 2,
    requiresInputRefs: ["B"],
    requiresInfluenceRefs: [],
    requiresAuthorityRefs: ["lease-C"],
    requiredPolicyRef: "policy-public",
    terminal: false,
  },
];

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

test("propagates two lawful steps, preserves refusal, and damps", () => {
  const result = runLBranch(declaration, candidates);

  assert.equal(result.steps.length, 3);
  assert.deepEqual(result.steps[0].body.eligibleOutputRefs, ["A"]);
  assert.deepEqual(result.steps[1].body.eligibleOutputRefs, ["B"]);
  assert.deepEqual(result.steps[2].body.refusedOutputRefs, ["C"]);
  assert.equal(result.steps[2].body.refusalReasonCodes.C, "LBRANCH_AUTHORITY_REQUIRED");
  assert.equal(result.terminal.body.disposition, "damped");
  assert.deepEqual(result.terminal.body.finalOutputRefs, ["A", "B"]);

  for (const step of result.steps) {
    assert.equal(step.body.authorityRefsUsed.every((ref: string) => declaration.authorityRefs.includes(ref)), true);
  }
});

test("replays identical declarations and candidates byte-identically", () => {
  const left = runLBranch(structuredClone(declaration), structuredClone(candidates));
  const right = runLBranch(structuredClone(declaration), structuredClone(candidates));

  assert.equal(left.declaration.ref, right.declaration.ref);
  assert.deepEqual(left.declaration.canonicalBytes, right.declaration.canonicalBytes);
  assert.deepEqual(left.steps.map((step) => step.ref), right.steps.map((step) => step.ref));
  assert.deepEqual(left.steps.map((step) => step.canonicalBytes), right.steps.map((step) => step.canonicalBytes));
  assert.equal(left.terminal.ref, right.terminal.ref);
  assert.deepEqual(left.terminal.canonicalBytes, right.terminal.canonicalBytes);
});
