import {
  address,
  type ArtifactAddress,
  type ContentAddress,
  type HistoricalAddress,
  type QuestionAddress,
  type TrailAddress,
  type ViewAddress,
} from "./historical-addresses.js";

export type Timestamp = string;
export type AgentRef = string;
export type ScopeRef = string;
export type Capability = "create" | "derive" | "attest" | "disclose" | "cite";

export type AuthorityGrant = {
  address: ArtifactAddress;
  issuerRef: AgentRef;
  holderRef: AgentRef;
  capabilities: Capability[];
  scopeRefs: ScopeRef[];
  purposeRefs: ArtifactAddress[];
  questionRefs: QuestionAddress[];
  validFrom: Timestamp;
  validUntil?: Timestamp;
  authorityBasisRefs: ArtifactAddress[];
  delegable: boolean;
  maximumDelegationDepth?: number;
};

export type AuthorityRevocation = {
  address: ArtifactAddress;
  authorityRef: ArtifactAddress;
  effectiveAt: Timestamp;
  observedAt: Timestamp;
  revokedBy: AgentRef;
  authorityBasisRef: ArtifactAddress;
  reasonRef?: ArtifactAddress;
};

export type ProposedUse = {
  capability: Capability;
  scopeRef: ScopeRef;
  purposeRef: ArtifactAddress;
};

export type AuthorityStatus =
  | "valid"
  | "not_yet_valid"
  | "expired"
  | "revoked"
  | "outside_scope"
  | "outside_purpose"
  | "outside_capability"
  | "indeterminate";

export type TemporalAuthorityEvaluation = {
  authorityRef: ArtifactAddress;
  actTime: Timestamp;
  transactionCutoff: Timestamp;
  evaluationTime: Timestamp;
  creationStatus: AuthorityStatus;
  systemBeliefAtCutoff: AuthorityStatus;
  currentStatus: AuthorityStatus;
  currentUseStatus: "permitted" | "denied" | "indeterminate";
  revocationRefs: ArtifactAddress[];
};

function time(value: Timestamp): number {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) throw new Error(`Invalid timestamp: ${value}`);
  return parsed;
}

function baseStatus(grant: AuthorityGrant, at: Timestamp, use: ProposedUse): AuthorityStatus {
  if (!grant.capabilities.includes(use.capability)) return "outside_capability";
  if (!grant.scopeRefs.includes(use.scopeRef)) return "outside_scope";
  if (!grant.purposeRefs.includes(use.purposeRef)) return "outside_purpose";
  if (time(at) < time(grant.validFrom)) return "not_yet_valid";
  if (grant.validUntil !== undefined && time(at) >= time(grant.validUntil)) return "expired";
  return "valid";
}

function statusAt(
  grant: AuthorityGrant,
  revocations: AuthorityRevocation[],
  worldTime: Timestamp,
  transactionCutoff: Timestamp,
  use: ProposedUse,
): AuthorityStatus {
  const base = baseStatus(grant, worldTime, use);
  if (base !== "valid") return base;

  const knownEffectiveRevocation = revocations.some(
    (item) =>
      item.authorityRef === grant.address &&
      time(item.observedAt) <= time(transactionCutoff) &&
      time(item.effectiveAt) <= time(worldTime),
  );

  return knownEffectiveRevocation ? "revoked" : "valid";
}

