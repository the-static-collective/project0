import { address, type ArtifactAddress, type ContentAddress, type ResidueAddress } from "./historical-addresses.js";

export type Timestamp = string;
export type EvaluationCut = { sequence: number; head?: ResidueAddress };
export type WitnessResidueType =
  | "CHECKER_AUTHORITY_GRANTED" | "CHECKER_AUTHORITY_REVOKED" | "PLAN_SEALED"
  | "EVIDENCE_USE_RECORDED" | "OUTCOME_ACCESS_RECORDED" | "ADMISSION_EVALUATED"
  | "ADMISSION_REFUSED" | "ADMISSION_CAVEATED" | "EXTERNAL_VERIFICATION_IMPORTED"
  | "PROOF_ATTACHMENT_DERIVED" | "PROOF_ATTACHMENT_REFUSED" | "MALFORMED_INPUT_REJECTED";

export type ResidueProposal = {
  residueType: WitnessResidueType;
  observedAtRef: ArtifactAddress;
  effectiveAtRef?: ArtifactAddress;
  payload: unknown;
};
export type ResidueEnvelope = {
  schemaVersion: "project0.witness-residue.v1";
  residueRef: ResidueAddress;
  sequence: number;
  previousResidueRef?: ResidueAddress;
  observedAtRef: ArtifactAddress;
  effectiveAtRef?: ArtifactAddress;
  residueType: WitnessResidueType;
  payloadRef: ArtifactAddress;
};
type StoredResidue = { envelope: ResidueEnvelope; payload: unknown };
export type WitnessProjection = {
  cut: EvaluationCut;
  residueRefs: ResidueAddress[];
  byType: Record<WitnessResidueType, ResidueAddress[]>;
  checkerGrants: Record<string, CheckerGrant>;
  revokedGrantRefs: string[];
  evidenceUseCounts: Record<string, number>;
};
export type ReplayResult = { status: "ok"; projection: WitnessProjection } | { status: "indeterminate"; codes: string[] };
export type AppendResult = { status: "appended"; residue: ResidueEnvelope } | { status: "conflict"; expected: EvaluationCut; actual: EvaluationCut };

export type CheckerGrant = {
  grantRef: string; checkerRef: string; proofSystems: string[]; policyRefs: string[];
  validFrom: Timestamp; validUntil?: Timestamp;
};
export type ExternalVerification = {
  envelopeRef: string; checkerRef: string; grantRef: string; issuedAt: Timestamp;
  proofSystem: string; policyRef: string; candidateRef: string; propositionRef: string;
  subjectReceiptRef: string; checkerInputHash: string;
  checkerResult: "verified" | "rejected" | "indeterminate";
  signatureVerificationRef: string;
};
export type AttachmentRequest = {
  verificationEnvelopeRef: string; candidateRef: string; propositionRef: string;
  policyRef: string; subjectReceiptRef: string; checkerInputHash: string;
  baseReceiptRef: string; observedAtRef: ArtifactAddress;
};

const RESIDUE_TYPES: WitnessResidueType[] = ["CHECKER_AUTHORITY_GRANTED","CHECKER_AUTHORITY_REVOKED","PLAN_SEALED","EVIDENCE_USE_RECORDED","OUTCOME_ACCESS_RECORDED","ADMISSION_EVALUATED","ADMISSION_REFUSED","ADMISSION_CAVEATED","EXTERNAL_VERIFICATION_IMPORTED","PROOF_ATTACHMENT_DERIVED","PROOF_ATTACHMENT_REFUSED","MALFORMED_INPUT_REJECTED"];
const emptyByType = () => Object.fromEntries(RESIDUE_TYPES.map((type) => [type, [] as ResidueAddress[]])) as unknown as Record<WitnessResidueType, ResidueAddress[]>;
const timestamp = (value: string) => { const parsed = Date.parse(value); if (Number.isNaN(parsed)) throw new Error("INVALID_TIMESTAMP"); return parsed; };

function body(envelope: Omit<ResidueEnvelope, "residueRef">): Omit<ResidueEnvelope, "residueRef"> { return envelope; }
function isType(value: string): value is WitnessResidueType { return RESIDUE_TYPES.includes(value as WitnessResidueType); }

