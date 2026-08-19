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
