export const NODE_KINDS = [
  "source",
  "observation",
  "claim",
  "proposal",
  "tension",
  "rejection",
  "witness",
  "harvest",
  "inference",
] as const;
export type NodeKind = typeof NODE_KINDS[number];

export const RELATIONSHIP_TYPES = [
  "derived_from", "quotes", "compresses", "revises", "depends_on",
  "supports", "contradicts", "qualifies", "observes",
  "answers", "asks", "rebuttal_to", "responds_to", "continues",
  "delegates", "consumes", "revokes", "permits_disclosure",
  "precedes", "overlaps", "supersedes",
] as const;
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];

export const RECEIPT_TYPES = [
  "RevelationReceipt",
  "TriageReceipt",
  "LeaseGrant",
  "LeaseConsumption",
  "TransferReceipt",
  "DispositionReceipt",
  "WitnessReceipt",
  "PipelineAdmission",
] as const;
export type ReceiptType = typeof RECEIPT_TYPES[number];

export type CanonicalNode = {
  kind: NodeKind;
  body: unknown;
  createdAt: string;
  createdBy: string;
  provenance: string[];
  disclosure: string;
  relationships: string[];
};

export type CanonicalRelationship = {
  type: RelationshipType;
  from: string;
  to: string;
  assertedBy: string;
  createdAt: string;
  scopeId: string;
  basis?: string | null;
  disclosure: string;
  validFrom?: string | null;
  validUntil?: string | null;
};

export type CanonicalReceipt = {
  receiptType: ReceiptType;
  issuedAt: string;
  issuer: string;
  subject: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  authorityRef: string | null;
  policyRefs: string[];
  previousReceiptRefs: string[];
};

export type DisclosurePolicy = {
  policyRef: string;
  permittedScopes: string[];
  permittedPurposes: string[];
  permittedRecipients?: string[];
  permittedDisclosures: string[];
};

export type LeaseGrantOutputs = {
  recipient: string;
  capability: string;
  scopeId: string;
  purpose: string;
  invocationLimit: number;
  validFrom?: string;
  validUntil?: string;
};

export type LeaseConsumptionOutputs = {
  grantRef: string;
  actor: string;
  capability: string;
  scopeId: string;
  purpose: string;
};

export type AuthorityRequest = {
  actor: string;
  capability: string;
  scopeId: string;
  purpose: string;
  disclosure: string;
  evaluatedAt: string;
};

export type EpistemicDisposition =
  | "supported"
  | "weak"
  | "disputed"
  | "rejected"
  | "unknown"
  | "not_evaluated";

export type PipelineAdmission =
  | { status: "admitted"; reasonCodes: [] }
  | { status: "refused"; reasonCodes: string[] }
  | { status: "indeterminate"; reasonCodes: string[] };

export type AddressResult = {
  address: string;
  digestHex: string;
  canonicalBytes: Buffer;
};
