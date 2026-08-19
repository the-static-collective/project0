# Snap-State v0.1 Thresholded Topology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest offline Project 0 reference specimen proving that a local threshold crossing may activate only predeclared structural couplings, propagate bounded integer load, recoil current state, and preserve an append-only addressed history.

**Architecture:** Add an experimental `src/snap-state/` module parallel to `src/l-branch/`. It owns versioned record types, descriptor-safe validation, deterministic addressing under a distinct experimental domain, and one pure evaluator whose event budget is checked before every mutation. Cells, couplings, and the single excitation are addressed before the declaration, so the declaration binds the complete mechanical input state; current state is reconstructed from immutable inputs plus ordered addressed events.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, existing `canonicalizeDomainValue`, existing Project 0 verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-snap-state-v0.1-thresholded-topology-design.md`

## Global Constraints

- Protocol identifier is exactly `p0.snap-state/0.1`.
- Experimental domain prefix is exactly `Project0-SnapState-v0.1|`.
- All experimental refs are `ssr-<64 lowercase hex digest>`.
- Record types are exactly `cell | coupling | excitation | declaration | event | terminal`.
- No tenth canonical node kind, no new universal relationship kind, and no addition to the canonical Project 0 receipt family.
- Reuse `canonicalizeDomainValue`; do not introduce another serializer or hasher.
- All mechanical numeric fields use safe integers; no floating point, probability, clocks, or continuous physics.
- `threshold` and `maxEvents` are positive; load, recoil, transfer, and excitation amounts are non-negative.
- One run has exactly one addressed excitation.
- Couplings support only `activation: "on-source-snap"`.
- Each cell snaps at most once per v0.1 run.
- Eligible cells order by addressed cell ref lexicographically; outgoing couplings order by addressed coupling ref lexicographically.
- The event budget is checked before mutation. An unadmitted event causes no state change.
- Malformed input fails validation before execution; `inadmissible` is not a v0.1 terminal disposition.
- Ordinary terminal dispositions are exactly `settled | exhausted`.
- `eventRefs` preserve execution order and are never set-normalized.
- No model, network, database, queue, scheduler, UI, hidden global state, authority grant, or autonomous loop.
- L-Branch v0.1 and issue #30 remain unchanged.
- Broad gate: `npm run verify:all`.

## File Structure

Create these focused units:

- `src/snap-state/types.ts` — versioned public record and execution-input types only.
- `src/snap-state/validate.ts` — fail-closed descriptor-safe validators and stable error codes.
- `src/snap-state/address.ts` — record normalization, addressing, and verification under the Snap-State domain.
- `src/snap-state/evaluate.ts` — pure current-state projection and atomic event-admission evaluator.
- `src/snap-state/index.ts` — public experimental seam.
- `fixtures/snap-state/specimen.ts` — deeply frozen baseline, below-threshold, partial-chain, simultaneous-order, exhaustion, and history-contrast inputs.
- `tests/snap-state.test.ts` — contract, addressing, and focused execution behavior.
- `tests/snap-state-adversarial.test.ts` — representation, topology-envelope, budget-atomicity, and ordering attacks.
- `tests/snap-state-specimen.test.ts` — frozen fixture replay, immutability, and final-history assertions.

Do not modify `src/l-branch/`, the frozen ontology, or canonical receipt unions.

---

### Task 1: Freeze the Snap-State contract, validators, and addressing domain

**Files:**
- Create: `src/snap-state/types.ts`
- Create: `src/snap-state/validate.ts`
- Create: `src/snap-state/address.ts`
- Create: `src/snap-state/index.ts`
- Create/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Consumes: `canonicalizeDomainValue(prefix, value)` from `src/canonical-addressing/index.ts`.
- Produces: `SNAP_STATE_PROTOCOL_VERSION`, `SNAP_STATE_DOMAIN_PREFIX`, all v0.1 record types, `SnapStateValidationError`, record validators, `addressSnapStateRecord`, `verifySnapStateRecord`, and `AddressedSnapStateRecord<T>`.

- [ ] **Step 1: Write the failing contract/addressing tests**

Start `tests/snap-state.test.ts` with a contract that cannot compile yet:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  SNAP_STATE_DOMAIN_PREFIX,
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
} from "../src/snap-state/index";

const cellA = { cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const cellB = { cellId: "B", threshold: 7, initialLoad: 4, recoilAmount: 7 };

const addressedA = () => addressSnapStateRecord("cell", cellA);
const addressedB = () => addressSnapStateRecord("cell", cellB);

test("freezes the Snap-State v0.1 protocol and domain", () => {
  assert.equal(SNAP_STATE_PROTOCOL_VERSION, "p0.snap-state/0.1");
  assert.equal(SNAP_STATE_DOMAIN_PREFIX, "Project0-SnapState-v0.1|");
  assert.match(addressedA().ref, /^ssr-[0-9a-f]{64}$/);
});

test("declaration set-like refs normalize canonically", () => {
  const a = addressedA();
  const b = addressedB();
  const excitation = addressSnapStateRecord("excitation", {
    excitationId: "pulse-A",
    targetCellRef: a.ref,
    amount: 5,
  });
  const body = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-001",
    purposeRef: "purpose-threshold-proof",
    excitationRef: excitation.ref,
    cellRefs: [b.ref, a.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };
  const reversed = { ...body, cellRefs: [a.ref, b.ref] };
  assert.equal(
    addressSnapStateRecord("declaration", body).ref,
    addressSnapStateRecord("declaration", reversed).ref,
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: build fails because `../src/snap-state/index` does not exist.

- [ ] **Step 3: Add exact versioned record types**

Create `src/snap-state/types.ts` with these public shapes:

```ts
export const SNAP_STATE_PROTOCOL_VERSION = "p0.snap-state/0.1" as const;

