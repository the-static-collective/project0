import assert from "node:assert/strict";
import test from "node:test";

import { address, type ArtifactAddress, type QuestionAddress } from "../src/historical-addresses.js";
import {
  AppendOnlyHistoricalStore,
  evaluateAdmission,
  evaluateAuthority,
  type ArtifactEnvelope,
  type AuthorityGrant,
  type AuthorityRevocation,
} from "../src/historical-kernel.js";

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-02-01T00:00:00.000Z";
const T3 = "2026-03-01T00:00:00.000Z";
const T4 = "2026-04-01T00:00:00.000Z";
const T5 = "2026-05-01T00:00:00.000Z";
const T6 = "2026-06-01T00:00:00.000Z";

function artifact(label: string): ArtifactAddress {
  return address.artifact({ label });
}

const purposeRef = artifact("P1");
const authorityBasisRef = artifact("authority-basis");
const grantAddress = artifact("A1");
const revocationAddress = artifact("R1");

const grant: AuthorityGrant = {
  address: grantAddress,
  issuerRef: "parent",
  holderRef: "caregiver",
  capabilities: ["create", "cite"],
  scopeRefs: ["meal-delivery"],
  purposeRefs: [purposeRef],
  questionRefs: [],
  validFrom: T1,
  authorityBasisRefs: [authorityBasisRef],
  delegable: false,
};

const revocation: AuthorityRevocation = {
  address: revocationAddress,
  authorityRef: grantAddress,
  effectiveAt: T2,
  observedAt: T5,
  revokedBy: "parent",
  authorityBasisRef,
};

const proposedUse = {
  capability: "create" as const,
  scopeRef: "meal-delivery",
  purposeRef,
};

test("three clocks preserve valid time, transaction time, and evaluation time", () => {
  const atCreation = evaluateAuthority({
    grant,
    revocations: [revocation],
    actTime: T1,
    transactionCutoff: T1,
    evaluationTime: T1,
    proposedUse,
  });
  assert.equal(atCreation.creationStatus, "valid");
  assert.equal(atCreation.currentStatus, "valid");

  const beforeKnowledge = evaluateAuthority({
    grant,
    revocations: [revocation],
    actTime: T1,
    transactionCutoff: T4,
    evaluationTime: T4,
    proposedUse,
  });
  assert.equal(beforeKnowledge.creationStatus, "valid");
  assert.equal(beforeKnowledge.systemBeliefAtCutoff, "valid");
  assert.equal(beforeKnowledge.currentStatus, "valid");

  const afterKnowledge = evaluateAuthority({
    grant,
    revocations: [revocation],
    actTime: T1,
    transactionCutoff: T6,
    evaluationTime: T6,
    proposedUse,
  });
  assert.equal(afterKnowledge.creationStatus, "valid");
  assert.equal(afterKnowledge.systemBeliefAtCutoff, "revoked");
  assert.equal(afterKnowledge.currentStatus, "revoked");
  assert.equal(afterKnowledge.currentUseStatus, "denied");
});

const admitted = evaluateAdmission({
  immutableReferent: true,
  appendOnly: true,
  addressClassesDistinct: true,
  authority: "pass",
  questionAddressed: true,
  unresolvedPreserved: true,
  disclosureAllowed: true,
  particularInteraction: true,
});

function envelope(input: {
  interaction: string;
  parentRefs?: ArtifactAddress[];
  questionRefs?: QuestionAddress[];
  visibility?: ArtifactEnvelope["visibility"];
  preservedAnchors?: string[];
  alteredAnchors?: string[];
}): ArtifactEnvelope {
  return {
    schemaVersion: "project0.historical-artifact.v0",
    contentRef: address.content("same bytes"),
    interactionRef: artifact(input.interaction),
    parentRefs: input.parentRefs ?? [],
    purposeRefs: [purposeRef],
    questionRefs: input.questionRefs ?? [],
    tensionRefs: [],
    authorityRefs: [grantAddress],
    witnessRefs: [],
    declaredAnchors: ["historical-validity"],
    preservedAnchors: input.preservedAnchors ?? ["historical-validity"],
    alteredAnchors: input.alteredAnchors ?? [],
    unresolvedTensionRefs: [],
    visibility: input.visibility ?? "metadata_public",
    createdAt: T1,
    createdBy: "caregiver",
  };
}

test("canonical trail keeps artifacts, questions, judgments, and views distinct", () => {
  const store = new AppendOnlyHistoricalStore();
  const q1 = address.question({ text: "Was the act authorized, and may it be disclosed now?", purposeRef });
  const x1 = store.createArtifact(envelope({ interaction: "delivery-interaction" }), admitted);
  const x2 = store.deriveArtifact(
    x1,
    envelope({ interaction: "derivation-interaction", parentRefs: [x1], preservedAnchors: ["historical-validity"] }),
    admitted,
  );

  const questionTrail = store.createTrail([q1], [q1]);
  const subjectTrail1 = store.createTrail([x1], [x1, x2, revocationAddress]);
  const d1 = store.issueDiscernmentReceipt(
    {
      questionRef: q1,
      subjectTrailRef: subjectTrail1,
      questionTrailRef: questionTrail,
      disposition: "supported",
      evidenceRefs: [x1, grantAddress],
      supersedesRefs: [],
      evaluatedAt: T5,
    },
    admitted,
  );

  const subjectTrail2 = store.createTrail([x1], [x1, x2, revocationAddress, d1]);
  const d2 = store.issueDiscernmentReceipt(
    {
      questionRef: q1,
      subjectTrailRef: subjectTrail2,
      questionTrailRef: questionTrail,
      disposition: "contradicted",
      evidenceRefs: [revocationAddress],
      supersedesRefs: [d1],
      evaluatedAt: T6,
    },
    admitted,
  );

  assert.notEqual(d1, d2);
  assert.equal(store.artifacts.has(x1), true);
  assert.equal(store.artifacts.has(x2), true);

  const view = store.pointView({ name: "current-authority-view" }, subjectTrail1);
  store.views.set(view, subjectTrail2);
  assert.equal(store.views.get(view), subjectTrail2);
  assert.equal(store.trails.has(subjectTrail1), true);
  assert.equal(store.trails.has(subjectTrail2), true);

  const sealed = store.resolveArtifact({ artifactRef: x1, mayDisclose: false });
  assert.equal(sealed.existence, "confirmed");
  assert.equal(sealed.representation, "metadata_only");

  const open = store.resolveArtifact({ artifactRef: x1, mayDisclose: true });
  assert.equal(open.representation, "full_content");
});

test("identical bytes do not merge distinct interaction residues", () => {
  const store = new AppendOnlyHistoricalStore();
  const first = store.createArtifact(envelope({ interaction: "interaction-one" }), admitted);
  const second = store.createArtifact(envelope({ interaction: "interaction-two" }), admitted);
  assert.notEqual(first, second);
});
