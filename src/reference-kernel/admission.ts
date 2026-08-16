import { REASON_CODES, type ReasonCode, type ValidationResult } from "./reason-codes.js";
import type { AuthorityEvaluation } from "./authority.js";
import type { EpistemicDisposition, PipelineAdmission } from "./types.js";

export type PipelineAdmissionInput = {
  authority: AuthorityEvaluation;
  provenance: ValidationResult;
  disclosureAllowed: boolean | "indeterminate";
};

function refused(reasonCodes: ReasonCode[]): PipelineAdmission {
  return { status: "refused", reasonCodes };
}

function indeterminate(reasonCodes: ReasonCode[]): PipelineAdmission {
  return { status: "indeterminate", reasonCodes };
}

export function evaluatePipelineAdmission(input: PipelineAdmissionInput): PipelineAdmission {
  if (input.authority.status === "refused") return refused(input.authority.reasonCodes);
  if (input.authority.status === "indeterminate") return indeterminate(input.authority.reasonCodes);

  if (input.provenance.status === "invalid") {
    if (input.provenance.reasonCodes.includes(REASON_CODES.PROVENANCE_UNRESOLVED)) {
      return indeterminate(input.provenance.reasonCodes);
    }
    return refused(input.provenance.reasonCodes);
  }

  if (input.disclosureAllowed === false) return refused([REASON_CODES.DISCLOSURE_NOT_PERMITTED]);
  if (input.disclosureAllowed === "indeterminate") return indeterminate([REASON_CODES.DISCLOSURE_INDETERMINATE]);

  return { status: "admitted", reasonCodes: [] };
}

export function evaluateMaterial(input: {
  admissionInput: PipelineAdmissionInput;
  epistemicDisposition: EpistemicDisposition;
}): { admission: PipelineAdmission; epistemicDisposition: EpistemicDisposition } {
  return {
    admission: evaluatePipelineAdmission(input.admissionInput),
    epistemicDisposition: input.epistemicDisposition,
  };
}
