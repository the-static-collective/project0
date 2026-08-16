import type {
  CrossingDeclaration,
  CrossingStatus,
  DifferenceDisposition,
  DifferenceObservation,
  FrameSnapshot,
} from "./types";
import { validateCrossingDeclaration, validateFrameSnapshot } from "./validate";

export type UnaddressedNavCrossingReceipt = {
  observations: DifferenceObservation[];
  crossingStatus: CrossingStatus;
};

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function scalarDisposition(before: string | null, after: string | null): DifferenceDisposition {
  if (before === null && after === null) return "indeterminate";
  if (before === null) return "new_after";
  if (after === null) return "absent_after";
  return before === after ? "preserved" : "changed";
}

function setDisposition(before: readonly string[], after: readonly string[]): DifferenceDisposition {
  if (sameStrings(before, after)) return "preserved";
  if (before.length > 0 && after.length === 0) return "absent_after";
  if (before.length === 0 && after.length > 0) return "new_after";
  return "changed";
}

function particularityDisposition(
  beforeDeclared: boolean,
  beforeRef: string | null,
  afterDeclared: boolean,
  afterRef: string | null,
): DifferenceDisposition {
  if (!beforeDeclared && afterDeclared && afterRef !== null) return "new_after";
  if (beforeDeclared && beforeRef !== null && !afterDeclared) return "absent_after";
  if (!beforeDeclared && afterDeclared && afterRef === null) return "indeterminate";
  if (beforeDeclared && beforeRef === null && !afterDeclared) return "indeterminate";
  return scalarDisposition(beforeRef, afterRef);
}

function observation(
  dimension: string,
  disposition: DifferenceDisposition,
  beforeRefs: string[],
  afterRefs: string[],
  evidenceRefs: string[],
): DifferenceObservation {
  return { dimension, disposition, beforeRefs, afterRefs, evidenceRefs };
}

function scalarObservation(
  dimension: string,
  before: string | null,
  after: string | null,
  evidenceRefs: string[],
): DifferenceObservation {
  return observation(
    dimension,
    scalarDisposition(before, after),
    before === null ? [] : [before],
    after === null ? [] : [after],
    evidenceRefs,
  );
}

function deriveCrossingStatus(observations: readonly DifferenceObservation[]): CrossingStatus {
  if (observations.some((item) =>
    item.disposition === "changed" ||
    item.disposition === "absent_after" ||
    item.disposition === "new_after"
  )) return "materially_changed";

  if (observations.some((item) => item.disposition === "indeterminate")) {
    return "indeterminate";
  }

  return "no_material_difference_observed";
}

export function compareFrameDeclarations(
  before: FrameSnapshot,
  crossing: CrossingDeclaration,
  after: FrameSnapshot,
): UnaddressedNavCrossingReceipt {
  validateFrameSnapshot(before);
  validateCrossingDeclaration(crossing);
  validateFrameSnapshot(after);

  const crossingEvidence = sortedUnique(crossing.evidenceRefs);
  const beforeAuthority = sortedUnique(before.authorityRefs);
  const afterAuthority = sortedUnique(after.authorityRefs);
  const beforeEvidence = sortedUnique(before.evidenceRefs);
  const afterEvidence = sortedUnique(after.evidenceRefs);

  const observations: DifferenceObservation[] = [
    observation(
      "frame",
      before.frameRef === after.frameRef ? "preserved" : "changed",
      [before.frameRef],
      [after.frameRef],
      crossingEvidence,
    ),
    scalarObservation("constitution", before.constitutionRef, after.constitutionRef, crossingEvidence),
    observation(
      "authority",
      setDisposition(beforeAuthority, afterAuthority),
      beforeAuthority,
      afterAuthority,
      crossingEvidence,
    ),
    scalarObservation("decoder", before.decoderRef, after.decoderRef, crossingEvidence),
    observation(
      "evidence",
      setDisposition(beforeEvidence, afterEvidence),
      beforeEvidence,
      afterEvidence,
      crossingEvidence,
    ),
    scalarObservation("participant", before.participantRef, after.participantRef, crossingEvidence),
  ];

  const anchorKeys = [...new Set([
    ...Object.keys(before.particularityAnchors),
    ...Object.keys(after.particularityAnchors),
  ])].sort();

  for (const key of anchorKeys) {
    const beforeDeclared = Object.prototype.hasOwnProperty.call(before.particularityAnchors, key);
    const afterDeclared = Object.prototype.hasOwnProperty.call(after.particularityAnchors, key);
    const beforeRef = beforeDeclared ? before.particularityAnchors[key] : null;
    const afterRef = afterDeclared ? after.particularityAnchors[key] : null;
    observations.push(observation(
      `particularity:${key}`,
      particularityDisposition(beforeDeclared, beforeRef, afterDeclared, afterRef),
      beforeRef === null ? [] : [beforeRef],
      afterRef === null ? [] : [afterRef],
      crossingEvidence,
    ));
  }

  return {
    observations,
    crossingStatus: deriveCrossingStatus(observations),
  };
}