export type SnapStateBudgetV01 = { maxEvents: number };

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

export type SnapEventKindV01 = "excitation" | "snap" | "transfer" | "recoil";

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
```

- [ ] **Step 4: Add descriptor-safe representation validators**

Create `src/snap-state/validate.ts`. Carry forward the repository's descriptor-based safety boundary explicitly rather than traversing hostile values through getters:

```ts
export class SnapStateValidationError extends Error {
  constructor(code: string) {
    super(code);
    this.name = "SnapStateValidationError";
  }
}

function dataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
    if (descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    }
  }
  return value as Record<string, unknown>;
}

function dataArray(value: unknown): unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  const names = Object.getOwnPropertyNames(value);
  const expected = new Set<string>(["length"]);
  const items: unknown[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    expected.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable) {
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    }
    items.push(descriptor.value);
  }
  if (names.some((name) => !expected.has(name))) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  return items;
}
```

Add `exactKeys`, `requiredString`, `stringArray`, `positiveSafeInteger`, and `nonNegativeSafeInteger`. Implement and export:

```ts
validateSnapCell(value)
validateSnapCoupling(value)
validateSnapExcitation(value)
validateSnapStateDeclaration(value)
validateSnapEventRecord(value)
validateSnapStateTerminalRecord(value)
validateSnapCellList(value)
validateSnapCouplingList(value)
```

Use stable codes including:

```text
SNAPSTATE_INVALID_REPRESENTATION
SNAPSTATE_UNKNOWN_FIELD
SNAPSTATE_MISSING_FIELD
SNAPSTATE_INVALID_FIELD
SNAPSTATE_PROTOCOL_UNSUPPORTED
SNAPSTATE_ORDERING_UNSUPPORTED
SNAPSTATE_INVALID_BUDGET
SNAPSTATE_INVALID_CELL
SNAPSTATE_INVALID_COUPLING
SNAPSTATE_INVALID_EXCITATION
SNAPSTATE_INVALID_EVENT
SNAPSTATE_INVALID_TERMINAL
SNAPSTATE_ADDRESS_MISMATCH
```

`validateSnapStateDeclaration` must require `orderingRule === "cell-ref-lexicographic"`, a positive `maxEvents`, and syntactically valid non-empty refs. Topology membership is checked in execution after the supplied addressed inputs exist.

- [ ] **Step 5: Add one canonical addressing path for all record types**

Create `src/snap-state/address.ts` with:

```ts
import { canonicalizeDomainValue } from "../canonical-addressing/index";

export const SNAP_STATE_DOMAIN_PREFIX = "Project0-SnapState-v0.1|";

