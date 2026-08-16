export const CROSSING_KINDS = [
  "document_open",
  "analogy",
  "memory_return",
  "translation",
  "room_crossing",
  "other",
] as const;

export type CrossingKind = typeof CROSSING_KINDS[number];

export type FrameSnapshot = {
  frameRef: string;
  constitutionRef: string | null;
  authorityRefs: string[];
  decoderRef: string | null;
  evidenceRefs: string[];
  participantRef: string | null;
  particularityAnchors: Record<string, string | null>;
};

export type CrossingDeclaration = {
  crossingRef: string;
  kind: CrossingKind;
  declaredPurpose: string;
  evidenceRefs: string[];
};

export type DifferenceDisposition =
  | "preserved"
  | "changed"
  | "absent_after"
  | "new_after"
  | "indeterminate";

export type DifferenceObservation = {
  dimension: string;
  disposition: DifferenceDisposition;
  beforeRefs: string[];
  afterRefs: string[];
  evidenceRefs: string[];
};

export type CrossingStatus =
  | "no_material_difference_observed"
  | "materially_changed"
  | "indeterminate";

export type NavRecordType =
  | "frame_snapshot"
  | "crossing_declaration"
  | "crossing_receipt";

export type NavRecordRef = string;

export type NavCrossingReceipt = {
  beforeSnapshotRef: NavRecordRef;
  crossingDeclarationRef: NavRecordRef;
  afterSnapshotRef: NavRecordRef;
  observations: DifferenceObservation[];
  crossingStatus: CrossingStatus;
};