export function evaluateAuthority(input: {
  grant?: AuthorityGrant;
  revocations: AuthorityRevocation[];
  actTime: Timestamp;
  transactionCutoff: Timestamp;
  evaluationTime: Timestamp;
  proposedUse: ProposedUse;
}): TemporalAuthorityEvaluation {
  if (input.grant === undefined) {
    return {
      authorityRef: address.artifact({ missing: true }),
      actTime: input.actTime,
      transactionCutoff: input.transactionCutoff,
      evaluationTime: input.evaluationTime,
      creationStatus: "indeterminate",
      systemBeliefAtCutoff: "indeterminate",
      currentStatus: "indeterminate",
      currentUseStatus: "indeterminate",
      revocationRefs: [],
    };
  }

  const creationStatus = statusAt(input.grant, input.revocations, input.actTime, input.evaluationTime, input.proposedUse);
  const systemBeliefAtCutoff = statusAt(
    input.grant,
    input.revocations,
    input.transactionCutoff,
    input.transactionCutoff,
    input.proposedUse,
  );
  const currentStatus = statusAt(
    input.grant,
    input.revocations,
    input.evaluationTime,
    input.evaluationTime,
    input.proposedUse,
  );

  return {
    authorityRef: input.grant.address,
    actTime: input.actTime,
    transactionCutoff: input.transactionCutoff,
    evaluationTime: input.evaluationTime,
    creationStatus,
    systemBeliefAtCutoff,
    currentStatus,
    currentUseStatus:
      currentStatus === "valid" ? "permitted" : currentStatus === "indeterminate" ? "indeterminate" : "denied",
    revocationRefs: input.revocations
      .filter((item) => item.authorityRef === input.grant?.address)
      .map((item) => item.address),
  };
}

export type ConservationLaw =
  | "referent"
  | "history"
  | "address_class_distinction"
  | "authority"
  | "question"
  | "unresolvedness"
  | "privacy"
  | "particularity";

export type ConservationCheck = {
  law: ConservationLaw;
  result: "pass" | "fail" | "indeterminate";
  evidenceRefs: ArtifactAddress[];
  reason: string;
};

export type AdmissionEvaluation = {
  disposition: "admitted" | "rejected" | "indeterminate";
  conservationChecks: ConservationCheck[];
};

function checks(input: {
  immutableReferent: boolean;
  appendOnly: boolean;
  addressClassesDistinct: boolean;
  authority: "pass" | "fail" | "indeterminate";
  questionAddressed: boolean;
  unresolvedPreserved: boolean;
  disclosureAllowed: boolean | "indeterminate";
  particularInteraction: boolean;
  evidenceRefs?: ArtifactAddress[];
}): ConservationCheck[] {
  const refs = input.evidenceRefs ?? [];
  return [
    { law: "referent", result: input.immutableReferent ? "pass" : "fail", evidenceRefs: refs, reason: "Judgment cites an immutable artifact or bounded trail." },
    { law: "history", result: input.appendOnly ? "pass" : "fail", evidenceRefs: refs, reason: "History appends rather than overwrites." },
    { law: "address_class_distinction", result: input.addressClassesDistinct ? "pass" : "fail", evidenceRefs: refs, reason: "Address classes remain non-interchangeable." },
    { law: "authority", result: input.authority, evidenceRefs: refs, reason: "Authority is evaluated from grant and basis." },
    { law: "question", result: input.questionAddressed ? "pass" : "fail", evidenceRefs: refs, reason: "Discernment cites an exact addressed question." },
    { law: "unresolvedness", result: input.unresolvedPreserved ? "pass" : "fail", evidenceRefs: refs, reason: "Unknown and disputed states remain explicit." },
    { law: "privacy", result: input.disclosureAllowed === "indeterminate" ? "indeterminate" : input.disclosureAllowed ? "pass" : "fail", evidenceRefs: refs, reason: "Addressability does not imply disclosure." },
    { law: "particularity", result: input.particularInteraction ? "pass" : "fail", evidenceRefs: refs, reason: "Byte equality does not merge interaction histories." },
  ];
}

export function evaluateAdmission(input: Parameters<typeof checks>[0]): AdmissionEvaluation {
  const conservationChecks = checks(input);
  const results = conservationChecks.map((item) => item.result);
  return {
    disposition: results.includes("fail") ? "rejected" : results.includes("indeterminate") ? "indeterminate" : "admitted",
    conservationChecks,
  };
}

export type ArtifactEnvelope = {
  schemaVersion: "project0.historical-artifact.v0";
  contentRef?: ContentAddress;
  interactionRef: ArtifactAddress;
  parentRefs: ArtifactAddress[];
  purposeRefs: ArtifactAddress[];
  questionRefs: QuestionAddress[];
  tensionRefs: ArtifactAddress[];
  authorityRefs: ArtifactAddress[];
  witnessRefs: ArtifactAddress[];
  declaredAnchors: string[];
  preservedAnchors: string[];
  alteredAnchors: string[];
  unresolvedTensionRefs: ArtifactAddress[];
  visibility: "public" | "metadata_public" | "proof_only" | "private";
  createdAt: Timestamp;
  createdBy: AgentRef;
};

