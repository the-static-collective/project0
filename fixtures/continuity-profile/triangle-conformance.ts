import { validateForCanonicalization } from "../../src/canonical-addressing";
import {
  validateContinuityClaim,
  type ContinuityClaimV0,
  type ContinuityDimension,
} from "../../src/continuity-profile";

export type TriangleConformanceResidual = {
  dimension: string;
  evidenceRefs: string[];
  note: string;
};

export type TriangleConformanceResult = {
  donor: "tranchnode" | "corpus-os";
  grammarGap: "NO_GAP" | "BOUNDED_GAP";
  claim: ContinuityClaimV0;
  residuals: TriangleConformanceResidual[];
};

type PlainRecord = Record<string, unknown>;

function record(value: unknown, label: string): PlainRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`TRIANGLE_INVALID_${label}`);
  }
  return value as PlainRecord;
}

function exactKeys(
  value: PlainRecord,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`TRIANGLE_UNKNOWN_FIELD:${key}`);
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`TRIANGLE_MISSING_FIELD:${key}`);
    }
  }
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`TRIANGLE_INVALID_${label}`);
  }
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) throw new Error(`TRIANGLE_INVALID_${label}`);
  const result = value.map((item) => nonEmptyString(item, label));
  if (new Set(result).size !== result.length) {
    throw new Error(`TRIANGLE_DUPLICATE_${label}`);
  }
  return result;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function dimension(
  name: string,
  refs: readonly string[],
  note?: string,
): ContinuityDimension | null {
  const evidenceRefs = sortedUnique(refs);
  if (evidenceRefs.length === 0) return null;
  return {
    dimension: name,
    evidenceRefs,
    ...(note === undefined ? {} : { note }),
  };
}

function compactDimensions(
  values: Array<ContinuityDimension | null>,
): ContinuityDimension[] {
  return values.filter((value): value is ContinuityDimension => value !== null);
}

type TranchWitness = {
  schema: "tranchnode/continuity-boundary-witness/v0.1";
  spineId: string;
  fromStageId: string;
  toStageId: string;
  originRef: string;
  presentRef: string;
  preserved: string[];
  differentiated: string[];
  lost: string[];
  unresolved: string[];
  completedTransferIds: string[];
  transitionWitnessRefs: string[];
  authority: "none";
  occurrenceClaim: "transition-witness-only";
};

function parseTranchWitness(value: unknown): TranchWitness {
  validateForCanonicalization(value);
  const source = record(value, "TRANCH_WITNESS");
  exactKeys(source, [
    "schema",
    "spineId",
    "fromStageId",
    "toStageId",
    "originRef",
    "presentRef",
    "preserved",
    "differentiated",
    "lost",
    "unresolved",
    "completedTransferIds",
    "transitionWitnessRefs",
    "authority",
    "occurrenceClaim",
  ]);

  if (source.schema !== "tranchnode/continuity-boundary-witness/v0.1") {
    throw new Error("TRIANGLE_TRANCH_SCHEMA_UNSUPPORTED");
  }
  if (source.authority !== "none") {
    throw new Error("TRIANGLE_TRANCH_AUTHORITY_WIDENING");
  }
  if (source.occurrenceClaim !== "transition-witness-only") {
    throw new Error("TRIANGLE_TRANCH_OCCURRENCE_WIDENING");
  }

  return {
    schema: source.schema,
    spineId: nonEmptyString(source.spineId, "SPINE_ID"),
    fromStageId: nonEmptyString(source.fromStageId, "FROM_STAGE_ID"),
    toStageId: nonEmptyString(source.toStageId, "TO_STAGE_ID"),
    originRef: nonEmptyString(source.originRef, "ORIGIN_REF"),
    presentRef: nonEmptyString(source.presentRef, "PRESENT_REF"),
    preserved: stringArray(source.preserved, "PRESERVED"),
    differentiated: stringArray(source.differentiated, "DIFFERENTIATED"),
    lost: stringArray(source.lost, "LOST"),
    unresolved: stringArray(source.unresolved, "UNRESOLVED"),
    completedTransferIds: stringArray(source.completedTransferIds, "TRANSFER_IDS"),
    transitionWitnessRefs: stringArray(source.transitionWitnessRefs, "TRANSITION_WITNESSES"),
    authority: source.authority,
    occurrenceClaim: source.occurrenceClaim,
  };
}

type CorpusTransform = {
  priorRef: string;
  currentRef: string;
  evidenceRef: string;
};