export type AddressedSnapStateRecord<T> = {
  ref: string;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: SnapStateRecordTypeV01;
  body: T;
};
```

Normalize only semantic sets:

```ts
function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeDeclaration(value: SnapStateDeclarationV01): SnapStateDeclarationV01 {
  return {
    ...value,
    cellRefs: sortedUnique(value.cellRefs),
    couplingRefs: sortedUnique(value.couplingRefs),
    budget: { maxEvents: value.budget.maxEvents },
  };
}

function normalizeTerminal(value: SnapStateTerminalRecordV01): SnapStateTerminalRecordV01 {
  return {
    ...value,
    eventRefs: [...value.eventRefs],
    snappedCellRefs: sortedUnique(value.snappedCellRefs),
    finalLoads: Object.fromEntries(
      Object.entries(value.finalLoads).sort(([a], [b]) => a.localeCompare(b)),
    ),
    activeCouplingRefs: sortedUnique(value.activeCouplingRefs),
    remainingBudget: { maxEvents: value.remainingBudget.maxEvents },
  };
}
```

Implement overloads for all six record types. Each overload validates before calling:

```ts
canonicalizeDomainValue(SNAP_STATE_DOMAIN_PREFIX, { recordType, body: normalized })
```

and returns `ref: ssr-${digestHex}`. `verifySnapStateRecord(...)` must require `/^ssr-[0-9a-f]{64}$/` and recompute identity for all six record kinds.

- [ ] **Step 6: Export the public seam and run GREEN**

Create `src/snap-state/index.ts`:

```ts
export * from "./types";
export * from "./validate";
export * from "./address";
```

Run:

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit the contract slice**

```bash
git add src/snap-state tests/snap-state.test.ts
git commit -m "feat: define Snap-State v0.1 contract"
```

---

### Task 2: Prove below-threshold settling and atomic excitation admission

**Files:**
- Create: `src/snap-state/evaluate.ts`
- Modify: `src/snap-state/index.ts`
- Modify/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Consumes: `addressSnapStateRecord`, `SnapStateDeclarationV01`, raw cell/coupling/excitation records.
- Produces: `SnapStateExecutionInputV01`, `SnapStateExecutionResultV01`, and `runSnapState(input)`.

- [ ] **Step 1: Add the failing below-threshold execution test**

Use a helper that addresses cells and builds a declaration from those exact refs. Add:

```ts
test("settles when excitation remains below threshold", () => {
  const a = addressSnapStateRecord("cell", {
    cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5,
  });
  const excitation = addressSnapStateRecord("excitation", {
    excitationId: "below-A", targetCellRef: a.ref, amount: 4,
  });
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-below",
    purposeRef: "purpose-below",
    excitationRef: excitation.ref,
    cellRefs: [a.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 4 },
  };
  const result = runSnapState({
    declaration,
    cells: [a.body],
    couplings: [],
    excitation: excitation.body,
  });

  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].body.kind, "excitation");
  assert.equal(result.events[0].body.loadAfter, 4);
  assert.equal(result.terminal.body.disposition, "settled");
  assert.deepEqual(result.terminal.body.snappedCellRefs, []);
  assert.deepEqual(result.terminal.body.activeCouplingRefs, []);
  assert.equal(result.terminal.body.finalLoads[a.ref], 4);
});
```

- [ ] **Step 2: Run focused test and verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: FAIL because `runSnapState` is not exported.

- [ ] **Step 3: Implement execution input verification before state exists**

In `evaluate.ts`, define:

```ts
export type SnapStateExecutionInputV01 = {
  declaration: SnapStateDeclarationV01;
  cells: SnapCellV01[];
  couplings: SnapCouplingV01[];
  excitation: SnapExcitationV01;
};

export type SnapStateExecutionResultV01 = {
  declaration: AddressedSnapStateRecord<SnapStateDeclarationV01>;
  inputs: {
    cells: AddressedSnapStateRecord<SnapCellV01>[];
    couplings: AddressedSnapStateRecord<SnapCouplingV01>[];
    excitation: AddressedSnapStateRecord<SnapExcitationV01>;
  };
  events: AddressedSnapStateRecord<SnapEventRecordV01>[];
  terminal: AddressedSnapStateRecord<SnapStateTerminalRecordV01>;
};
```

Validation/order before mutation must be:

```ts
validateSnapStateDeclaration(input.declaration);
const cellBodies = validateSnapCellList(input.cells);
const couplingBodies = validateSnapCouplingList(input.couplings);
validateSnapExcitation(input.excitation);

