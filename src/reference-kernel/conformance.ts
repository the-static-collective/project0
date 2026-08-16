import { evaluateMaterial } from "./admission.js";
import { evaluateAuthority, recordLeaseConsumption } from "./authority.js";
import { REASON_CODES } from "./reason-codes.js";
import { ReceiptGraph } from "./receipt-graph.js";
import type { AuthorityRequest, CanonicalNode, CanonicalReceipt, DisclosurePolicy } from "./types.js";
import { addressNode, addressReceipt } from "./validate.js";

export type ConformanceResult = {
  fixtureId: string;
  invariantIds: string[];
  status: "pass" | "fail" | "unsupported";
  reasonCodes: string[];
  evidenceRefs: string[];
};

const policy: DisclosurePolicy = {
  policyRef: "policy:public",
  permittedScopes: ["scope:public"],
  permittedPurposes: ["publish-test"],
  permittedRecipients: ["human:lu"],
  permittedDisclosures: ["public"],
};

const request = (overrides: Partial<AuthorityRequest> = {}): AuthorityRequest => ({
  actor: "human:lu",
  capability: "publish",
  scopeId: "scope:public",
  purpose: "publish-test",
  disclosure: "public",
  evaluatedAt: "2026-08-16T12:00:00Z",
  ...overrides,
});

const grant = (invocationLimit = 2): CanonicalReceipt => ({
  receiptType: "LeaseGrant",
  issuedAt: "2026-08-16T11:00:00Z",
  issuer: "authority:root",
  subject: "scope:public",
  inputs: {},
  outputs: {
    recipient: "human:lu",
    capability: "publish",
    scopeId: "scope:public",
    purpose: "publish-test",
    invocationLimit,
    validFrom: "2026-08-16T11:00:00Z",
    validUntil: "2026-08-17T11:00:00Z",
  },
  authorityRef: null,
  policyRefs: ["policy:public"],
  previousReceiptRefs: [],
});

function seedGrant(invocationLimit = 2): { graph: ReceiptGraph; grantRef: string } {
  const graph = new ReceiptGraph();
  const value = grant(invocationLimit);
  const grantRef = addressReceipt(value).address;
  graph.append(value);
  return { graph, grantRef };
}

function failure(fixtureId: string, invariantIds: string[], reasonCodes: string[], evidenceRefs: string[] = []): ConformanceResult {
  return { fixtureId, invariantIds, status: "fail", reasonCodes, evidenceRefs };
}

function stableNodeIdentity(): ConformanceResult {
  const fixtureId = "stable-node-identity";
  const invariantIds = ["P0-I4", "P0-I18"];
  try {
    const node: CanonicalNode = {
      kind: "claim",
      body: { text: "same payload" },
      createdAt: "2026-08-16T10:00:00Z",
      createdBy: "human:lu",
      provenance: ["node-parent"],
      disclosure: "public",
      relationships: [],
    };
    const first = addressNode(node);
    const repeated = addressNode(structuredClone(node));
    const distinct = addressNode({ ...node, disclosure: "private" });
    const passed = first.address === repeated.address && first.digestHex === repeated.digestHex && first.address !== distinct.address;
    return passed
      ? { fixtureId, invariantIds, status: "pass", reasonCodes: [], evidenceRefs: [first.address, distinct.address] }
      : failure(fixtureId, invariantIds, ["IDENTITY_MISMATCH"], [first.address, distinct.address]);
  } catch (error) {
    return failure(fixtureId, invariantIds, [error instanceof Error ? error.message : "IDENTITY_CHECK_FAILED"]);
  }
}

function receiptRoundTrip(): ConformanceResult {
  const fixtureId = "receipt-round-trip";
  const invariantIds = ["P0-I14", "P0-I18"];
  const graph = new ReceiptGraph();
  const receipt: CanonicalReceipt = {
    receiptType: "WitnessReceipt",
    issuedAt: "2026-08-16T10:10:00Z",
    issuer: "human:lu",
    subject: "node-root",
    inputs: {},
    outputs: { observed: true },
    authorityRef: null,
    policyRefs: ["policy:public"],
    previousReceiptRefs: [],
  };
  const receiptRef = addressReceipt(receipt).address;
  const appended = graph.append(receipt);
  const recovered = graph.get(receiptRef);
  const passed = appended.status === "appended" && JSON.stringify(recovered) === JSON.stringify(receipt);
  return passed
    ? { fixtureId, invariantIds, status: "pass", reasonCodes: [], evidenceRefs: [receiptRef] }
    : failure(fixtureId, invariantIds, appended.status === "refused" ? appended.reasonCodes : ["RECEIPT_ROUND_TRIP_FAILED"], [receiptRef]);
}

function authorityValidUse(): ConformanceResult {
  const fixtureId = "authority-valid-use";
  const invariantIds = ["P0-I6", "P0-I7", "P0-I18"];
  const { graph, grantRef } = seedGrant();
  const evaluated = evaluateAuthority(graph, grantRef, policy, request());
  return evaluated.status === "permitted"
    ? { fixtureId, invariantIds, status: "pass", reasonCodes: [], evidenceRefs: [grantRef] }
    : failure(fixtureId, invariantIds, evaluated.reasonCodes, [grantRef]);
}

