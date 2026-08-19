import assert from "node:assert/strict";
import test from "node:test";

import { runLBranch } from "../src/l-branch/index";

const baseDeclaration = {
  protocolVersion: "p0.l-branch/0.1" as const,
  snapshotRef: "snapshot-influence",
  excitationRef: "excitation-E",
  purposeRef: "purpose-compose",
  participantRefs: ["A", "B2"],
  influenceRefs: [],
  authorityRefs: ["lease-A"],
  evaluatorId: "fixture-evaluator",
  evaluatorVersion: "0.1.0",
  policyRef: "policy-public",
  budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 },
};

const influenceCandidates = [
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
    candidateRef: "B2",
    depth: 2,
    requiresInputRefs: ["A"],
    requiresInfluenceRefs: ["recognition-R"],
    requiresAuthorityRefs: ["lease-A"],
    requiredPolicyRef: "policy-public",
    terminal: false,
  },
];

test("influence changes susceptibility without changing authority", () => {
  const withoutRecognition = runLBranch(baseDeclaration, influenceCandidates);
  const withRecognition = runLBranch(
    { ...structuredClone(baseDeclaration), influenceRefs: ["recognition-R"] },
    structuredClone(influenceCandidates),
  );

  assert.deepEqual(withoutRecognition.declaration.body.authorityRefs, ["lease-A"]);
  assert.deepEqual(withRecognition.declaration.body.authorityRefs, ["lease-A"]);
  assert.equal(withoutRecognition.terminal.body.finalOutputRefs.includes("B2"), false);
  assert.equal(withRecognition.terminal.body.finalOutputRefs.includes("B2"), true);
  assert.equal(withRecognition.terminal.body.authorityRefsUsed.includes("recognition-R"), false);
  assert.equal(
    withRecognition.steps.some((step) => step.body.influenceRefsConsulted.includes("recognition-R")),
    true,
  );
});

test("larger declared load expands search reach without widening sovereignty", () => {
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
      candidateRef: "X",
      depth: 1,
      requiresInputRefs: ["excitation-E"],
      requiresInfluenceRefs: [],
      requiresAuthorityRefs: ["lease-A"],
      requiredPolicyRef: "policy-public",
      terminal: false,
    },
    {
      candidateRef: "D",
      depth: 2,
      requiresInputRefs: ["A"],
      requiresInfluenceRefs: [],
      requiresAuthorityRefs: ["lease-A"],
      requiredPolicyRef: "policy-public",
      terminal: false,
    },
  ];

  const shared = {
    protocolVersion: "p0.l-branch/0.1" as const,
    snapshotRef: "snapshot-load",
    excitationRef: "excitation-E",
    purposeRef: "purpose-search",
    participantRefs: ["A", "D", "X"],
    influenceRefs: [],
    authorityRefs: ["lease-A"],
    evaluatorId: "fixture-evaluator",
    evaluatorVersion: "0.1.0",
    policyRef: "policy-public",
  };

  const low = runLBranch(
    { ...shared, budget: { maxSteps: 3, maxFrontierWidth: 1, maxDepth: 1 } },
    structuredClone(candidates),
  );
  const high = runLBranch(
    { ...shared, budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 } },
    structuredClone(candidates),
  );

  assert.deepEqual(low.declaration.body.authorityRefs, high.declaration.body.authorityRefs);
  assert.equal(low.terminal.body.finalOutputRefs.includes("D"), false);
  assert.equal(high.terminal.body.finalOutputRefs.includes("D"), true);
  assert.equal(low.terminal.body.disposition, "exhausted");
  assert.equal(high.terminal.body.disposition, "damped");
});

test("candidate outside the admitted participant topology is refused", () => {
  const declaration = {
    protocolVersion: "p0.l-branch/0.1" as const,
    snapshotRef: "snapshot-topology",
    excitationRef: "excitation-E",
    purposeRef: "purpose-topology",
    participantRefs: ["A"],
    influenceRefs: [],
    authorityRefs: ["lease-A"],
    evaluatorId: "fixture-evaluator",
    evaluatorVersion: "0.1.0",
    policyRef: "policy-public",
    budget: { maxSteps: 2, maxFrontierWidth: 2, maxDepth: 1 },
  };
  const candidates = [
    {
      candidateRef: "Z",
      depth: 1,
      requiresInputRefs: ["excitation-E"],
      requiresInfluenceRefs: [],
      requiresAuthorityRefs: ["lease-A"],
      requiredPolicyRef: "policy-public",
      terminal: false,
    },
  ];

  const result = runLBranch(declaration, candidates);

  assert.deepEqual(result.terminal.body.finalOutputRefs, []);
  assert.deepEqual(result.terminal.body.refusedAttemptRefs, ["Z"]);
  assert.equal(result.steps[0].body.refusalReasonCodes.Z, "LBRANCH_UNDECLARED_PARTICIPANT");
  assert.equal(result.terminal.body.disposition, "refused");
});

test("policy mismatch refuses safely without leaking undeclared external identifiers", () => {
  const secretRef = "secret-object-stable-id-must-not-leak";
  const declaration = {
    protocolVersion: "p0.l-branch/0.1" as const,
    snapshotRef: "snapshot-policy",
    excitationRef: "excitation-E",
    purposeRef: "purpose-policy",
    participantRefs: ["P", "Q"],
    influenceRefs: [],
    authorityRefs: ["lease-A"],
    evaluatorId: "fixture-evaluator",
    evaluatorVersion: "0.1.0",
    policyRef: "policy-public",
    budget: { maxSteps: 2, maxFrontierWidth: 2, maxDepth: 1 },
  };
  const candidates = [
    {
      candidateRef: "P",
      depth: 1,
      requiresInputRefs: ["excitation-E"],
      requiresInfluenceRefs: [],
      requiresAuthorityRefs: ["lease-A"],
      requiredPolicyRef: "policy-private",
      terminal: false,
    },
    {
      candidateRef: "Q",
      depth: 1,
      requiresInputRefs: [secretRef],
      requiresInfluenceRefs: [],
      requiresAuthorityRefs: ["lease-A"],
      requiredPolicyRef: "policy-private",
      terminal: false,
    },
  ];

  const result = runLBranch(declaration, candidates);
  const serialized = JSON.stringify(result);

  assert.deepEqual(result.terminal.body.finalOutputRefs, []);
  assert.deepEqual(result.terminal.body.refusedAttemptRefs, ["P"]);
  assert.equal(result.steps[0].body.refusalReasonCodes.P, "LBRANCH_POLICY_REQUIRED");
  assert.equal(serialized.includes(secretRef), false);
  assert.equal(result.terminal.body.disposition, "refused");
});