const cells = cellBodies.map((body) => addressSnapStateRecord("cell", body));
const couplings = couplingBodies.map((body) => addressSnapStateRecord("coupling", body));
const excitation = addressSnapStateRecord("excitation", input.excitation);
```

Reject duplicate addressed refs and then require exact set equality between supplied addressed refs and declaration `cellRefs` / `couplingRefs`. Require `excitation.ref === declaration.excitationRef`. Require every coupling endpoint and excitation target to be in the declared addressed cell set. Use stable execution-boundary codes:

```text
SNAPSTATE_DUPLICATE_CELL
SNAPSTATE_DUPLICATE_COUPLING
SNAPSTATE_DECLARATION_INPUT_MISMATCH
SNAPSTATE_UNDECLARED_CELL
SNAPSTATE_UNDECLARED_COUPLING
```

Only after all checks pass may the declaration be addressed and `currentLoads` be initialized.

- [ ] **Step 4: Implement the event-admission helper before any cascade logic**

Inside `runSnapState`, hold local state only:

```ts
const currentLoads = new Map(cells.map((cell) => [cell.ref, cell.body.initialLoad]));
const snapped = new Set<string>();
const activeCouplings = new Set<string>();
const events: AddressedSnapStateRecord<SnapEventRecordV01>[] = [];
let remainingEvents = declaration.body.budget.maxEvents;
let exhausted = false;

function admitEvent(body: SnapEventRecordV01, mutate: () => void): boolean {
  if (remainingEvents === 0) {
    exhausted = true;
    return false;
  }
  const addressed = addressSnapStateRecord("event", body);
  events.push(addressed);
  mutate();
  remainingEvents -= 1;
  return true;
}
```

Construct the excitation event from the current load, admit it first, and mutate the target load only inside `mutate`.

If the excitation itself cannot be admitted because `maxEvents` is zero, validation should already have rejected that declaration as an invalid positive budget; therefore every valid run can admit at least its excitation event.

- [ ] **Step 5: Produce a settled terminal projection**

After excitation, if no unsnapped cell is threshold-eligible, address:

```ts
{
  declarationRef: addressedDeclaration.ref,
  disposition: "settled",
  eventRefs: events.map((event) => event.ref),
  snappedCellRefs: [],
  finalLoads: Object.fromEntries([...currentLoads.entries()]),
  activeCouplingRefs: [],
  remainingBudget: { maxEvents: remainingEvents },
}
```

Return the addressed inputs, events, and terminal. Export `evaluate.ts` from `index.ts`.

- [ ] **Step 6: Run focused GREEN**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit the below-threshold evaluator**

```bash
git add src/snap-state/evaluate.ts src/snap-state/index.ts tests/snap-state.test.ts
git commit -m "feat: settle below-threshold Snap-State runs"
```

---

### Task 3: Add one snap, declared coupling activation, transfer, and recoil

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Consumes: Task 2 current-state maps and `admitEvent`.
- Produces: one complete `snap -> transfer(s) -> recoil` causal sequence with explicit `sourceEventRef` lineage.

- [ ] **Step 1: Write the failing one-snap test**

Build addressed A/B and AB. Use `+5 -> A`, with B starting at zero so no neighbor snap occurs. Assert:

```ts
assert.deepEqual(result.events.map((event) => event.body.kind), [
  "excitation", "snap", "transfer", "recoil",
]);
const [excitationEvent, snapEvent, transferEvent, recoilEvent] = result.events;
assert.equal(snapEvent.body.sourceEventRef, excitationEvent.ref);
assert.equal(transferEvent.body.sourceEventRef, snapEvent.ref);
assert.equal(transferEvent.body.couplingRef, addressedAB.ref);
assert.equal(recoilEvent.body.sourceEventRef, snapEvent.ref);
assert.deepEqual(result.terminal.body.snappedCellRefs, [addressedA.ref]);
assert.deepEqual(result.terminal.body.activeCouplingRefs, [addressedAB.ref]);
assert.equal(result.terminal.body.finalLoads[addressedA.ref], 0);
assert.equal(result.terminal.body.finalLoads[addressedB.ref], 3);
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: FAIL because threshold-eligible cells do not yet snap.

