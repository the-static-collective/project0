import { computeSemanticAddress } from "../canonical-addressing/index.js";
import { invalid, REASON_CODES, valid, type ValidationResult } from "./reason-codes.js";
import {
  NODE_KINDS,
  RECEIPT_TYPES,
  RELATIONSHIP_TYPES,
  type AddressResult,
} from "./types.js";

const nodeKinds = new Set<string>(NODE_KINDS);
const relationshipTypes = new Set<string>(RELATIONSHIP_TYPES);
const receiptTypes = new Set<string>(RECEIPT_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalizable(type: "Node" | "Edge" | "Receipt", value: unknown): ValidationResult {
  try {
    computeSemanticAddress(type, value);
    return valid();
  } catch {
    return invalid(REASON_CODES.CANONICALIZATION_FAILED);
  }
}

export function validateNode(value: unknown): ValidationResult {
  if (!isRecord(value)) return invalid(REASON_CODES.INVALID_STRUCTURE);
  if (typeof value.kind !== "string" || !nodeKinds.has(value.kind)) {
    return invalid(REASON_CODES.INVALID_NODE_KIND);
  }
  if (!Object.prototype.hasOwnProperty.call(value, "provenance") || !Array.isArray(value.provenance)) {
    return invalid(REASON_CODES.PROVENANCE_REQUIRED);
  }
  if (!Array.isArray(value.relationships)) return invalid(REASON_CODES.INVALID_STRUCTURE);
  if (typeof value.disclosure !== "string") return invalid(REASON_CODES.INVALID_STRUCTURE);
  return canonicalizable("Node", value);
}

export function validateProvenanceRefs(value: unknown, knownRefs: ReadonlySet<string>): ValidationResult {
  const structural = validateNode(value);
  if (structural.status === "invalid") return structural;
  const provenance = (value as Record<string, unknown>).provenance as unknown[];
  if (provenance.some((ref) => typeof ref !== "string" || !knownRefs.has(ref))) {
    return invalid(REASON_CODES.PROVENANCE_UNRESOLVED);
  }
  return valid();
}

export function validateRelationship(value: unknown): ValidationResult {
  if (!isRecord(value)) return invalid(REASON_CODES.INVALID_STRUCTURE);
  if (typeof value.type !== "string" || !relationshipTypes.has(value.type)) {
    return invalid(REASON_CODES.INVALID_RELATIONSHIP_TYPE);
  }
  return canonicalizable("Edge", value);
}

export function validateReceipt(value: unknown): ValidationResult {
  if (!isRecord(value)) return invalid(REASON_CODES.INVALID_STRUCTURE);
  if (typeof value.receiptType !== "string" || !receiptTypes.has(value.receiptType)) {
    return invalid(REASON_CODES.INVALID_RECEIPT_TYPE);
  }
  return canonicalizable("Receipt", value);
}

function address(type: "Node" | "Edge" | "Receipt", value: unknown, validation: ValidationResult): AddressResult {
  if (validation.status === "invalid") throw new Error(validation.reasonCodes.join(","));
  const result = computeSemanticAddress(type, value);
  return { address: result.textualId, digestHex: result.digestHex, canonicalBytes: result.canonicalBytes };
}

export function addressNode(value: unknown): AddressResult {
  return address("Node", value, validateNode(value));
}

export function addressRelationship(value: unknown): AddressResult {
  return address("Edge", value, validateRelationship(value));
}

export function addressReceipt(value: unknown): AddressResult {
  return address("Receipt", value, validateReceipt(value));
}