type CorpusLoss = {
  priorRef: string;
  evidenceRef: string;
};

type CorpusTerminal = {
  cause: {
    trustId: string;
    authorityCut: string;
    actorId: string;
    capacity: string;
    subjectRef: string;
    capabilityId: string;
    capabilityOperation: string;
    trustRequestId: string;
  };
  disposition: "session-refused" | "host-failed" | "completed";
  outputRefs: string[];
};

type CorpusOrphan = {
  ref: string;
  classification: "ORPHAN_OBSERVATION";
};

type CorpusAttestation = {
  schema: "corpus/continuity-attestation/v0.1";
  priorCutRef: string;
  currentCutRef: string;
  trustId: string;
  purpose: "corpus-worldcut-succession";
  preservedRefs: string[];
  transformed: CorpusTransform[];
  lost: CorpusLoss[];
  unresolvedRefs: string[];
  priorTerminalHistory: CorpusTerminal[];
  currentTerminalHistory: CorpusTerminal[];
  priorUnresolved: unknown[];
  currentUnresolved: unknown[];
  priorOrphanObservations: CorpusOrphan[];
  currentOrphanObservations: CorpusOrphan[];
  transitionEvidenceRefs: string[];
  authorityCutChange: {
    prior: string;
    current: string;
    changed: boolean;
  };
  authorityContinuity: "none" | "separately-evidenced" | "unresolved";
  authorityEvidenceRefs: string[];
  whyCurrent: {
    currentCutRef: string;
    authorityCut: string;
    constitutedRefs: string[];
    transitionEvidenceRefs: string[];
  };
  legalValidity: "unclaimed";
};

function parseTransforms(value: unknown): CorpusTransform[] {
  if (!Array.isArray(value)) throw new Error("TRIANGLE_INVALID_TRANSFORMS");
  return value.map((item) => {
    const edge = record(item, "TRANSFORM");
    exactKeys(edge, ["priorRef", "currentRef", "evidenceRef"]);
    return {
      priorRef: nonEmptyString(edge.priorRef, "TRANSFORM_PRIOR"),
      currentRef: nonEmptyString(edge.currentRef, "TRANSFORM_CURRENT"),
      evidenceRef: nonEmptyString(edge.evidenceRef, "TRANSFORM_EVIDENCE"),
    };
  });
}

function parseLosses(value: unknown): CorpusLoss[] {
  if (!Array.isArray(value)) throw new Error("TRIANGLE_INVALID_LOSSES");
  return value.map((item) => {
    const edge = record(item, "LOSS");
    exactKeys(edge, ["priorRef", "evidenceRef"]);
    return {
      priorRef: nonEmptyString(edge.priorRef, "LOSS_PRIOR"),
      evidenceRef: nonEmptyString(edge.evidenceRef, "LOSS_EVIDENCE"),
    };
  });
}

function parseTerminalHistory(value: unknown, label: string): CorpusTerminal[] {
  if (!Array.isArray(value)) throw new Error(`TRIANGLE_INVALID_${label}`);
  return value.map((item) => {
    const terminal = record(item, label);
    exactKeys(terminal, ["cause", "disposition", "outputRefs"]);
    const cause = record(terminal.cause, `${label}_CAUSE`);
    exactKeys(cause, [
      "trustId",
      "authorityCut",
      "actorId",
      "capacity",
      "subjectRef",
      "capabilityId",
      "capabilityOperation",
      "trustRequestId",
    ]);
    const disposition = terminal.disposition;
    if (
      disposition !== "session-refused"
      && disposition !== "host-failed"
      && disposition !== "completed"
    ) {
      throw new Error(`TRIANGLE_INVALID_${label}_DISPOSITION`);
    }
    return {
      cause: {
        trustId: nonEmptyString(cause.trustId, `${label}_TRUST_ID`),
        authorityCut: nonEmptyString(cause.authorityCut, `${label}_AUTHORITY_CUT`),
        actorId: nonEmptyString(cause.actorId, `${label}_ACTOR_ID`),
        capacity: nonEmptyString(cause.capacity, `${label}_CAPACITY`),
        subjectRef: nonEmptyString(cause.subjectRef, `${label}_SUBJECT_REF`),
        capabilityId: nonEmptyString(cause.capabilityId, `${label}_CAPABILITY_ID`),
        capabilityOperation: nonEmptyString(
          cause.capabilityOperation,
          `${label}_CAPABILITY_OPERATION`,
        ),
        trustRequestId: nonEmptyString(cause.trustRequestId, `${label}_REQUEST_ID`),
      },
      disposition,
      outputRefs: stringArray(terminal.outputRefs, `${label}_OUTPUT_REFS`),
    };
  });
}

