export const REASON_CODES = {
  INVALID_STRUCTURE: "INVALID_STRUCTURE",
  INVALID_NODE_KIND: "INVALID_NODE_KIND",
  INVALID_RELATIONSHIP_TYPE: "INVALID_RELATIONSHIP_TYPE",
  INVALID_RECEIPT_TYPE: "INVALID_RECEIPT_TYPE",
  PROVENANCE_REQUIRED: "PROVENANCE_REQUIRED",
  PROVENANCE_UNRESOLVED: "PROVENANCE_UNRESOLVED",
  CANONICALIZATION_FAILED: "CANONICALIZATION_FAILED",
  RECEIPT_PARENT_MISSING: "RECEIPT_PARENT_MISSING",
  RECEIPT_IDENTITY_CONFLICT: "RECEIPT_IDENTITY_CONFLICT",
} as const;

export type ReasonCode = typeof REASON_CODES[keyof typeof REASON_CODES];

export type ValidationResult =
  | { status: "valid"; reasonCodes: [] }
  | { status: "invalid"; reasonCodes: ReasonCode[] };

export const valid = (): ValidationResult => ({ status: "valid", reasonCodes: [] });
export const invalid = (...reasonCodes: ReasonCode[]): ValidationResult => ({ status: "invalid", reasonCodes });
