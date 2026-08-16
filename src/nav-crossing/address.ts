import { canonicalizeDomainValue } from "../canonical-addressing/index";
import { compareFrameDeclarations } from "./compare";
import type {
  CrossingDeclaration,
  FrameSnapshot,
  NavCrossingReceipt,
  NavRecordRef,
  NavRecordType,
} from "./types";
import {
  validateCrossingDeclaration,
  validateFrameSnapshot,
  validateNavCrossingReceipt,
} from "./validate";

export const NAV_DOMAIN_PREFIX = "Project0-NAV-v0.1|";

export type AddressedNavRecord<T> = {
  ref: NavRecordRef;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: NavRecordType;
  body: T;
};

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeFrameSnapshot(frame: FrameSnapshot): FrameSnapshot {
  return {
    frameRef: frame.frameRef,
    constitutionRef: frame.constitutionRef,
    authorityRefs: sortedUnique(frame.authorityRefs),
    decoderRef: frame.decoderRef,
    evidenceRefs: sortedUnique(frame.evidenceRefs),
    participantRef: frame.participantRef,
    particularityAnchors: Object.fromEntries(
      Object.entries(frame.particularityAnchors).sort(([left], [right]) => left.localeCompare(right)),
    ),
  };
}

function normalizeCrossingDeclaration(crossing: CrossingDeclaration): CrossingDeclaration {
  return {
    crossingRef: crossing.crossingRef,
    kind: crossing.kind,
    declaredPurpose: crossing.declaredPurpose,
    evidenceRefs: sortedUnique(crossing.evidenceRefs),
  };
}

function normalizeNavBody<T>(recordType: NavRecordType, body: T): T {
  if (recordType === "frame_snapshot") {
    validateFrameSnapshot(body);
    return normalizeFrameSnapshot(body) as T;
  }
  if (recordType === "crossing_declaration") {
    validateCrossingDeclaration(body);
    return normalizeCrossingDeclaration(body) as T;
  }
  validateNavCrossingReceipt(body);
  return body;
}

export function addressNavRecord<T>(recordType: NavRecordType, body: T): AddressedNavRecord<T> {
  const normalizedBody = normalizeNavBody(recordType, body);
  const addressed = canonicalizeDomainValue(NAV_DOMAIN_PREFIX, {
    recordType,
    body: normalizedBody,
  });

  return {
    ref: `nav-${addressed.digestHex}`,
    digestHex: addressed.digestHex,
    canonicalBytes: addressed.canonicalBytes,
    recordType,
    body: normalizedBody,
  };
}

export function createNavCrossingReceipt(
  beforeInput: FrameSnapshot,
  crossingInput: CrossingDeclaration,
  afterInput: FrameSnapshot,
) {
  const before = addressNavRecord("frame_snapshot", beforeInput);
  const crossing = addressNavRecord("crossing_declaration", crossingInput);
  const after = addressNavRecord("frame_snapshot", afterInput);
  const comparison = compareFrameDeclarations(before.body, crossing.body, after.body);

  const receiptBody: NavCrossingReceipt = {
    beforeSnapshotRef: before.ref,
    crossingDeclarationRef: crossing.ref,
    afterSnapshotRef: after.ref,
    observations: comparison.observations,
    crossingStatus: comparison.crossingStatus,
  };

  const receipt = addressNavRecord("crossing_receipt", receiptBody);
  return { before, crossing, after, receipt };
}