export type StoredArtifact = { address: ArtifactAddress; envelope: ArtifactEnvelope };
export type StoredTrail = { address: TrailAddress; roots: HistoricalAddress[]; members: HistoricalAddress[] };
export type DiscernmentReceipt = {
  address: ArtifactAddress;
  questionRef: QuestionAddress;
  subjectTrailRef: TrailAddress;
  questionTrailRef: TrailAddress;
  disposition: "supported" | "unsupported" | "contradicted" | "indeterminate" | "outside_scope";
  evidenceRefs: ArtifactAddress[];
  supersedesRefs: ArtifactAddress[];
  evaluatedAt: Timestamp;
};

export class AppendOnlyHistoricalStore {
  readonly artifacts = new Map<ArtifactAddress, StoredArtifact>();
  readonly trails = new Map<TrailAddress, StoredTrail>();
  readonly views = new Map<ViewAddress, TrailAddress>();
  readonly admissionReceipts: AdmissionEvaluation[] = [];

  createArtifact(envelope: ArtifactEnvelope, admission: AdmissionEvaluation): ArtifactAddress {
    this.admissionReceipts.push(admission);
    if (admission.disposition !== "admitted") throw new Error(`Artifact ${admission.disposition}`);
    const artifactAddress = address.artifact(envelope);
    if (!this.artifacts.has(artifactAddress)) this.artifacts.set(artifactAddress, { address: artifactAddress, envelope });
    return artifactAddress;
  }

  deriveArtifact(parent: ArtifactAddress, envelope: ArtifactEnvelope, admission: AdmissionEvaluation): ArtifactAddress {
    if (!this.artifacts.has(parent)) throw new Error("Unknown parent artifact");
    if (!envelope.parentRefs.includes(parent)) throw new Error("Derivation must cite its parent");
    if (envelope.preservedAnchors.length === 0 && envelope.alteredAnchors.length === 0) {
      throw new Error("Derivation must declare preserved or altered anchors");
    }
    return this.createArtifact(envelope, admission);
  }

  createTrail(roots: HistoricalAddress[], members: HistoricalAddress[]): TrailAddress {
    const trailAddress = address.trail({ roots, members });
    this.trails.set(trailAddress, { address: trailAddress, roots, members });
    return trailAddress;
  }

  issueDiscernmentReceipt(receipt: Omit<DiscernmentReceipt, "address">, admission: AdmissionEvaluation): ArtifactAddress {
    this.admissionReceipts.push(admission);
    if (admission.disposition !== "admitted") throw new Error(`Discernment ${admission.disposition}`);
    if (!this.trails.has(receipt.subjectTrailRef) || !this.trails.has(receipt.questionTrailRef)) {
      throw new Error("Discernment must cite bounded trails");
    }
    return address.artifact(receipt);
  }

  pointView(seed: unknown, trailRef: TrailAddress): ViewAddress {
    const viewAddress = address.view(seed);
    this.views.set(viewAddress, trailRef);
    return viewAddress;
  }

  resolveArtifact(input: { artifactRef: ArtifactAddress; mayDisclose: boolean }): {
    existence: "confirmed" | "unconfirmed";
    representation: "full_content" | "metadata_only" | "proof_only" | "denied";
    envelope?: ArtifactEnvelope;
  } {
    const artifact = this.artifacts.get(input.artifactRef);
    if (artifact === undefined) return { existence: "unconfirmed", representation: "denied" };
    if (!input.mayDisclose) {
      return {
        existence: "confirmed",
        representation: artifact.envelope.visibility === "metadata_public" ? "metadata_only" : "proof_only",
      };
    }
    return { existence: "confirmed", representation: "full_content", envelope: artifact.envelope };
  }
}