- [ ] **Step 3: Implement deterministic eligibility lookup**

Add helpers inside `runSnapState`:

```ts
const cellByRef = new Map(cells.map((cell) => [cell.ref, cell]));
const outgoing = new Map<string, typeof couplings>();
for (const coupling of couplings) {
  const list = outgoing.get(coupling.body.fromCellRef) ?? [];
  list.push(coupling);
  outgoing.set(coupling.body.fromCellRef, list);
}
for (const list of outgoing.values()) list.sort((a, b) => a.ref.localeCompare(b.ref));

function eligibleCellRefs(): string[] {
  return cells
    .filter((cell) => !snapped.has(cell.ref))
    .filter((cell) => (currentLoads.get(cell.ref) ?? 0) >= cell.body.threshold)
    .map((cell) => cell.ref)
    .sort();
}
```

- [ ] **Step 4: Implement one snap causal sequence using atomic admission**

For the selected eligible cell:

```ts
const loadAtSnap = currentLoads.get(cellRef)!;
const snapBody: SnapEventRecordV01 = {
  declarationRef: addressedDeclaration.ref,
  eventIndex: events.length,
  kind: "snap",
  cellRef,
  sourceEventRef: causeByCell.get(cellRef) ?? null,
  couplingRef: null,
  loadBefore: loadAtSnap,
  loadDelta: 0,
  loadAfter: loadAtSnap,
};
```

Admit the snap. In its mutation callback, add `cellRef` to `snapped` and add every declared outgoing coupling ref to `activeCouplings`.

Then, in sorted outgoing-coupling order, create each transfer from the target's exact current load:

```ts
loadDelta: coupling.body.transferAmount,
loadAfter: before + coupling.body.transferAmount,
sourceEventRef: snap.ref,
couplingRef: coupling.ref,
cellRef: coupling.body.toCellRef,
```

Admit it before changing the target load. On successful transfer, store `causeByCell.set(targetRef, transfer.ref)` so a later snap cites the load-changing event that made it eligible.

Finally create recoil:

```ts
const before = currentLoads.get(cellRef)!;
const after = Math.max(0, before - cell.body.recoilAmount);
loadDelta: after - before,
loadAfter: after,
sourceEventRef: snap.ref,
couplingRef: null,
cellRef,
```

Admit recoil before applying `currentLoads.set(cellRef, after)`.

Do not recursively process a newly eligible target in the middle of the current source's outgoing transfer/recoil sequence. Refresh eligibility after each successful load mutation, but choose the next snap only after the current snap's declared transfer(s) and recoil have completed. This preserves the spec's causal sequence while still deriving eligibility solely from current addressed state.

- [ ] **Step 5: Run focused GREEN**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the one-snap mechanics**

```bash
git add src/snap-state/evaluate.ts tests/snap-state.test.ts
git commit -m "feat: add Snap-State snap transfer and recoil"
```

---

### Task 4: Prove the three-cell cascade and deterministic simultaneous ordering

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Consumes: Task 3 completed snap sequence.
- Produces: repeated bounded snap processing until no eligible unsnapped cell remains, with addressed-ref ordering as the only tie-breaker.

- [ ] **Step 1: Write the failing three-cell cascade test**

Use the approved specimen values:

```text
A threshold 5, initial 0, recoil 5
B threshold 7, initial 4, recoil 7
C threshold 6, initial 2, recoil 6
AB transfer 3
BC transfer 4
excitation +5 -> A
```

Require:

```ts
assert.equal(result.terminal.body.disposition, "settled");
assert.deepEqual(
  result.terminal.body.snappedCellRefs,
  [addressedA.ref, addressedB.ref, addressedC.ref].sort(),
);
assert.deepEqual(
  result.terminal.body.activeCouplingRefs,
  [addressedAB.ref, addressedBC.ref].sort(),
);
assert.deepEqual(result.terminal.body.finalLoads, {
  [addressedA.ref]: 0,
  [addressedB.ref]: 0,
  [addressedC.ref]: 0,
});
assert.equal(result.events.filter((event) => event.body.kind === "snap").length, 3);
```

- [ ] **Step 2: Write the simultaneous-order RED test**

