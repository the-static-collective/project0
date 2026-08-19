import {
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
  type SnapCellV01,
  type SnapCouplingV01,
  type SnapExcitationV01,
  type SnapStateExecutionInputV01,
} from "../../src/snap-state/index";

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const item of Object.values(value as Record<string, unknown>)) deepFreeze(item);
  return Object.freeze(value);
}

function makeInput(
  snapshotRef: string,
  purposeRef: string,
  cells: SnapCellV01[],
  couplings: SnapCouplingV01[],
  excitation: SnapExcitationV01,
  maxEvents: number,
): SnapStateExecutionInputV01 {
  const addressedCells = cells.map((cell) => addressSnapStateRecord("cell", cell));
  const addressedCouplings = couplings.map((coupling) => addressSnapStateRecord("coupling", coupling));
  const addressedExcitation = addressSnapStateRecord("excitation", excitation);
  return {
    declaration: {
      protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
      snapshotRef,
      purposeRef,
      excitationRef: addressedExcitation.ref,
      cellRefs: addressedCells.map((cell) => cell.ref),
      couplingRefs: addressedCouplings.map((coupling) => coupling.ref),
      evaluatorId: "snap-state-reference",
      evaluatorVersion: "0.1.0",
      orderingRule: "cell-ref-lexicographic",
      budget: { maxEvents },
    },
    cells,
    couplings,
    excitation,
  };
}

const BASE_A: SnapCellV01 = { cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const BASE_B: SnapCellV01 = { cellId: "B", threshold: 7, initialLoad: 4, recoilAmount: 7 };
const BASE_C: SnapCellV01 = { cellId: "C", threshold: 6, initialLoad: 2, recoilAmount: 6 };
const baseA = addressSnapStateRecord("cell", BASE_A);
const baseB = addressSnapStateRecord("cell", BASE_B);
const baseC = addressSnapStateRecord("cell", BASE_C);
const BASE_AB: SnapCouplingV01 = {
  couplingId: "AB",
  fromCellRef: baseA.ref,
  toCellRef: baseB.ref,
  transferAmount: 3,
  activation: "on-source-snap",
};
const BASE_BC: SnapCouplingV01 = {
  couplingId: "BC",
  fromCellRef: baseB.ref,
  toCellRef: baseC.ref,
  transferAmount: 4,
  activation: "on-source-snap",
};
const BASE_EXCITATION: SnapExcitationV01 = {
  excitationId: "baseline-pulse",
  targetCellRef: baseA.ref,
  amount: 5,
};

const baseline = makeInput(
  "snapshot-baseline",
  "purpose-baseline",
  [BASE_C, BASE_A, BASE_B],
  [BASE_BC, BASE_AB],
  BASE_EXCITATION,
  12,
);

const belowCell: SnapCellV01 = { cellId: "below-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const belowRef = addressSnapStateRecord("cell", belowCell);
const belowThreshold = makeInput(
  "snapshot-below",
  "purpose-below",
  [belowCell],
  [],
  { excitationId: "below-pulse", targetCellRef: belowRef.ref, amount: 4 },
  4,
);

const partialA: SnapCellV01 = { cellId: "partial-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const partialB: SnapCellV01 = { cellId: "partial-B", threshold: 7, initialLoad: 0, recoilAmount: 7 };
const partialC: SnapCellV01 = { cellId: "partial-C", threshold: 6, initialLoad: 0, recoilAmount: 6 };
const partialARef = addressSnapStateRecord("cell", partialA);
const partialBRef = addressSnapStateRecord("cell", partialB);
const partialCRef = addressSnapStateRecord("cell", partialC);
const partialAB: SnapCouplingV01 = {
  couplingId: "partial-AB",
  fromCellRef: partialARef.ref,
  toCellRef: partialBRef.ref,
  transferAmount: 3,
  activation: "on-source-snap",
};
const partialBC: SnapCouplingV01 = {
  couplingId: "partial-BC",
  fromCellRef: partialBRef.ref,
  toCellRef: partialCRef.ref,
  transferAmount: 4,
  activation: "on-source-snap",
};
const partialChain = makeInput(
  "snapshot-partial",
  "purpose-partial",
  [partialA, partialB, partialC],
  [partialAB, partialBC],
  { excitationId: "partial-pulse", targetCellRef: partialARef.ref, amount: 5 },
  8,
);

const tieTarget: SnapCellV01 = { cellId: "tie-target", threshold: 10, initialLoad: 0, recoilAmount: 10 };
const tieOne: SnapCellV01 = { cellId: "tie-one", threshold: 5, initialLoad: 5, recoilAmount: 5 };
const tieTwo: SnapCellV01 = { cellId: "tie-two", threshold: 4, initialLoad: 4, recoilAmount: 4 };
const tieTargetRef = addressSnapStateRecord("cell", tieTarget);
const simultaneousOrder = makeInput(
  "snapshot-tie",
  "purpose-tie",
  [tieTwo, tieTarget, tieOne],
  [],
  { excitationId: "tie-pulse", targetCellRef: tieTargetRef.ref, amount: 1 },
  8,
);

const exhaustedA: SnapCellV01 = { cellId: "exhausted-A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const exhaustedB: SnapCellV01 = { cellId: "exhausted-B", threshold: 10, initialLoad: 0, recoilAmount: 10 };
const exhaustedARef = addressSnapStateRecord("cell", exhaustedA);
const exhaustedBRef = addressSnapStateRecord("cell", exhaustedB);
const exhaustedAB: SnapCouplingV01 = {
  couplingId: "exhausted-AB",
  fromCellRef: exhaustedARef.ref,
  toCellRef: exhaustedBRef.ref,
  transferAmount: 3,
  activation: "on-source-snap",
};
const exhaustion = makeInput(
  "snapshot-exhaustion",
  "purpose-exhaustion",
  [exhaustedA, exhaustedB],
  [exhaustedAB],
  { excitationId: "exhaustion-pulse", targetCellRef: exhaustedARef.ref, amount: 5 },
  2,
);

const ZERO_AC: SnapCouplingV01 = {
  couplingId: "AC-zero",
  fromCellRef: baseA.ref,
  toCellRef: baseC.ref,
  transferAmount: 0,
  activation: "on-source-snap",
};
const zeroTransferHistoryContrast = makeInput(
  "snapshot-history-contrast",
  "purpose-history-contrast",
  [BASE_A, BASE_B, BASE_C],
  [BASE_AB, ZERO_AC, BASE_BC],
  BASE_EXCITATION,
  12,
);

export const SNAP_STATE_SPECIMEN = deepFreeze({
  baseline,
  belowThreshold,
  partialChain,
  simultaneousOrder,
  exhaustion,
  zeroTransferHistoryContrast,
});
