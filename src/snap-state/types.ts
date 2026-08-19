export const SNAP_STATE_PROTOCOL_VERSION = "p0.snap-state/0.1" as const;

export type SnapStateBudgetV01 = {
  maxEvents: number;
};

export type SnapCellV01 = {
  cellId: string;
  threshold: number;
  initialLoad: number;
  recoilAmount: number;
};

export type SnapCouplingV01 = {
  couplingId: string;
  fromCellRef: string;
  toCellRef: string;
  transferAmount: number;
  activation: "on-source-snap";
};

export type SnapExcitationV01 = {
  excitationId: string;
  targetCellRef: string;
  amount: number;
};

export type SnapStateDeclarationV01 = {
  protocolVersion: typeof SNAP_STATE_PROTOCOL_VERSION;
  snapshotRef: string;
  purposeRef: string;
  excitationRef: string;
  cellRefs: string[];
  couplingRefs: string[];
  evaluatorId: string;
  evaluatorVersion: string;
  orderingRule: "cell-ref-lexicographic";
  budget: SnapStateBudgetV01;
};

export type SnapEventKindV01 =
  | "excitation"
  | "snap"
  | "transfer"
  | "recoil";

export type SnapEventRecordV01 = {
  declarationRef: string;
  eventIndex: number;
  kind: SnapEventKindV01;
  cellRef: string;
  sourceEventRef: string | null;
  couplingRef: string | null;
  loadBefore: number;
  loadDelta: number;
  loadAfter: number;
};

export type SnapStateTerminalDispositionV01 = "settled" | "exhausted";

export type SnapStateTerminalRecordV01 = {
  declarationRef: string;
  disposition: SnapStateTerminalDispositionV01;
  eventRefs: string[];
  snappedCellRefs: string[];
  finalLoads: Record<string, number>;
  activeCouplingRefs: string[];
  remainingBudget: SnapStateBudgetV01;
};

export type SnapStateRecordTypeV01 =
  | "cell"
  | "coupling"
  | "excitation"
  | "declaration"
  | "event"
  | "terminal";
