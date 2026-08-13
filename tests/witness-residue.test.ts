import assert from "node:assert/strict";
import test from "node:test";
import { address } from "../src/historical-addresses.js";
import { WitnessResidueStore, replay, type ExternalVerification } from "../src/witness-residue.js";

const observed = (name: string) => address.artifact({ clock: name });
const grant = { grantRef: "grant-1", checkerRef: "checker-1", proofSystems: ["ps"], policyRefs: ["policy"], validFrom: "2026-01-01T00:00:00Z" };
const verification: ExternalVerification = { envelopeRef: "verification-1", checkerRef: "checker-1", grantRef: "grant-1", issuedAt: "2026-02-01T00:00:00Z", proofSystem: "ps", policyRef: "policy", candidateRef: "candidate", propositionRef: "proposition", subjectReceiptRef: "receipt", checkerInputHash: "input-hash", checkerResult: "verified", signatureVerificationRef: "signature-check-1" };
const request = { verificationEnvelopeRef: verification.envelopeRef, candidateRef: "candidate", propositionRef: "proposition", policyRef: "policy", subjectReceiptRef: "receipt", checkerInputHash: "input-hash", baseReceiptRef: "base", observedAtRef: observed("attach") };

test("logical refusal is durable and admission remains distinct from assurance", () => {
  const store = new WitnessResidueStore();
  const result = store.recordAdmission({ completeConfirmatoryEvidence: false, assurance: "unassessed", observedAtRef: observed("admission") });
  assert.equal(result.status, "appended");
  const projection = store.project(); assert.equal(projection.status, "ok");
  if (projection.status === "ok") assert.equal(projection.projection.byType.ADMISSION_REFUSED.length, 1);
});

test("malformed encounter cites raw bytes without canonicalizing invalid payload", () => {
  const store = new WitnessResidueStore();
  const result = store.ingest(Buffer.from("wire"), { nested: undefined }, "seal", observed("malformed"));
  assert.equal(result.status, "appended");
  const snapshot = store.snapshot();
  assert.equal(snapshot[0].envelope.residueType, "MALFORMED_INPUT_REJECTED");
  assert.match(JSON.stringify(snapshot[0].payload), /content:sha256/);
  assert.match(JSON.stringify(snapshot[0].payload), /UNDEFINED_VALUE/);
});

test("expected-head race has one winner and never forks history", () => {
  const store = new WitnessResidueStore(); const head = store.head;
  const first = store.append({ residueType: "PLAN_SEALED", observedAtRef: observed("one"), payload: { n: 1 } }, head);
  const second = store.append({ residueType: "PLAN_SEALED", observedAtRef: observed("two"), payload: { n: 2 } }, head);
  assert.equal(first.status, "appended"); assert.equal(second.status, "conflict"); assert.equal(store.head.sequence, 1);
});

test("fresh replay through head equals live projection and rejects corrupt history", () => {
  const store = new WitnessResidueStore(); store.recordAdmission({ completeConfirmatoryEvidence: false, assurance: "none", observedAtRef: observed("a") });
  assert.deepEqual(replay(store.snapshot(), store.head), store.project());
  const corrupted = structuredClone(store.snapshot()) as any[]; corrupted[0].envelope.sequence = 2;
  assert.deepEqual(replay(corrupted, store.head), { status: "indeterminate", codes: ["SEQUENCE_GAP", "BAD_RESIDUE_ADDRESS"] });
});

test("later checker revocation does not leak backward through causal cut", () => {
  const store = new WitnessResidueStore();
  store.append({ residueType: "CHECKER_AUTHORITY_GRANTED", observedAtRef: observed("grant"), payload: grant }, store.head);
  const beforeRevocation = store.head;
  store.append({ residueType: "CHECKER_AUTHORITY_REVOKED", observedAtRef: observed("revocation-observed"), effectiveAtRef: observed("revocation-effective"), payload: { grantRef: grant.grantRef } }, store.head);
  const before = store.project(beforeRevocation); const after = store.project();
  assert.equal(before.status, "ok"); assert.equal(after.status, "ok");
  if (before.status === "ok" && after.status === "ok") { assert.deepEqual(before.projection.revokedGrantRefs, []); assert.deepEqual(after.projection.revokedGrantRefs, [grant.grantRef]); }
});

for (const [name, change, code] of [
  ["unauthorized checker", { verificationEnvelopeRef: "missing" }, "VERIFICATION_NOT_IMPORTED"],
  ["candidate mismatch", { candidateRef: "other" }, "CANDIDATE_MISMATCH"],
  ["proposition mismatch", { propositionRef: "other" }, "PROPOSITION_MISMATCH"],
  ["input hash mismatch", { checkerInputHash: "other" }, "INPUT_HASH_MISMATCH"],
] as const) test(`attachment refusal: ${name}`, () => {
  const store = readyStore(); const result = store.attachProof({ ...request, ...change });
  assert.equal(result.status, "appended"); if (result.status === "appended") assert.equal(result.residue.residueType, "PROOF_ATTACHMENT_REFUSED");
  const snapshot = store.snapshot(); assert.match(JSON.stringify(snapshot[snapshot.length - 1]?.payload), new RegExp(code));
});

test("authorized checker rejection remains a verification outcome, not a fabricated verification", () => {
  const store = new WitnessResidueStore(); store.append({ residueType: "CHECKER_AUTHORITY_GRANTED", observedAtRef: observed("grant"), payload: grant }, store.head);
  store.importExternalVerification({ ...verification, checkerResult: "rejected" }, observed("import"));
  const result = store.attachProof(request); assert.equal(result.status, "appended");
  const snapshot = store.snapshot(); assert.match(JSON.stringify(snapshot[snapshot.length - 1]?.payload), /CHECKER_RESULT_NOT_VERIFIED/);
  assert.match(JSON.stringify(snapshot[snapshot.length - 1]?.payload), /rejected/);
});

test("derived receipt is reconstructible and cites base receipt", () => {
  const store = readyStore(); const result = store.attachProof(request); assert.equal(result.status, "appended");
  const snapshot = store.snapshot(); const payload = snapshot[snapshot.length - 1]?.payload as any; assert.equal(payload.artifact.derivedFromBaseReceiptRef, "base");
  assert.deepEqual(store.getDerived(payload.derivedRef), payload.artifact); assert.equal(address.artifact(payload.artifact), payload.derivedRef);
});

test("public API cannot create a verified checker conclusion", () => {
  const methods = Object.getOwnPropertyNames(WitnessResidueStore.prototype);
  assert.deepEqual(methods.filter((name) => /verify/i.test(name)), []);
});

test("evidence-use history is derived only from replay", () => {
  const store = new WitnessResidueStore(); store.recordEvidenceUse("evidence", observed("use-1")); store.recordEvidenceUse("evidence", observed("use-2"));
  const payloads = store.snapshot().map((item) => item.payload as any); assert.deepEqual(payloads.map((item) => item.priorUseCount), [0, 1]);
});

function readyStore(): WitnessResidueStore {
  const store = new WitnessResidueStore(); store.append({ residueType: "CHECKER_AUTHORITY_GRANTED", observedAtRef: observed("grant"), payload: grant }, store.head); store.importExternalVerification(verification, observed("import")); return store;
}