function parseOrphans(value: unknown, label: string): CorpusOrphan[] {
  if (!Array.isArray(value)) throw new Error(`TRIANGLE_INVALID_${label}`);
  return value.map((item) => {
    const orphan = record(item, label);
    exactKeys(orphan, ["ref", "classification"]);
    if (orphan.classification !== "ORPHAN_OBSERVATION") {
      throw new Error(`TRIANGLE_INVALID_${label}_CLASSIFICATION`);
    }
    return {
      ref: nonEmptyString(orphan.ref, `${label}_REF`),
      classification: orphan.classification,
    };
  });
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  const a = sortedUnique(left);
  const b = sortedUnique(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function parseCorpusAttestation(value: unknown): CorpusAttestation {
  validateForCanonicalization(value);
  const source = record(value, "CORPUS_ATTESTATION");
  exactKeys(source, [
    "schema",
    "priorCutRef",
    "currentCutRef",
    "trustId",
    "purpose",
    "preservedRefs",
    "transformed",
    "lost",
    "unresolvedRefs",
    "priorTerminalHistory",
    "currentTerminalHistory",
    "priorUnresolved",
    "currentUnresolved",
    "priorOrphanObservations",
    "currentOrphanObservations",
    "transitionEvidenceRefs",
    "authorityCutChange",
    "authorityContinuity",
    "authorityEvidenceRefs",
    "whyCurrent",
    "legalValidity",
  ]);

  if (source.schema !== "corpus/continuity-attestation/v0.1") {
    throw new Error("TRIANGLE_CORPUS_SCHEMA_UNSUPPORTED");
  }
  if (source.purpose !== "corpus-worldcut-succession") {
    throw new Error("TRIANGLE_CORPUS_PURPOSE_UNSUPPORTED");
  }
  if (source.legalValidity !== "unclaimed") {
    throw new Error("TRIANGLE_CORPUS_LEGAL_VALIDITY_WIDENING");
  }

  const transformed = parseTransforms(source.transformed);
  const lost = parseLosses(source.lost);
  const transitionEvidenceRefs = stringArray(
    source.transitionEvidenceRefs,
    "TRANSITION_EVIDENCE_REFS",
  );
  const expectedTransitionRefs = [
    ...transformed.map((edge) => edge.evidenceRef),
    ...lost.map((edge) => edge.evidenceRef),
  ];
  if (!sameStringSet(transitionEvidenceRefs, expectedTransitionRefs)) {
    throw new Error("TRIANGLE_CORPUS_TRANSITION_EVIDENCE_MISMATCH");
  }

  if (!Array.isArray(source.priorUnresolved) || !Array.isArray(source.currentUnresolved)) {
    throw new Error("TRIANGLE_CORPUS_UNRESOLVED_EVIDENCE_INVALID");
  }

  const authorityCutChange = record(source.authorityCutChange, "AUTHORITY_CUT_CHANGE");
  exactKeys(authorityCutChange, ["prior", "current", "changed"]);
  const authorityPrior = nonEmptyString(authorityCutChange.prior, "AUTHORITY_PRIOR");
  const authorityCurrent = nonEmptyString(authorityCutChange.current, "AUTHORITY_CURRENT");
  if (typeof authorityCutChange.changed !== "boolean") {
    throw new Error("TRIANGLE_INVALID_AUTHORITY_CHANGED");
  }
  if (authorityCutChange.changed !== (authorityPrior !== authorityCurrent)) {
    throw new Error("TRIANGLE_AUTHORITY_CHANGE_MISMATCH");
  }

  const authorityContinuity = source.authorityContinuity;
  if (
    authorityContinuity !== "none"
    && authorityContinuity !== "separately-evidenced"
    && authorityContinuity !== "unresolved"
  ) {
    throw new Error("TRIANGLE_INVALID_AUTHORITY_CONTINUITY");
  }
  const authorityEvidenceRefs = stringArray(
    source.authorityEvidenceRefs,
    "AUTHORITY_EVIDENCE_REFS",
  );
  if (authorityContinuity === "separately-evidenced" && authorityEvidenceRefs.length === 0) {
    throw new Error("TRIANGLE_MISSING_AUTHORITY_EVIDENCE");
  }

  const whyCurrent = record(source.whyCurrent, "WHY_CURRENT");
  exactKeys(whyCurrent, [
    "currentCutRef",
    "authorityCut",
    "constitutedRefs",
    "transitionEvidenceRefs",
  ]);
  const currentCutRef = nonEmptyString(source.currentCutRef, "CURRENT_CUT_REF");
  const whyCurrentCutRef = nonEmptyString(whyCurrent.currentCutRef, "WHY_CURRENT_CUT_REF");
  if (whyCurrentCutRef !== currentCutRef) {
    throw new Error("TRIANGLE_CORPUS_CURRENT_CUT_MISMATCH");
  }
  const whyTransitionRefs = stringArray(
    whyCurrent.transitionEvidenceRefs,
    "WHY_CURRENT_TRANSITION_REFS",
  );
  if (!sameStringSet(whyTransitionRefs, transitionEvidenceRefs)) {
    throw new Error("TRIANGLE_CORPUS_WHY_CURRENT_EVIDENCE_MISMATCH");
  }

  return {
    schema: source.schema,
    priorCutRef: nonEmptyString(source.priorCutRef, "PRIOR_CUT_REF"),
    currentCutRef,
    trustId: nonEmptyString(source.trustId, "TRUST_ID"),
    purpose: source.purpose,
    preservedRefs: stringArray(source.preservedRefs, "PRESERVED_REFS"),
    transformed,
    lost,
    unresolvedRefs: stringArray(source.unresolvedRefs, "UNRESOLVED_REFS"),
    priorTerminalHistory: parseTerminalHistory(source.priorTerminalHistory, "PRIOR_TERMINAL"),
    currentTerminalHistory: parseTerminalHistory(source.currentTerminalHistory, "CURRENT_TERMINAL"),
    priorUnresolved: [...source.priorUnresolved],
    currentUnresolved: [...source.currentUnresolved],
    priorOrphanObservations: parseOrphans(source.priorOrphanObservations, "PRIOR_ORPHANS"),
    currentOrphanObservations: parseOrphans(source.currentOrphanObservations, "CURRENT_ORPHANS"),
    transitionEvidenceRefs,
    authorityCutChange: {
      prior: authorityPrior,
      current: authorityCurrent,
      changed: authorityCutChange.changed,
    },
    authorityContinuity,
    authorityEvidenceRefs,
    whyCurrent: {
      currentCutRef: whyCurrentCutRef,
      authorityCut: nonEmptyString(whyCurrent.authorityCut, "WHY_CURRENT_AUTHORITY_CUT"),
      constitutedRefs: stringArray(whyCurrent.constitutedRefs, "WHY_CURRENT_CONSTITUTED_REFS"),
      transitionEvidenceRefs: whyTransitionRefs,
    },
    legalValidity: source.legalValidity,
  };
}

function terminalDimensions(
  side: "prior" | "current",
  history: readonly CorpusTerminal[],
): ContinuityDimension[] {
  const byDisposition = new Map<CorpusTerminal["disposition"], string[]>();
  for (const entry of history) {
    const refs = byDisposition.get(entry.disposition) ?? [];
    refs.push(entry.cause.trustRequestId);
    byDisposition.set(entry.disposition, refs);
  }
  const order: CorpusTerminal["disposition"][] = [
    "session-refused",
    "completed",
    "host-failed",
  ];
  return order.flatMap((disposition) => {
    const refs = byDisposition.get(disposition) ?? [];
    const item = dimension(`corpus.terminal.${side}.${disposition}`, refs);
    return item === null ? [] : [item];
  });
}

export function mapTranchNodeBoundaryWitness(value: unknown): TriangleConformanceResult {
  const donor = parseTranchWitness(value);
  const contextRefs = sortedUnique([
    ...donor.transitionWitnessRefs,
    ...donor.completedTransferIds,
  ]);
  const laneDimensions = compactDimensions([
    dimension("tranchnode.preserved", donor.preserved),
    dimension("tranchnode.differentiated", donor.differentiated),
    dimension("tranchnode.lost", donor.lost),
    dimension("tranchnode.unresolved", donor.unresolved),
    dimension("tranchnode.transition-witness", donor.transitionWitnessRefs),
  ]);

  const claim: ContinuityClaimV0 = {
    schema: "p0.continuity/0.1",
    purpose: "tranchnode-boundary-continuity",
    subjectRef: donor.presentRef,
    ancestorRoots: [donor.originRef],
    environment: {
      policyRefs: [],
      contextRefs,
    },
    lanes: [
      {
        lane: "representation-story",
        mode: "transformed",
        dimensions: laneDimensions,
        transformationRefs: contextRefs,
        residualRefs: sortedUnique([...donor.lost, ...donor.unresolved]),
        uncertainty: sortedUnique(donor.unresolved),
        doesNotEstablish: ["authority"],
      },
    ],
    outputRefs: [donor.presentRef],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
  };

  validateContinuityClaim(claim);
  return {
    donor: "tranchnode",
    grammarGap: "NO_GAP",
    claim,
    residuals: [
      {
        dimension: "tranchnode.occurrence-boundary",
        evidenceRefs: sortedUnique(donor.transitionWitnessRefs),
        note: "Donor transition-witness-only occurrence remains continuation-only in Project0.",
      },
    ],
  };
}

export function mapCorpusContinuityAttestation(value: unknown): TriangleConformanceResult {
  const donor = parseCorpusAttestation(value);
  const transformed = [...donor.transformed].sort((a, b) => (
    a.priorRef < b.priorRef ? -1 : a.priorRef > b.priorRef ? 1 : 0
  ));
  const lost = [...donor.lost].sort((a, b) => (
    a.priorRef < b.priorRef ? -1 : a.priorRef > b.priorRef ? 1 : 0
  ));
  const priorOrphanRefs = donor.priorOrphanObservations.map((entry) => entry.ref);
  const currentOrphanRefs = donor.currentOrphanObservations.map((entry) => entry.ref);
  const authorityEvidence = donor.authorityEvidenceRefs.length > 0
    ? donor.authorityEvidenceRefs
    : [donor.currentCutRef];

  const laneDimensions = compactDimensions([
    dimension("corpus.preserved", donor.preservedRefs),
    ...transformed.map((edge) => dimension(
      `corpus.transformed:${edge.priorRef}`,
      [edge.priorRef, edge.currentRef, edge.evidenceRef],
      JSON.stringify({
        priorRef: edge.priorRef,
        currentRef: edge.currentRef,
        evidenceRef: edge.evidenceRef,
      }),
    )),
    ...lost.map((edge) => dimension(
      `corpus.lost:${edge.priorRef}`,
      [edge.priorRef, edge.evidenceRef],
      JSON.stringify({
        priorRef: edge.priorRef,
        evidenceRef: edge.evidenceRef,
      }),
    )),
    dimension("corpus.unresolved", donor.unresolvedRefs),
    ...terminalDimensions("prior", donor.priorTerminalHistory),
    ...terminalDimensions("current", donor.currentTerminalHistory),
    dimension("corpus.orphan.prior", priorOrphanRefs),
    dimension("corpus.orphan.current", currentOrphanRefs),
    dimension(
      "corpus.authority-cut-change",
      authorityEvidence,
      `${donor.authorityCutChange.prior}->${donor.authorityCutChange.current}; changed=${String(donor.authorityCutChange.changed)}`,
    ),
    dimension(
      "corpus.legal-validity-unclaimed",
      [donor.currentCutRef],
      "Corpus legal validity remains explicitly unclaimed.",
    ),
  ]);

  const claim: ContinuityClaimV0 = {
    schema: "p0.continuity/0.1",
    purpose: donor.purpose,
    subjectRef: donor.currentCutRef,
    ancestorRoots: [donor.priorCutRef],
    environment: {
      policyRefs: [],
      contextRefs: sortedUnique([
        ...donor.transitionEvidenceRefs,
        ...donor.authorityEvidenceRefs,
      ]),
    },
    lanes: [
      {
        lane: "representation-story",
        mode: "transformed",
        dimensions: laneDimensions,
        transformationRefs: sortedUnique(donor.transitionEvidenceRefs),
        residualRefs: sortedUnique([
          ...donor.lost.map((edge) => edge.priorRef),
          ...donor.unresolvedRefs,
          ...priorOrphanRefs,
          ...currentOrphanRefs,
        ]),
        uncertainty: sortedUnique(donor.unresolvedRefs),
        doesNotEstablish: ["authority"],
      },
    ],
    outputRefs: [donor.currentCutRef],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
  };

  validateContinuityClaim(claim);
  return {
    donor: "corpus-os",
    grammarGap: "NO_GAP",
    claim,
    residuals: [
      {
        dimension: "corpus.authority-continuity-local",
        evidenceRefs: sortedUnique(authorityEvidence),
        note: `Donor authority continuity remains inert: ${donor.authorityContinuity}.`,
      },
    ],
  };
}
