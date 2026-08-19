import {
  addressLBranchRecord,
  type AddressedLBranchRecord,
} from "./address";
import type {
  LBranchCandidateV01,
  LBranchDeclarationV01,
  LBranchStepRecordV01,
  LBranchTerminalDispositionV01,
  LBranchTerminalRecordV01,
} from "./types";
import {
  LBranchValidationError,
  validateLBranchCandidate,
  validateLBranchDeclaration,
} from "./validate";

export type LBranchExecutionResultV01 = {
  declaration: AddressedLBranchRecord<LBranchDeclarationV01>;
  steps: AddressedLBranchRecord<LBranchStepRecordV01>[];
  terminal: AddressedLBranchRecord<LBranchTerminalRecordV01>;
};

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

function normalizeCandidate(candidate: LBranchCandidateV01): LBranchCandidateV01 {
  return {
    candidateRef: candidate.candidateRef,
    depth: candidate.depth,
    requiresInputRefs: sortedUnique(candidate.requiresInputRefs),
    requiresInfluenceRefs: sortedUnique(candidate.requiresInfluenceRefs),
    requiresAuthorityRefs: sortedUnique(candidate.requiresAuthorityRefs),
    requiredPolicyRef: candidate.requiredPolicyRef,
    terminal: candidate.terminal,
  };
}

export function runLBranch(
  declaration: LBranchDeclarationV01,
  candidates: LBranchCandidateV01[],
): LBranchExecutionResultV01 {
  validateLBranchDeclaration(declaration);
  const addressedDeclaration = addressLBranchRecord("declaration", declaration);
  const branch = addressedDeclaration.body;

  if (!Array.isArray(candidates)) {
    throw new LBranchValidationError("LBRANCH_INVALID_CANDIDATES");
  }

  const normalizedCandidates = candidates.map((candidate) => {
    validateLBranchCandidate(candidate);
    return normalizeCandidate(candidate);
  }).sort((left, right) => left.depth - right.depth || left.candidateRef.localeCompare(right.candidateRef));

  const seenCandidateRefs = new Set<string>();
  for (const candidate of normalizedCandidates) {
    if (seenCandidateRefs.has(candidate.candidateRef)) {
      throw new LBranchValidationError("LBRANCH_DUPLICATE_CANDIDATE");
    }
    seenCandidateRefs.add(candidate.candidateRef);
  }

  const availableRefs = new Set<string>([branch.excitationRef]);
  const handledRefs = new Set<string>();
  const outputRefs = new Set<string>();
  const refusedRefs = new Set<string>();
  const authorityUsed = new Set<string>();
  const steps: AddressedLBranchRecord<LBranchStepRecordV01>[] = [];

  let completed = false;
  let exhausted = false;

  while (!completed) {
    const pending = normalizedCandidates.filter((candidate) => !handledRefs.has(candidate.candidateRef));
    const referenceReady = pending.filter((candidate) =>
      candidate.requiresInputRefs.every((ref) => availableRefs.has(ref))
      && candidate.requiresInfluenceRefs.every((ref) => branch.influenceRefs.includes(ref))
    );
    const depthBlocked = referenceReady.filter((candidate) => candidate.depth > branch.budget.maxDepth);
    const ready = referenceReady.filter((candidate) => candidate.depth <= branch.budget.maxDepth);

    if (steps.length >= branch.budget.maxSteps) {
      exhausted = ready.length > 0 || depthBlocked.length > 0;
      break;
    }
    if (ready.length === 0) {
      exhausted = depthBlocked.length > 0;
      break;
    }

    const frontier = ready.slice(0, branch.budget.maxFrontierWidth);
    const eligibleOutputRefs: string[] = [];
    const refusedOutputRefs: string[] = [];
    const refusalReasonCodes: Record<string, string> = {};
    const stepAuthorityRefs = new Set<string>();
    const influenceRefsConsulted = new Set<string>();
    const inputRefs = new Set<string>();

    for (const candidate of frontier) {
      handledRefs.add(candidate.candidateRef);
      candidate.requiresInputRefs.forEach((ref) => inputRefs.add(ref));
      candidate.requiresInfluenceRefs.forEach((ref) => influenceRefsConsulted.add(ref));

      let refusalReason: string | null = null;
      if (!branch.participantRefs.includes(candidate.candidateRef)) {
        refusalReason = "LBRANCH_UNDECLARED_PARTICIPANT";
      } else if (candidate.requiredPolicyRef !== branch.policyRef) {
        refusalReason = "LBRANCH_POLICY_REQUIRED";
      } else if (candidate.requiresAuthorityRefs.some((ref) => !branch.authorityRefs.includes(ref))) {
        refusalReason = "LBRANCH_AUTHORITY_REQUIRED";
      }

      if (refusalReason) {
        refusedOutputRefs.push(candidate.candidateRef);
        refusedRefs.add(candidate.candidateRef);
        refusalReasonCodes[candidate.candidateRef] = refusalReason;
        continue;
      }

      eligibleOutputRefs.push(candidate.candidateRef);
      outputRefs.add(candidate.candidateRef);
      availableRefs.add(candidate.candidateRef);
      for (const ref of candidate.requiresAuthorityRefs) {
        stepAuthorityRefs.add(ref);
        authorityUsed.add(ref);
      }
      if (candidate.terminal) completed = true;
    }

    const remainingSteps = Math.max(0, branch.budget.maxSteps - steps.length - 1);
    const stepBody: LBranchStepRecordV01 = {
      branchRef: addressedDeclaration.ref,
      stepIndex: steps.length,
      depth: Math.min(...frontier.map((candidate) => candidate.depth)),
      inputRefs: sortedUnique(inputRefs),
      consideredRefs: frontier.map((candidate) => candidate.candidateRef),
      eligibleOutputRefs,
      refusedOutputRefs,
      refusalReasonCodes,
      authorityRefsUsed: sortedUnique(stepAuthorityRefs),
      influenceRefsConsulted: sortedUnique(influenceRefsConsulted),
      remainingBudget: {
        maxSteps: remainingSteps,
        maxFrontierWidth: branch.budget.maxFrontierWidth,
        maxDepth: branch.budget.maxDepth,
      },
    };
    steps.push(addressLBranchRecord("step", stepBody));
  }

  let disposition: LBranchTerminalDispositionV01;
  if (completed) {
    disposition = "completed";
  } else if (exhausted) {
    disposition = "exhausted";
  } else if (outputRefs.size === 0 && refusedRefs.size > 0) {
    disposition = "refused";
  } else {
    disposition = "damped";
  }

  const remainingSteps = Math.max(0, branch.budget.maxSteps - steps.length);
  const terminalBody: LBranchTerminalRecordV01 = {
    branchRef: addressedDeclaration.ref,
    disposition,
    stepRecordRefs: steps.map((step) => step.ref),
    finalOutputRefs: sortedUnique(outputRefs),
    refusedAttemptRefs: sortedUnique(refusedRefs),
    authorityRefsUsed: sortedUnique(authorityUsed),
    unusedAuthorityRefs: branch.authorityRefs.filter((ref) => !authorityUsed.has(ref)),
    remainingBudget: {
      maxSteps: remainingSteps,
      maxFrontierWidth: branch.budget.maxFrontierWidth,
      maxDepth: branch.budget.maxDepth,
    },
  };

  return {
    declaration: addressedDeclaration,
    steps,
    terminal: addressLBranchRecord("terminal", terminalBody),
  };
}
