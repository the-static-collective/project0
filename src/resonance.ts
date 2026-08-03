export type ArtifactRef = string;

export type MotifPosition =
  | "source"
  | "transformation"
  | "tension"
  | "response"
  | "anchor_state"
  | "recognition";

export type MotifState =
  | "open"
  | "provisionally_closed"
  | "recognized_closed"
  | "rejected_closed"
  | "abandoned";

export type RuptureIntent =
  | "intentional_cut"
  | "experimental_cut"
  | "accidental_loss"
  | "unknown";

export type RecognitionDisposition =
  | "belongs"
  | "does_not_belong"
  | "uncertain"
  | "novel_but_continuous";

export interface AnchorTransition {
  readonly anchor: ArtifactRef;
  readonly outcome: "preserved" | "broken" | "transfigured";
  readonly successorAnchor?: ArtifactRef;
  readonly evidence: readonly ArtifactRef[];
}

export interface Recognition {
  readonly disposition: RecognitionDisposition;
  readonly receipt: ArtifactRef;
  readonly statedReasons: readonly ArtifactRef[];
}

export interface SuccessorSource {
  readonly artifact: ArtifactRef;
  readonly derivedFromSource: ArtifactRef;
  readonly informedByRecognition: ArtifactRef;
}

export interface ResonanceMotif {
  readonly schemaVersion: "0.1";
  readonly revision: number;
  readonly state: MotifState;
  readonly positions: Readonly<Partial<Record<MotifPosition, readonly ArtifactRef[]>>>;
  readonly relations: readonly ArtifactRef[];
  readonly ruptureIntent?: RuptureIntent;
  readonly attractors: readonly ArtifactRef[];
  readonly anchorTransitions: readonly AnchorTransition[];
  readonly recognition?: Recognition;
  readonly predecessorMotifs: readonly ArtifactRef[];
  readonly successorSource?: SuccessorSource;
}

export interface TransitionReceipt {
  readonly operation: "openMotif" | "attachPosition" | "proposeClosure" | "recognizeClosure";
  readonly previousRevision: number | null;
  readonly nextRevision: number;
}

export interface TransitionResult {
  readonly motif: ResonanceMotif;
  readonly receipt: TransitionReceipt;
}

const requiredPositions: readonly MotifPosition[] = [
  "source",
  "transformation",
  "tension",
  "response",
  "anchor_state",
  "recognition"
];

function refs(values: readonly ArtifactRef[]): readonly ArtifactRef[] {
  const cleaned = values.map((value) => value.trim());
  if (cleaned.some((value) => value.length === 0)) throw new Error("Artifact references must be non-empty");
  return Object.freeze([...new Set(cleaned)]);
}

function next(motif: ResonanceMotif, patch: Partial<ResonanceMotif>): ResonanceMotif {
  if (motif.state === "recognized_closed" || motif.state === "rejected_closed" || motif.state === "abandoned") {
    throw new Error(`Cannot mutate terminal motif state: ${motif.state}`);
  }
  return Object.freeze({ ...motif, ...patch, revision: motif.revision + 1 });
}

export function openMotif(input: {
  source: ArtifactRef;
  ruptureIntent?: RuptureIntent;
  attractors?: readonly ArtifactRef[];
  predecessorMotifs?: readonly ArtifactRef[];
}): TransitionResult {
  const motif: ResonanceMotif = Object.freeze({
    schemaVersion: "0.1",
    revision: 0,
    state: "open",
    positions: Object.freeze({ source: refs([input.source]) }),
    relations: Object.freeze([]),
    ...(input.ruptureIntent === undefined ? {} : { ruptureIntent: input.ruptureIntent }),
    attractors: refs(input.attractors ?? []),
    anchorTransitions: Object.freeze([]),
    predecessorMotifs: refs(input.predecessorMotifs ?? [])
  });
  return { motif, receipt: { operation: "openMotif", previousRevision: null, nextRevision: 0 } };
}

export function attachPosition(
  motif: ResonanceMotif,
  position: Exclude<MotifPosition, "recognition">,
  artifacts: readonly ArtifactRef[],
  relationRefs: readonly ArtifactRef[] = []
): TransitionResult {
  if (position === "source" && motif.positions.source) throw new Error("Source position is immutable");
  const updated = next(motif, {
    positions: Object.freeze({ ...motif.positions, [position]: refs(artifacts) }),
    relations: refs([...motif.relations, ...relationRefs])
  });
  return { motif: updated, receipt: { operation: "attachPosition", previousRevision: motif.revision, nextRevision: updated.revision } };
}

export function proposeClosure(
  motif: ResonanceMotif,
  anchorTransitions: readonly AnchorTransition[]
): TransitionResult {
  for (const position of ["source", "transformation", "tension", "response", "anchor_state"] as const) {
    if (!motif.positions[position]?.length) throw new Error(`Cannot propose closure without ${position}`);
  }
  for (const transition of anchorTransitions) {
    if (transition.evidence.length === 0) throw new Error("Anchor transitions require evidence");
    if (transition.outcome === "transfigured" && !transition.successorAnchor) {
      throw new Error("Transfigured anchors require a successor anchor");
    }
  }
  const updated = next(motif, { state: "provisionally_closed", anchorTransitions: Object.freeze([...anchorTransitions]) });
  return { motif: updated, receipt: { operation: "proposeClosure", previousRevision: motif.revision, nextRevision: updated.revision } };
}

export function recognizeClosure(
  motif: ResonanceMotif,
  recognition: Recognition,
  successorSource: SuccessorSource
): TransitionResult {
  if (motif.state !== "provisionally_closed") throw new Error("Only a provisionally closed motif can be recognized");
  if (recognition.statedReasons.length === 0) throw new Error("Recognition requires at least one stated reason");
  const source = motif.positions.source?.[0];
  if (!source) throw new Error("Motif source is missing");
  if (successorSource.derivedFromSource !== source) throw new Error("Successor source must derive from the immutable source");
  if (successorSource.informedByRecognition !== recognition.receipt) throw new Error("Successor source must cite the recognition receipt");

  const state: MotifState = recognition.disposition === "does_not_belong"
    ? "rejected_closed"
    : recognition.disposition === "uncertain"
      ? "provisionally_closed"
      : "recognized_closed";

  const updated = next(motif, {
    state,
    positions: Object.freeze({ ...motif.positions, recognition: refs([recognition.receipt]) }),
    recognition: Object.freeze({ ...recognition, statedReasons: refs(recognition.statedReasons) }),
    successorSource: Object.freeze({ ...successorSource })
  });
  return { motif: updated, receipt: { operation: "recognizeClosure", previousRevision: motif.revision, nextRevision: updated.revision } };
}

export function missingPositions(motif: ResonanceMotif): readonly MotifPosition[] {
  return requiredPositions.filter((position) => !motif.positions[position]?.length);
}