export function replay(residues: readonly StoredResidue[], cut: EvaluationCut): ReplayResult {
  const projection: WitnessProjection = { cut: { sequence: 0 }, residueRefs: [], byType: emptyByType(), checkerGrants: {}, revokedGrantRefs: [], evidenceUseCounts: {} };
  let previous: ResidueAddress | undefined;
  for (let index = 0; index < Math.min(cut.sequence, residues.length); index++) {
    const item = residues[index];
    const expectedSequence = index + 1;
    const codes: string[] = [];
    if (item.envelope.sequence !== expectedSequence) codes.push("SEQUENCE_GAP");
    if (item.envelope.previousResidueRef !== previous) codes.push("PREVIOUS_HEAD_MISMATCH");
    if (!isType(item.envelope.residueType)) codes.push("UNKNOWN_SCHEMA");
    if (address.artifact(item.payload) !== item.envelope.payloadRef) codes.push("BAD_PAYLOAD_ADDRESS");
    const { residueRef: _ignored, ...hashable } = item.envelope;
    if (address.residue(hashable) !== item.envelope.residueRef) codes.push("BAD_RESIDUE_ADDRESS");
    if (codes.length) return { status: "indeterminate", codes };
    previous = item.envelope.residueRef;
    projection.residueRefs.push(previous);
    projection.byType[item.envelope.residueType].push(previous);
    if (item.envelope.residueType === "CHECKER_AUTHORITY_GRANTED") {
      const grant = item.payload as CheckerGrant; projection.checkerGrants[grant.grantRef] = grant;
    }
    if (item.envelope.residueType === "CHECKER_AUTHORITY_REVOKED") projection.revokedGrantRefs.push((item.payload as { grantRef: string }).grantRef);
    if (item.envelope.residueType === "EVIDENCE_USE_RECORDED") {
      const ref = (item.payload as { evidenceRef: string }).evidenceRef;
      projection.evidenceUseCounts[ref] = (projection.evidenceUseCounts[ref] ?? 0) + 1;
    }
    projection.cut = { sequence: expectedSequence, head: previous };
  }
  if (cut.sequence > residues.length) return { status: "indeterminate", codes: ["CUT_BEYOND_HEAD"] };
  if (cut.head !== undefined && cut.head !== previous) return { status: "indeterminate", codes: ["CUT_HEAD_MISMATCH"] };
  return { status: "ok", projection };
}

export class WitnessResidueStore {
  private readonly residues: StoredResidue[] = [];
  private readonly imported = new Map<string, ExternalVerification>();
  private readonly derived = new Map<ArtifactAddress, unknown>();
  get head(): EvaluationCut { const last = this.residues[this.residues.length - 1]; return { sequence: this.residues.length, ...(last ? { head: last.envelope.residueRef } : {}) }; }
  snapshot(): readonly StoredResidue[] { return structuredClone(this.residues); }
  getDerived(ref: ArtifactAddress): unknown { return this.derived.get(ref); }
  project(cut = this.head): ReplayResult { return replay(this.residues, cut); }

  append(proposal: ResidueProposal, expectedHead: EvaluationCut): AppendResult {
    const actual = this.head;
    if (expectedHead.sequence !== actual.sequence || expectedHead.head !== actual.head) return { status: "conflict", expected: expectedHead, actual };
    const payloadRef = address.artifact(proposal.payload);
    const hashable = body({ schemaVersion: "project0.witness-residue.v1", sequence: actual.sequence + 1,
      ...(actual.head ? { previousResidueRef: actual.head } : {}), observedAtRef: proposal.observedAtRef,
      ...(proposal.effectiveAtRef ? { effectiveAtRef: proposal.effectiveAtRef } : {}), residueType: proposal.residueType, payloadRef });
    const envelope: ResidueEnvelope = { ...hashable, residueRef: address.residue(hashable) };
    this.residues.push({ envelope, payload: structuredClone(proposal.payload) });
    return { status: "appended", residue: envelope };
  }

  ingest(raw: Uint8Array, proposed: unknown, operation: string, observedAtRef: ArtifactAddress): AppendResult {
    try { address.artifact(proposed); }
    catch (error) {
      return this.append({ residueType: "MALFORMED_INPUT_REJECTED", observedAtRef, payload: {
        rawSubmissionRef: address.content(raw), operation, validatorVersion: "project0-jcs-v1",
        failureCodes: [error instanceof Error ? error.message : "INVALID_INPUT"],
      } }, this.head);
    }
    return this.append({ residueType: "PLAN_SEALED", observedAtRef, payload: proposed }, this.head);
  }