function authorityScopeRefusal(): ConformanceResult {
  const fixtureId = "authority-scope-refusal";
  const invariantIds = ["P0-I7", "P0-I9"];
  const { graph, grantRef } = seedGrant();
  const evaluated = evaluateAuthority(graph, grantRef, policy, request({ scopeId: "scope:private" }));
  const passed = evaluated.status === "refused" && evaluated.reasonCodes.length === 1 && evaluated.reasonCodes[0] === REASON_CODES.AUTHORITY_SCOPE_MISMATCH;
  return passed
    ? { fixtureId, invariantIds, status: "pass", reasonCodes: [...evaluated.reasonCodes], evidenceRefs: [grantRef] }
    : failure(fixtureId, invariantIds, evaluated.reasonCodes.length ? evaluated.reasonCodes : ["EXPECTED_SCOPE_REFUSAL"], [grantRef]);
}

function authorityExhaustion(): ConformanceResult {
  const fixtureId = "authority-exhaustion";
  const invariantIds = ["P0-I7", "P0-I14"];
  const { graph, grantRef } = seedGrant(1);
  const consumed = recordLeaseConsumption(graph, grantRef, policy, request(), "act:one", "human:lu");
  if (consumed.status !== "consumed") return failure(fixtureId, invariantIds, consumed.reasonCodes, [grantRef]);
  const exhausted = evaluateAuthority(graph, grantRef, policy, request({ evaluatedAt: "2026-08-16T12:01:00Z" }));
  const passed = exhausted.status === "refused" && exhausted.reasonCodes.length === 1 && exhausted.reasonCodes[0] === REASON_CODES.AUTHORITY_EXHAUSTED;
  return passed
    ? { fixtureId, invariantIds, status: "pass", reasonCodes: [...exhausted.reasonCodes], evidenceRefs: [grantRef, consumed.receiptRef] }
    : failure(fixtureId, invariantIds, exhausted.reasonCodes.length ? exhausted.reasonCodes : ["EXPECTED_EXHAUSTION"], [grantRef, consumed.receiptRef]);
}

function admissionOrthogonality(): ConformanceResult {
  const fixtureId = "admission-orthogonality";
  const invariantIds = ["P0-I11", "P0-I20"];
  const { graph, grantRef } = seedGrant();
  const authority = evaluateAuthority(graph, grantRef, policy, request());
  if (authority.status !== "permitted") return failure(fixtureId, invariantIds, authority.reasonCodes, [grantRef]);
  const admissionInput = {
    authority,
    provenance: { status: "valid" as const, reasonCodes: [] as [] },
    disclosureAllowed: true as const,
  };
  const disputed = evaluateMaterial({ admissionInput, epistemicDisposition: "disputed" });
  const unevaluated = evaluateMaterial({ admissionInput, epistemicDisposition: "not_evaluated" });
  const passed =
    disputed.admission.status === "admitted" &&
    unevaluated.admission.status === "admitted" &&
    JSON.stringify(disputed.admission) === JSON.stringify(unevaluated.admission) &&
    disputed.epistemicDisposition !== unevaluated.epistemicDisposition;
  return passed
    ? { fixtureId, invariantIds, status: "pass", reasonCodes: [], evidenceRefs: [grantRef] }
    : failure(fixtureId, invariantIds, ["ADMISSION_DISPOSITION_COUPLED"], [grantRef]);
}

const unsupported = (fixtureId: string, invariantIds: string[]): ConformanceResult => ({
  fixtureId,
  invariantIds,
  status: "unsupported",
  reasonCodes: [REASON_CODES.UNSUPPORTED_CHECK],
  evidenceRefs: [],
});

export function runConformance(): ConformanceResult[] {
  return [
    stableNodeIdentity(),
    receiptRoundTrip(),
    authorityValidUse(),
    authorityScopeRefusal(),
    authorityExhaustion(),
    admissionOrthogonality(),
    unsupported("sealed-plurality-round-trip", ["P0-I3", "P0-I5"]),
    unsupported("repair-scar-round-trip", ["P0-I5", "P0-I14"]),
    unsupported("monument-build-beside", ["P0-I1", "P0-I3"]),
  ];
}

export function renderConformance(results: readonly ConformanceResult[]): string {
  return results.map((result) => {
    const status = result.status.toUpperCase().padEnd(12);
    const invariants = result.invariantIds.join(",");
    const reasons = result.reasonCodes.length ? ` reasons=${result.reasonCodes.join(",")}` : "";
    const evidence = result.evidenceRefs.length ? ` evidence=${result.evidenceRefs.join(",")}` : "";
    return `${status} ${invariants} ${result.fixtureId}${reasons}${evidence}`;
  }).join("\n");
}

export function conformanceExitCode(results: readonly ConformanceResult[]): 0 | 1 {
  return results.some((result) => result.status === "fail") ? 1 : 0;
}
