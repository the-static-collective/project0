export const L_BRANCH_PROTOCOL_VERSION = "p0.l-branch/0.1" as const;

export type PropagationBudgetV01 = {
  maxSteps: number;
  maxFrontierWidth: number;
  maxDepth: number;
};

export type LBranchDeclarationV01 = {
  protocolVersion: typeof L_BRANCH_PROTOCOL_VERSION;
  snapshotRef: string;
  excitationRef: string;
  purposeRef: string;
  participantRefs: string[];
  influenceRefs: string[];
  authorityRefs: string[];
  evaluatorId: string;
  evaluatorVersion: string;
  policyRef: string;
  budget: PropagationBudgetV01;
};

export type LBranchCandidateV01 = {
  candidateRef: string;
  depth: number;
  requiresInputRefs: string[];
  requiresInfluenceRefs: string[];
  requiresAuthorityRefs: string[];
  requiredPolicyRef: string;
  terminal: boolean;
};

export type LBranchTerminalDispositionV01 =
  | "completed"
  | "damped"
  | "refused"
  | "exhausted"
  | "inadmissible";

export type LBranchStepRecordV01 = {
  branchRef: string;
  stepIndex: number;
  depth: number;
  inputRefs: string[];
  consideredRefs: string[];
  eligibleOutputRefs: string[];
  refusedOutputRefs: string[];
  refusalReasonCodes: Record<string, string>;
  authorityRefsUsed: string[];
  influenceRefsConsulted: string[];
  remainingBudget: PropagationBudgetV01;
};

export type LBranchTerminalRecordV01 = {
  branchRef: string;
  disposition: LBranchTerminalDispositionV01;
  stepRecordRefs: string[];
  finalOutputRefs: string[];
  refusedAttemptRefs: string[];
  authorityRefsUsed: string[];
  unusedAuthorityRefs: string[];
  remainingBudget: PropagationBudgetV01;
};

export type LBranchRecordType = "declaration" | "step" | "terminal";
