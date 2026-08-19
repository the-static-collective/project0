import type {
  LBranchCandidateV01,
  LBranchDeclarationV01,
} from "../../src/l-branch/index";

type LBranchSpecimen = {
  baseline: {
    declaration: LBranchDeclarationV01;
    candidates: LBranchCandidateV01[];
  };
  recognition: {
    controlDeclaration: LBranchDeclarationV01;
    declaration: LBranchDeclarationV01;
    candidates: LBranchCandidateV01[];
  };
  highLoad: {
    lowDeclaration: LBranchDeclarationV01;
    declaration: LBranchDeclarationV01;
    candidates: LBranchCandidateV01[];
  };
};

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const item of Object.values(value as Record<string, unknown>)) {
    deepFreeze(item);
  }
  return Object.freeze(value);
}

const specimen: LBranchSpecimen = {
  baseline: {
    declaration: {
      protocolVersion: "p0.l-branch/0.1",
      snapshotRef: "snapshot-baseline",
      excitationRef: "excitation-E",
      purposeRef: "purpose-baseline",
      participantRefs: ["A", "B", "C"],
      influenceRefs: [],
      authorityRefs: ["lease-A"],
      evaluatorId: "fixture-evaluator",
      evaluatorVersion: "0.1.0",
      policyRef: "policy-public",
      budget: { maxSteps: 4, maxFrontierWidth: 2, maxDepth: 2 },
    },
    candidates: [
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
    ],
  },
  recognition: {
    controlDeclaration: {
      protocolVersion: "p0.l-branch/0.1",
      snapshotRef: "snapshot-recognition",
      excitationRef: "excitation-E",
      purposeRef: "purpose-recognition",
      participantRefs: ["A", "B2"],
      influenceRefs: [],
      authorityRefs: ["lease-A"],
      evaluatorId: "fixture-evaluator",
      evaluatorVersion: "0.1.0",
      policyRef: "policy-public",
      budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 },
    },
    declaration: {
      protocolVersion: "p0.l-branch/0.1",
      snapshotRef: "snapshot-recognition",
      excitationRef: "excitation-E",
      purposeRef: "purpose-recognition",
      participantRefs: ["A", "B2"],
      influenceRefs: ["recognition-R"],
      authorityRefs: ["lease-A"],
      evaluatorId: "fixture-evaluator",
      evaluatorVersion: "0.1.0",
      policyRef: "policy-public",
      budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 },
    },
    candidates: [
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
    ],
  },
  highLoad: {
    lowDeclaration: {
      protocolVersion: "p0.l-branch/0.1",
      snapshotRef: "snapshot-load",
      excitationRef: "excitation-E",
      purposeRef: "purpose-load",
      participantRefs: ["A", "D", "X"],
      influenceRefs: [],
      authorityRefs: ["lease-A"],
      evaluatorId: "fixture-evaluator",
      evaluatorVersion: "0.1.0",
      policyRef: "policy-public",
      budget: { maxSteps: 3, maxFrontierWidth: 1, maxDepth: 1 },
    },
    declaration: {
      protocolVersion: "p0.l-branch/0.1",
      snapshotRef: "snapshot-load",
      excitationRef: "excitation-E",
      purposeRef: "purpose-load",
      participantRefs: ["A", "D", "X"],
      influenceRefs: [],
      authorityRefs: ["lease-A"],
      evaluatorId: "fixture-evaluator",
      evaluatorVersion: "0.1.0",
      policyRef: "policy-public",
      budget: { maxSteps: 3, maxFrontierWidth: 2, maxDepth: 2 },
    },
    candidates: [
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
    ],
  },
};

export const L_BRANCH_SPECIMEN = deepFreeze(specimen);