Create two cells whose `initialLoad === threshold`, plus a third excitation target that remains below threshold. After the excitation event, both loaded cells are eligible. Do not assume labels A/B imply address order:

```ts
const expected = [loadedOne.ref, loadedTwo.ref].sort();
const result = runSnapState(input);
const actual = result.events
  .filter((event) => event.body.kind === "snap")
  .slice(0, 2)
  .map((event) => event.body.cellRef);
assert.deepEqual(actual, expected);
```

- [ ] **Step 3: Run tests and verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: at least the cascade test fails because only one snap sequence is processed.

- [ ] **Step 4: Implement the bounded snap loop**

After successful excitation, loop only while no exhaustion has occurred:

```ts
while (!exhausted) {
  const next = eligibleCellRefs()[0];
  if (!next) break;
  if (!processSnap(next)) break;
}
```

`processSnap(cellRef)` must return `false` immediately if any required snap/transfer/recoil event cannot be admitted because budget is exhausted. It must never mutate the state for that unadmitted event.

Because `eligibleCellRefs()` sorts addressed refs and outgoing coupling lists are already sorted by addressed coupling refs, object insertion order and local labels cannot affect replay.

- [ ] **Step 5: Run focused GREEN**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit cascade and ordering**

```bash
git add src/snap-state/evaluate.ts tests/snap-state.test.ts
git commit -m "feat: cascade Snap-State thresholds deterministically"
```

---

### Task 5: Prove event-budget exhaustion cannot create hidden mutation

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Create/Test: `tests/snap-state-adversarial.test.ts`

**Interfaces:**
- Consumes: `runSnapState` and atomic `admitEvent`.
- Produces: exact `exhausted` terminal semantics and regression proof that the first unadmitted event has no effect.

- [ ] **Step 1: Add the RED exhaustion-after-snap test**

Use A -> B with A exactly thresholded by excitation and `maxEvents: 2`. The only admitted events must be `excitation`, then `snap`; the required AB transfer cannot be admitted.

```ts
const result = runSnapState(inputWithTwoEventBudget);
assert.equal(result.terminal.body.disposition, "exhausted");
assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation", "snap"]);
assert.equal(result.terminal.body.finalLoads[addressedA.ref], 5);
assert.equal(result.terminal.body.finalLoads[addressedB.ref], 0);
assert.deepEqual(result.terminal.body.snappedCellRefs, [addressedA.ref]);
assert.deepEqual(result.terminal.body.activeCouplingRefs, [addressedAB.ref]);
assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
```

This exact state is intentional: the admitted snap activated AB, but the unadmitted transfer and recoil never happened.

- [ ] **Step 2: Run and verify RED if terminal semantics are incomplete**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

Expected before the fix: FAIL if the evaluator reports `settled`, applies the transfer/recoil anyway, or does not preserve the partial state.

- [ ] **Step 3: Make terminal selection depend on attempted lawful continuation**

Terminal disposition must be:

```ts
const disposition: SnapStateTerminalDispositionV01 = exhausted ? "exhausted" : "settled";
```

Do not infer exhaustion merely from `remainingEvents === 0`; spending the final event and then having no further eligible transition is lawful `settled`. Set `exhausted = true` only when the evaluator actually attempts to admit a required next event and budget is already zero.

- [ ] **Step 4: Add a regression proving exact-budget completion is settled**

Run a below-threshold one-event fixture with `maxEvents: 1`:

```ts
assert.equal(result.events.length, 1);
assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
assert.equal(result.terminal.body.disposition, "settled");
```

- [ ] **Step 5: Run adversarial and focused tests GREEN**