  recordAdmission(input: { completeConfirmatoryEvidence: boolean; assurance: string; observedAtRef: ArtifactAddress }): AppendResult {
    return this.append({ residueType: input.completeConfirmatoryEvidence ? "ADMISSION_EVALUATED" : "ADMISSION_REFUSED", observedAtRef: input.observedAtRef,
      payload: { admissionStatus: input.completeConfirmatoryEvidence ? "admitted" : "refused", assurance: input.assurance,
        reasonCodes: input.completeConfirmatoryEvidence ? [] : ["INCOMPLETE_CONFIRMATORY_EVIDENCE"] } }, this.head);
  }

  importExternalVerification(value: ExternalVerification, observedAtRef: ArtifactAddress): AppendResult {
    this.imported.set(value.envelopeRef, structuredClone(value));
    return this.append({ residueType: "EXTERNAL_VERIFICATION_IMPORTED", observedAtRef, payload: value }, this.head);
  }

  attachProof(request: AttachmentRequest, cut = this.head): AppendResult {
    const replayed = this.project(cut);
    const verification = this.imported.get(request.verificationEnvelopeRef);
    const failed: string[] = [];
    if (replayed.status !== "ok") failed.push("REPLAY_INDETERMINATE");
    if (!verification) failed.push("VERIFICATION_NOT_IMPORTED");
    const grant = verification && replayed.status === "ok" ? replayed.projection.checkerGrants[verification.grantRef] : undefined;
    if (verification && !grant) failed.push("UNAUTHORIZED_CHECKER");
    if (verification && grant) {
      if (grant.checkerRef !== verification.checkerRef || timestamp(verification.issuedAt) < timestamp(grant.validFrom) || (grant.validUntil && timestamp(verification.issuedAt) >= timestamp(grant.validUntil))) failed.push("UNAUTHORIZED_CHECKER");
      if (replayed.status === "ok" && replayed.projection.revokedGrantRefs.includes(grant.grantRef)) failed.push("GRANT_REVOKED_AT_CUT");
      if (!grant.proofSystems.includes(verification.proofSystem)) failed.push("PROOF_SYSTEM_OUT_OF_SCOPE");
      if (!grant.policyRefs.includes(verification.policyRef)) failed.push("POLICY_OUT_OF_SCOPE");
    }
    if (verification) {
      if (verification.candidateRef !== request.candidateRef) failed.push("CANDIDATE_MISMATCH");
      if (verification.propositionRef !== request.propositionRef) failed.push("PROPOSITION_MISMATCH");
      if (verification.policyRef !== request.policyRef) failed.push("POLICY_MISMATCH");
      if (verification.subjectReceiptRef !== request.subjectReceiptRef) failed.push("SUBJECT_RECEIPT_MISMATCH");
      if (verification.checkerInputHash !== request.checkerInputHash) failed.push("INPUT_HASH_MISMATCH");
      if (!verification.signatureVerificationRef) failed.push("SIGNATURE_VERIFICATION_MISSING");
    }
    if (failed.length || verification?.checkerResult !== "verified") {
      return this.append({ residueType: "PROOF_ATTACHMENT_REFUSED", observedAtRef: request.observedAtRef,
        payload: { verificationEnvelopeRef: request.verificationEnvelopeRef, failedPredicateCodes: failed.length ? failed : ["CHECKER_RESULT_NOT_VERIFIED"], checkerResult: verification?.checkerResult ?? "indeterminate" } }, this.head);
    }
    const artifact = { schemaVersion: "project0.derived-proof-receipt.v1", derivedFromBaseReceiptRef: request.baseReceiptRef,
      verificationEnvelopeRef: verification.envelopeRef, candidateRef: request.candidateRef, propositionRef: request.propositionRef };
    const derivedRef = address.artifact(artifact); this.derived.set(derivedRef, artifact);
    return this.append({ residueType: "PROOF_ATTACHMENT_DERIVED", observedAtRef: request.observedAtRef, payload: { derivedRef, artifact } }, this.head);
  }

  recordEvidenceUse(evidenceRef: string, observedAtRef: ArtifactAddress): AppendResult {
    const atCut = this.project(); if (atCut.status !== "ok") throw new Error("REPLAY_INDETERMINATE");
    return this.append({ residueType: "EVIDENCE_USE_RECORDED", observedAtRef, payload: { evidenceRef, priorUseCount: atCut.projection.evidenceUseCounts[evidenceRef] ?? 0 } }, this.head);
  }
}

export function rawTransportRef(bytes: Uint8Array): ContentAddress { return address.content(bytes); }
