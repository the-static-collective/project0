import { validateTimestamp } from "../canonical-addressing/index.js";
import { REASON_CODES, type ReasonCode } from "./reason-codes.js";
import { ReceiptGraph } from "./receipt-graph.js";
import type { AuthorityRequest, CanonicalReceipt, DisclosurePolicy, LeaseGrantOutputs } from "./types.js";
import { addressReceipt } from "./validate.js";

export type AuthorityEvaluation =
  | { status: "permitted"; reasonCodes: []; grantRef: string; remainingInvocations: number }
  | { status: "refused"; reasonCodes: ReasonCode[]; grantRef: string; remainingInvocations?: number }
  | { status: "indeterminate"; reasonCodes: ReasonCode[]; grantRef: string; remainingInvocations?: number };

export type LeaseConsumptionResult =
  | { status: "consumed"; receiptRef: string }
  | { status: "idempotent"; receiptRef: string }
  | { status: "refused"; reasonCodes: ReasonCode[] }
  | { status: "indeterminate"; reasonCodes: ReasonCode[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function grantOutputs(receipt: CanonicalReceipt): LeaseGrantOutputs | undefined {
  if (receipt.receiptType !== "LeaseGrant" || !isRecord(receipt.outputs)) return undefined;
  const output = receipt.outputs;
  if (
    typeof output.recipient !== "string" ||
    typeof output.capability !== "string" ||
    typeof output.scopeId !== "string" ||
    typeof output.purpose !== "string" ||
    !Number.isSafeInteger(output.invocationLimit) ||
    (output.invocationLimit as number) < 0 ||
    (output.validFrom !== undefined && typeof output.validFrom !== "string") ||
    (output.validUntil !== undefined && typeof output.validUntil !== "string")
  ) return undefined;
  return output as LeaseGrantOutputs;
}

function millis(value: string): number | undefined {
  try {
    validateTimestamp(value);
  } catch {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function refused(grantRef: string, reason: ReasonCode, remainingInvocations?: number): AuthorityEvaluation {
  return {
    status: "refused",
    reasonCodes: [reason],
    grantRef,
    ...(remainingInvocations === undefined ? {} : { remainingInvocations }),
  };
}

export function evaluateAuthority(
  graph: ReceiptGraph,
  grantRef: string,
  policy: DisclosurePolicy,
  request: AuthorityRequest,
): AuthorityEvaluation {
  const grant = graph.get(grantRef);
  if (!grant || grant.receiptType !== "LeaseGrant") return refused(grantRef, REASON_CODES.AUTHORITY_MISSING);

  const outputs = grantOutputs(grant);
  if (!outputs) return refused(grantRef, REASON_CODES.AUTHORITY_GRANT_INVALID);

  if (request.actor !== outputs.recipient) return refused(grantRef, REASON_CODES.AUTHORITY_RECIPIENT_MISMATCH);
  if (request.capability !== outputs.capability) return refused(grantRef, REASON_CODES.AUTHORITY_CAPABILITY_MISMATCH);
  if (request.scopeId !== outputs.scopeId) return refused(grantRef, REASON_CODES.AUTHORITY_SCOPE_MISMATCH);
  if (request.purpose !== outputs.purpose) return refused(grantRef, REASON_CODES.AUTHORITY_PURPOSE_MISMATCH);

  const evaluatedAt = millis(request.evaluatedAt);
  const validFrom = outputs.validFrom === undefined ? undefined : millis(outputs.validFrom);
  const validUntil = outputs.validUntil === undefined ? undefined : millis(outputs.validUntil);
  if (
    evaluatedAt === undefined ||
    (outputs.validFrom !== undefined && validFrom === undefined) ||
    (outputs.validUntil !== undefined && validUntil === undefined)
  ) return refused(grantRef, REASON_CODES.AUTHORITY_TIME_INVALID);
  if (validFrom !== undefined && evaluatedAt < validFrom) return refused(grantRef, REASON_CODES.AUTHORITY_NOT_YET_VALID);
  if (validUntil !== undefined && evaluatedAt >= validUntil) return refused(grantRef, REASON_CODES.AUTHORITY_EXPIRED);

  if (grant.authorityRef !== null) {
    const parentGrant = graph.get(grant.authorityRef);
    const parentOutputs = parentGrant ? grantOutputs(parentGrant) : undefined;
    if (!parentGrant || !parentOutputs || parentOutputs.recipient !== grant.issuer) {
      return refused(grantRef, REASON_CODES.AUTHORITY_LINEAGE_INVALID);
    }
  }

  const disclosureAllowed =
    grant.policyRefs.includes(policy.policyRef) &&
    policy.permittedScopes.includes(request.scopeId) &&
    policy.permittedPurposes.includes(request.purpose) &&
    (policy.permittedRecipients === undefined || policy.permittedRecipients.includes(request.actor)) &&
    policy.permittedDisclosures.includes(request.disclosure);
  if (!disclosureAllowed) return refused(grantRef, REASON_CODES.DISCLOSURE_NOT_PERMITTED);

  const used = graph.countConsumptions(grantRef);
  const remainingInvocations = Math.max(outputs.invocationLimit - used, 0);
  if (remainingInvocations === 0) return refused(grantRef, REASON_CODES.AUTHORITY_EXHAUSTED, 0);

  return { status: "permitted", reasonCodes: [], grantRef, remainingInvocations };
}

function consumptionReceipt(
  grantRef: string,
  policy: DisclosurePolicy,
  request: AuthorityRequest,
  subjectRef: string,
  issuer: string,
): CanonicalReceipt {
  return {
    receiptType: "LeaseConsumption",
    issuedAt: request.evaluatedAt,
    issuer,
    subject: subjectRef,
    inputs: {
      grantRef,
      actor: request.actor,
      evaluatedAt: request.evaluatedAt,
    },
    outputs: {
      grantRef,
      actor: request.actor,
      capability: request.capability,
      scopeId: request.scopeId,
      purpose: request.purpose,
    },
    authorityRef: grantRef,
    policyRefs: [policy.policyRef],
    previousReceiptRefs: [grantRef],
  };
}

export function recordLeaseConsumption(
  graph: ReceiptGraph,
  grantRef: string,
  policy: DisclosurePolicy,
  request: AuthorityRequest,
  subjectRef: string,
  issuer: string,
): LeaseConsumptionResult {
  if (issuer !== request.actor) {
    return { status: "refused", reasonCodes: [REASON_CODES.AUTHORITY_ISSUER_MISMATCH] };
  }

  const consumption = consumptionReceipt(grantRef, policy, request, subjectRef, issuer);
  const receiptRef = addressReceipt(consumption).address;
  if (graph.has(receiptRef)) return { status: "idempotent", receiptRef };

  const evaluation = evaluateAuthority(graph, grantRef, policy, request);
  if (evaluation.status !== "permitted") {
    return { status: evaluation.status, reasonCodes: evaluation.reasonCodes };
  }

  const appended = graph.append(consumption);
  if (appended.status === "refused") return { status: "refused", reasonCodes: appended.reasonCodes };
  if (appended.status === "idempotent") return { status: "idempotent", receiptRef: appended.receiptRef };
  return { status: "consumed", receiptRef: appended.receiptRef };
}