```bash
npm run build && node --test .build/tests/snap-state.test.js .build/tests/snap-state-adversarial.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit budget atomicity**

```bash
git add src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "test: prove Snap-State event budget atomicity"
```

---

### Task 6: Freeze canonical specimen families and prove recoil/history separation

**Files:**
- Create: `fixtures/snap-state/specimen.ts`
- Create/Test: `tests/snap-state-specimen.test.ts`

**Interfaces:**
- Consumes: public `src/snap-state/index.ts` types and evaluator.
- Produces: deeply frozen fixture families for baseline, below-threshold, partial-chain, simultaneous-order, exhaustion, and same-final-load/different-history comparisons.

- [ ] **Step 1: Create a deeply frozen fixture module**

Use the same recursive freeze convention as existing Project 0 fixtures:

```ts
function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const item of Object.values(value as Record<string, unknown>)) deepFreeze(item);
  return Object.freeze(value);
}
```

Because declaration refs depend on addressed cell/coupling/excitation bodies, build each fixture family through a pure fixture factory that first addresses immutable input bodies and then returns raw execution input with a declaration containing those exact refs. The factory must not mutate its source bodies.

The baseline bodies are exactly:

```ts
const A = { cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const B = { cellId: "B", threshold: 7, initialLoad: 4, recoilAmount: 7 };
const C = { cellId: "C", threshold: 6, initialLoad: 2, recoilAmount: 6 };
```

with AB transfer 3, BC transfer 4, and excitation +5 to addressed A.

- [ ] **Step 2: Add the baseline replay and immutability test**

```ts
const before = structuredClone(SNAP_STATE_SPECIMEN.baseline);
const first = runSnapState(SNAP_STATE_SPECIMEN.baseline);
const second = runSnapState(SNAP_STATE_SPECIMEN.baseline);

assert.equal(first.declaration.ref, second.declaration.ref);
assert.deepEqual(first.events.map((event) => event.ref), second.events.map((event) => event.ref));
assert.equal(first.terminal.ref, second.terminal.ref);
assert.deepEqual(SNAP_STATE_SPECIMEN.baseline, before);
assert.ok(Object.isFrozen(SNAP_STATE_SPECIMEN));
```

- [ ] **Step 3: Prove material return does not erase historical difference**

Create two fixture runs that end with identical final loads but different event paths: baseline threshold cascade versus a no-snap control whose initial loads are already the same final baseline and whose excitation amount is zero. Assert:

```ts
assert.deepEqual(cascade.terminal.body.finalLoads, control.terminal.body.finalLoads);
assert.notDeepEqual(cascade.terminal.body.eventRefs, control.terminal.body.eventRefs);
assert.notEqual(cascade.terminal.ref, control.terminal.ref);
assert.equal(cascade.terminal.body.snappedCellRefs.length, 3);
assert.equal(control.terminal.body.snappedCellRefs.length, 0);
```

Construct the control with distinct addressed input records and declaration; identical final load projection must not collapse historical identity.

- [ ] **Step 4: Prove partial-chain and below-threshold fixture families**

Require the partial chain to settle with A snapped, AB active, B loaded below threshold, and BC inactive. Require the below-threshold fixture to settle with no snaps/couplings.

- [ ] **Step 5: Run specimen GREEN**

```bash
npm run build && node --test .build/tests/snap-state-specimen.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the frozen specimens**

```bash
git add fixtures/snap-state/specimen.ts tests/snap-state-specimen.test.ts
git commit -m "test: freeze Snap-State v0.1 specimens"
```

---

### Task 7: Harden topology and representation boundaries adversarially

**Files:**
- Modify: `src/snap-state/validate.ts`
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state-adversarial.test.ts`

**Interfaces:**
- Consumes: public validation and execution seam.
- Produces: fail-closed proof for hostile accessors, sparse arrays, duplicate/undeclared topology, and declaration/input mismatch.

- [ ] **Step 1: Add hostile-accessor tests before production changes**

Use getter counters and require zero execution:

```ts
let getterCalls = 0;
const hostile = {
  cellId: "A",
  threshold: 5,
  initialLoad: 0,
  get recoilAmount() {
    getterCalls += 1;
    return 5;
  },
};
assert.throws(
  () => addressSnapStateRecord("cell", hostile as never),
  /SNAPSTATE_INVALID_REPRESENTATION/,
);
assert.equal(getterCalls, 0);
```

Also create an array whose numeric index is an accessor and pass it as `cells`; require the same error and zero getter calls.

- [ ] **Step 2: Add sparse/symbol/extra-property array tests**

Require `SNAPSTATE_INVALID_REPRESENTATION` for:

```ts
const sparse = new Array(2);
sparse[0] = validCell;

const extra = [validCell];
Object.defineProperty(extra, "surprise", { value: 1, enumerable: true });

const symbolArray = [validCell];
(symbolArray as unknown as Record<symbol, unknown>)[Symbol("x")] = 1;
```

- [ ] **Step 3: Add exact topology-envelope tests**

Require stable errors for:

```text
- duplicate supplied cell bodies that address to the same ref -> SNAPSTATE_DUPLICATE_CELL
- duplicate supplied couplings -> SNAPSTATE_DUPLICATE_COUPLING
- declaration cellRefs missing one supplied addressed cell -> SNAPSTATE_DECLARATION_INPUT_MISMATCH
- declaration couplingRefs naming a ref not supplied -> SNAPSTATE_DECLARATION_INPUT_MISMATCH
- coupling endpoint not present in declaration cellRefs -> SNAPSTATE_UNDECLARED_CELL
- excitation target not present in declaration cellRefs -> SNAPSTATE_UNDECLARED_CELL
```

- [ ] **Step 4: Run adversarial tests and verify RED where defenses are missing**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

Expected: only newly specified unimplemented defenses fail.

- [ ] **Step 5: Complete descriptor-safe validators and execution envelope checks**

Do not access user-supplied arrays with `.map`, `.some`, spread, or iteration until `dataArray(...)` has copied descriptor values into a trusted dense array. Do not read object fields before `dataRecord(...)` has rejected accessors.

Ensure all topology equality is set equality over **addressed refs**, not `cellId` / `couplingId` labels:

```ts
function sameRefSet(expected: readonly string[], actual: readonly string[]): boolean {
  const left = [...new Set(expected)].sort();
  const right = [...new Set(actual)].sort();
  return left.length === right.length && left.every((ref, index) => ref === right[index]);
}
```

- [ ] **Step 6: Run focused adversarial GREEN**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

Expected: PASS with hostile getter counters still zero.

- [ ] **Step 7: Commit hardening**

```bash
git add src/snap-state/validate.ts src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "fix: fail closed on hostile Snap-State topology"
```

---

### Task 8: Reconcile the exact implementation head and run the repository gate

**Files:**
- Modify only if the preceding tests reveal a concrete defect: `src/snap-state/*`, `fixtures/snap-state/specimen.ts`, `tests/snap-state*.test.ts`
- Do not update GitBook in this task; executable proof must land first.

**Interfaces:**
- Consumes: all Snap-State tasks.
- Produces: exact-head verification evidence suitable for PR review and later GitBook projection.

- [ ] **Step 1: Run the complete Snap-State test surface**

```bash
npm run build && node --test \
  .build/tests/snap-state.test.js \
  .build/tests/snap-state-adversarial.test.js \
  .build/tests/snap-state-specimen.test.js
```

Expected: PASS, zero failed tests.

- [ ] **Step 2: Run TypeScript compile-only verification**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 3: Run the exact repository-wide gate**

```bash
npm run verify:all
```

Expected:

```text
TypeScript compile check: PASS
Node/TypeScript tests: PASS
Python canonical fixture verification: PASS
conformance CLI: PASS
```

Do not claim exact test counts until this command reports them on the implementation head.

- [ ] **Step 4: Inspect the implementation diff against the design invariants**

The review must answer **no** to every question:

```text
Can an event introduce a cell/coupling absent from the declaration?
Can active-state change mutate the declared topology envelope?
Can a cell snap twice in v0.1?
Can exhaustion leave unrecorded mutation?
Can simultaneous eligibility depend on insertion/async order?
Can validation execute a hostile accessor?
Can set normalization reorder event history?
Can threshold crossing imply authority/truth/policy standing?
Can recoil erase prior snap history?
Can any second canonicalizer/hasher appear?
```

Use repository search/diff evidence rather than assumption.

- [ ] **Step 5: Commit only concrete reconciliation changes, if any**

If verification required a correction, commit the smallest fix with its regression test. If no correction was required, create no empty commit.

- [ ] **Step 6: Record exact-head evidence in issue/PR handoff**

The implementation handoff must include:

```text
implementation head SHA
commands run
actual pass/fail result and test count from npm run verify:all
Snap-State focused test result
confirmation that src/l-branch/ is unchanged
confirmation that canonical ontology/receipt unions are unchanged
remaining unresolved v0.2 questions from the design
```

Then hand the branch to the requested Riqor / Develoop / PR Completion review sequence. GitBook may be updated only after the executable PR lands, and must name Project 0 as implementation authority.
