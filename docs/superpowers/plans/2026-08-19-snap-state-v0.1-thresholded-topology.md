# Snap-State v0.1 Thresholded Topology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest offline Project 0 reference specimen proving that a local threshold crossing may activate only predeclared structural couplings, propagate bounded integer load, recoil current state, and preserve an append-only addressed history.

**Architecture:** Add an experimental `src/snap-state/` module parallel to `src/l-branch/`. Cells, couplings, and the single excitation are addressed before the declaration, so the declaration binds the complete mechanical input state. One pure evaluator reconstructs current state from immutable inputs plus ordered addressed events, and checks the finite event budget before every mutation.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, existing `canonicalizeDomainValue`, existing Project 0 verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-snap-state-v0.1-thresholded-topology-design.md`

## Global Constraints

- Protocol identifier is exactly `p0.snap-state/0.1`.
- Experimental domain prefix is exactly `Project0-SnapState-v0.1|`.
- All experimental refs are `ssr-<64 lowercase hex digest>`.
- Record types are exactly `cell | coupling | excitation | declaration | event | terminal`.
- No tenth canonical node kind, no new universal relationship kind, and no addition to the canonical Project 0 receipt family.
- Reuse `canonicalizeDomainValue`; do not introduce another serializer or hasher.
- Mechanical numeric fields use safe integers. `threshold` and `maxEvents` are positive. Loads, recoil, transfer, and excitation amounts are non-negative. `loadDelta` is a signed safe integer because recoil is negative.
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

- `src/snap-state/types.ts` — versioned public record types.
- `src/snap-state/validate.ts` — descriptor-safe fail-closed validators and stable errors.
- `src/snap-state/address.ts` — normalization, addressing, and verification under the Snap-State domain.
- `src/snap-state/evaluate.ts` — pure execution, current-state projection, and atomic event admission.
- `src/snap-state/index.ts` — public experimental seam.
- `fixtures/snap-state/specimen.ts` — deeply frozen fixture families.
- `tests/snap-state.test.ts` — contract, addressing, and normal execution behavior.
- `tests/snap-state-adversarial.test.ts` — hostile representation, topology, and budget-atomicity proofs.
- `tests/snap-state-specimen.test.ts` — frozen replay, immutability, and history/current-state distinction.

Do not modify `src/l-branch/`, `ONTOLOGY.md`, or canonical receipt unions.

---

### Task 1: Freeze record contracts, defensive validation, and addressing

**Files:**
- Create: `src/snap-state/types.ts`
- Create: `src/snap-state/validate.ts`
- Create: `src/snap-state/address.ts`
- Create: `src/snap-state/index.ts`
- Create/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Consumes: `canonicalizeDomainValue(prefix, value)` from `src/canonical-addressing/index.ts`.
- Produces: all Snap-State v0.1 record types; `SnapStateValidationError`; record validators; `addressSnapStateRecord`; `verifySnapStateRecord`; `AddressedSnapStateRecord<T>`.

- [ ] **Step 1: Write the RED contract test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  SNAP_STATE_DOMAIN_PREFIX,
  SNAP_STATE_PROTOCOL_VERSION,
  addressSnapStateRecord,
} from "../src/snap-state/index";

const A = { cellId: "A", threshold: 5, initialLoad: 0, recoilAmount: 5 };
const B = { cellId: "B", threshold: 7, initialLoad: 4, recoilAmount: 7 };

test("freezes Snap-State v0.1 identity", () => {
  assert.equal(SNAP_STATE_PROTOCOL_VERSION, "p0.snap-state/0.1");
  assert.equal(SNAP_STATE_DOMAIN_PREFIX, "Project0-SnapState-v0.1|");
  assert.match(addressSnapStateRecord("cell", A).ref, /^ssr-[0-9a-f]{64}$/);
});

test("set-like declaration refs normalize without changing identity", () => {
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const excitation = addressSnapStateRecord("excitation", {
    excitationId: "pulse-A", targetCellRef: a.ref, amount: 5,
  });
  const declaration = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-contract",
    purposeRef: "purpose-contract",
    excitationRef: excitation.ref,
    cellRefs: [b.ref, a.ref],
    couplingRefs: [],
    evaluatorId: "snap-state-reference",
    evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };
  assert.equal(
    addressSnapStateRecord("declaration", declaration).ref,
    addressSnapStateRecord("declaration", { ...declaration, cellRefs: [a.ref, b.ref] }).ref,
  );
});
```

- [ ] **Step 2: Run RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: build fails because `../src/snap-state/index` does not exist.

- [ ] **Step 3: Add exact v0.1 types**

Create `src/snap-state/types.ts`:

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
  | "cell" | "coupling" | "excitation" | "declaration" | "event" | "terminal";
```

- [ ] **Step 4: Implement descriptor-safe validators**

Create `src/snap-state/validate.ts`. Do not traverse untrusted records/arrays before descriptor checks:

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
  const propertyNames = Object.getOwnPropertyNames(value);
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
  if (propertyNames.some((name) => !expected.has(name))) {
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  }
  return items;
}
```

Implement `exactKeys`, `requiredString`, `stringArray`, and these numeric guards:

```ts
function positiveSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) throw new SnapStateValidationError(code);
  return value as number;
}
function nonNegativeSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new SnapStateValidationError(code);
  return value as number;
}
function signedSafeInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value)) throw new SnapStateValidationError(code);
  return value as number;
}
```

Export validators for cell, coupling, excitation, declaration, event, terminal, cell list, and coupling list. `loadBefore`/`loadAfter` are non-negative; `loadDelta` uses `signedSafeInteger`. Terminal `finalLoads` must pass `dataRecord` and every own value must be a non-negative safe integer. Stable errors include:

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

- [ ] **Step 5: Implement one addressing path**

Create `src/snap-state/address.ts`:

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

Use sorted uniqueness only for set-like refs. Declaration normalization sorts `cellRefs` and `couplingRefs`. Terminal normalization preserves `eventRefs` order, sorts `snappedCellRefs` and `activeCouplingRefs`, and sorts `finalLoads` entries by addressed cell ref.

All six overloads validate their body, then call exactly:

```ts
canonicalizeDomainValue(SNAP_STATE_DOMAIN_PREFIX, { recordType, body: normalizedBody })
```

and return `ssr-${digestHex}`. `verifySnapStateRecord` must reject a malformed expected ref or a recomputed mismatch with `SNAPSTATE_ADDRESS_MISMATCH`.

- [ ] **Step 6: Export and run GREEN**

`src/snap-state/index.ts`:

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

- [ ] **Step 7: Commit**

```bash
git add src/snap-state tests/snap-state.test.ts
git commit -m "feat: define Snap-State v0.1 contract"
```

---

### Task 2: Prove below-threshold settling and atomic excitation

**Files:**
- Create: `src/snap-state/evaluate.ts`
- Modify: `src/snap-state/index.ts`
- Modify/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Produces `SnapStateExecutionInputV01`, `SnapStateExecutionResultV01`, and `runSnapState(input)`.

- [ ] **Step 1: Add the failing below-threshold test**

Address one A cell and one `+4` excitation targeting A. Build a declaration whose `cellRefs` and `excitationRef` are those exact addresses. Require:

```ts
const result = runSnapState(input);
assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation"]);
assert.equal(result.events[0].body.loadAfter, 4);
assert.equal(result.terminal.body.disposition, "settled");
assert.deepEqual(result.terminal.body.snappedCellRefs, []);
assert.deepEqual(result.terminal.body.activeCouplingRefs, []);
assert.equal(result.terminal.body.finalLoads[addressedA.ref], 4);
```

- [ ] **Step 2: Run RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: FAIL because `runSnapState` does not exist.

- [ ] **Step 3: Add execution types and verify all addressed inputs before state initialization**

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

Call descriptor-safe list validators first, then address cells/couplings/excitation. Reject duplicate addressed cell/coupling refs. Require exact set equality between supplied addressed refs and declaration refs; require exact excitation-ref equality. Then require every coupling endpoint and the excitation target to be a declared addressed cell ref. Use:

```text
SNAPSTATE_DUPLICATE_CELL
SNAPSTATE_DUPLICATE_COUPLING
SNAPSTATE_DECLARATION_INPUT_MISMATCH
SNAPSTATE_UNDECLARED_CELL
SNAPSTATE_UNDECLARED_COUPLING
```

Only after those checks pass may the declaration be addressed and current loads initialized.

- [ ] **Step 4: Implement atomic event admission and excitation causal state**

Initialize:

```ts
const currentLoads = new Map(cells.map((cell) => [cell.ref, cell.body.initialLoad]));
const snapped = new Set<string>();
const activeCouplings = new Set<string>();
const causeByCell = new Map<string, string>();
const events: AddressedSnapStateRecord<SnapEventRecordV01>[] = [];
let remainingEvents = addressedDeclaration.body.budget.maxEvents;
let exhausted = false;

function admitEvent(body: SnapEventRecordV01, mutate: (eventRef: string) => void): boolean {
  if (remainingEvents === 0) {
    exhausted = true;
    return false;
  }
  const addressed = addressSnapStateRecord("event", body);
  events.push(addressed);
  mutate(addressed.ref);
  remainingEvents -= 1;
  return true;
}
```

Construct the excitation event from the target's exact current load. Its successful mutation callback must both update the load and bind its causal ref:

```ts
admitEvent(excitationBody, (eventRef) => {
  currentLoads.set(targetRef, after);
  causeByCell.set(targetRef, eventRef);
});
```

This guarantees a later A snap cites the excitation event that made A eligible.

- [ ] **Step 5: Address the terminal projection**

When no cell is eligible, terminal body is:

```ts
{
  declarationRef: addressedDeclaration.ref,
  disposition: exhausted ? "exhausted" : "settled",
  eventRefs: events.map((event) => event.ref),
  snappedCellRefs: [...snapped],
  finalLoads: Object.fromEntries(currentLoads.entries()),
  activeCouplingRefs: [...activeCouplings],
  remainingBudget: { maxEvents: remainingEvents },
}
```

Export `evaluate.ts` from `index.ts`.

- [ ] **Step 6: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state/evaluate.ts src/snap-state/index.ts tests/snap-state.test.ts
git commit -m "feat: settle below-threshold Snap-State runs"
```

---

### Task 3: Add snap, coupling activation, transfer, and recoil

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state.test.ts`

**Interfaces:**
- Produces one complete `snap -> transfer(s) -> recoil` causal sequence.

- [ ] **Step 1: Add the one-snap RED test**

Use A threshold 5/recoil 5, B threshold 10/initial 0, AB transfer 3, excitation +5 to A. Require:

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

- [ ] **Step 2: Run RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

- [ ] **Step 3: Add deterministic topology indexes and eligibility**

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

- [ ] **Step 4: Implement one `processSnap(cellRef)` causal sequence**

Snap event uses `sourceEventRef: causeByCell.get(cellRef) ?? null` and does not change load. Its successful mutation marks the cell snapped and activates all predeclared outgoing coupling refs.

For each outgoing coupling in addressed-ref order, construct the transfer from the target's current load and admit it before mutation. On success:

```ts
currentLoads.set(targetRef, after);
causeByCell.set(targetRef, transferEventRef);
```

Then construct recoil from the source's exact current load:

```ts
const after = Math.max(0, before - cell.body.recoilAmount);
const recoilBody = {
  declarationRef: addressedDeclaration.ref,
  eventIndex: events.length,
  kind: "recoil" as const,
  cellRef,
  sourceEventRef: snap.ref,
  couplingRef: null,
  loadBefore: before,
  loadDelta: after - before,
  loadAfter: after,
};
```

Admit before `currentLoads.set(cellRef, after)`.

Do not interleave a new cell's snap inside the current source's transfer/recoil sequence. Current loads are updated after each admitted event; the next eligible snap is selected only after the current source sequence completes.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state/evaluate.ts tests/snap-state.test.ts
git commit -m "feat: add Snap-State snap transfer and recoil"
```

---

### Task 4: Prove three-cell cascade and addressed-ref ordering

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state.test.ts`

- [ ] **Step 1: Add the baseline cascade RED test**

Use exactly:

```text
A: threshold 5, initialLoad 0, recoilAmount 5
B: threshold 7, initialLoad 4, recoilAmount 7
C: threshold 6, initialLoad 2, recoilAmount 6
AB: A -> B, transfer 3
BC: B -> C, transfer 4
excitation: +5 -> A
```

Require `settled`, all three addressed cells in `snappedCellRefs`, AB/BC active, three snap events, and final loads zero for all three addressed cell refs.

- [ ] **Step 2: Add simultaneous eligibility ordering test**

Create two cells whose `initialLoad === threshold`, plus a third excitation target that remains below threshold. After the excitation event, both are eligible. Compute expected order from canonical refs:

```ts
const expected = [loadedOne.ref, loadedTwo.ref].sort();
const actual = result.events
  .filter((event) => event.body.kind === "snap")
  .slice(0, 2)
  .map((event) => event.body.cellRef);
assert.deepEqual(actual, expected);
```

- [ ] **Step 3: Run RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: cascade fails until repeated snap processing exists.

- [ ] **Step 4: Add the finite deterministic snap loop**

```ts
while (!exhausted) {
  const next = eligibleCellRefs()[0];
  if (!next) break;
  if (!processSnap(next)) break;
}
```

`processSnap` returns `false` as soon as a required next event cannot be admitted. It never applies that unadmitted event's mutation.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state/evaluate.ts tests/snap-state.test.ts
git commit -m "feat: cascade Snap-State thresholds deterministically"
```

---

### Task 5: Prove exhaustion is an event-admission boundary

**Files:**
- Modify: `src/snap-state/evaluate.ts`
- Create/Test: `tests/snap-state-adversarial.test.ts`

- [ ] **Step 1: Add exhaustion-after-snap RED**

Use A -> B with A thresholded by excitation and `maxEvents: 2`. Require only `excitation`, `snap`; AB is active because the admitted snap activated it, but its transfer and A recoil are unadmitted and therefore absent:

```ts
assert.equal(result.terminal.body.disposition, "exhausted");
assert.deepEqual(result.events.map((event) => event.body.kind), ["excitation", "snap"]);
assert.equal(result.terminal.body.finalLoads[addressedA.ref], 5);
assert.equal(result.terminal.body.finalLoads[addressedB.ref], 0);
assert.deepEqual(result.terminal.body.snappedCellRefs, [addressedA.ref]);
assert.deepEqual(result.terminal.body.activeCouplingRefs, [addressedAB.ref]);
assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
```

- [ ] **Step 2: Add exact-budget settled regression**

Below-threshold fixture with `maxEvents: 1` must consume its last event and still settle:

```ts
assert.equal(result.events.length, 1);
assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
assert.equal(result.terminal.body.disposition, "settled");
```

- [ ] **Step 3: Run RED**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

- [ ] **Step 4: Fix terminal selection only if the tests expose a defect**

The required rule is:

```ts
const disposition: SnapStateTerminalDispositionV01 = exhausted ? "exhausted" : "settled";
```

`exhausted` becomes true only when `admitEvent` is asked to admit a lawful required event with zero remaining budget. `remainingEvents === 0` alone is not exhaustion.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js .build/tests/snap-state-adversarial.test.js
git add src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "test: prove Snap-State event budget atomicity"
```

---

### Task 6: Freeze specimen families and prove current-state/history separation

**Files:**
- Create: `fixtures/snap-state/specimen.ts`
- Create/Test: `tests/snap-state-specimen.test.ts`

- [ ] **Step 1: Build deeply frozen raw execution fixtures**

Use:

```ts
function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const item of Object.values(value as Record<string, unknown>)) deepFreeze(item);
  return Object.freeze(value);
}
```

Fixture factories address immutable cell/coupling/excitation bodies only to derive declaration refs, then return raw `SnapStateExecutionInputV01`; do not store addressed records/Buffers inside the deeply frozen fixture.

Export baseline, below-threshold, partial-chain, simultaneous-order, exhaustion, and a **zero-transfer history contrast**.

The history contrast uses the same A/B/C cell bodies and baseline AB/BC couplings, but adds one extra declared `A -> C` coupling with `transferAmount: 0`. Both runs therefore use the same addressed cell refs and finish with the same `finalLoads`, while the contrast run contains one additional addressed transfer event and a different active-coupling/history projection.

- [ ] **Step 2: Add deterministic replay and source immutability test**

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

- [ ] **Step 3: Prove identical final loads do not collapse different histories**

```ts
const baseline = runSnapState(SNAP_STATE_SPECIMEN.baseline);
const contrast = runSnapState(SNAP_STATE_SPECIMEN.zeroTransferHistoryContrast);
assert.deepEqual(baseline.terminal.body.finalLoads, contrast.terminal.body.finalLoads);
assert.notDeepEqual(baseline.terminal.body.eventRefs, contrast.terminal.body.eventRefs);
assert.notEqual(baseline.terminal.ref, contrast.terminal.ref);
assert.equal(
  contrast.events.filter((event) => event.body.kind === "transfer").length,
  baseline.events.filter((event) => event.body.kind === "transfer").length + 1,
);
```

This proves material/current projection equality does not erase the path by which it was reached.

- [ ] **Step 4: Prove partial-chain and below-threshold fixtures**

Partial chain must settle with only A snapped, AB active, B below threshold, BC inactive. Below-threshold must settle with no snap and no active coupling.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state-specimen.test.js
git add fixtures/snap-state/specimen.ts tests/snap-state-specimen.test.ts
git commit -m "test: freeze Snap-State v0.1 specimens"
```

---

### Task 7: Harden representation and declared-topology boundaries

**Files:**
- Modify: `src/snap-state/validate.ts`
- Modify: `src/snap-state/evaluate.ts`
- Modify/Test: `tests/snap-state-adversarial.test.ts`

- [ ] **Step 1: Add hostile accessor tests with zero getter execution**

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

Also put an accessor at numeric index `0` of the `cells` array and require zero getter calls.

- [ ] **Step 2: Add sparse, symbol, and extra-property array tests**

```ts
const sparse = new Array(2);
sparse[0] = validCell;

const extra = [validCell];
Object.defineProperty(extra, "surprise", { value: 1, enumerable: true });

const symbolArray = [validCell] as unknown as Record<symbol, unknown> & unknown[];
symbolArray[Symbol("x")] = 1;
```

Each must fail with `SNAPSTATE_INVALID_REPRESENTATION`.

- [ ] **Step 3: Add exact addressed-envelope tests**

Require:

```text
duplicate supplied addressed cell -> SNAPSTATE_DUPLICATE_CELL
duplicate supplied addressed coupling -> SNAPSTATE_DUPLICATE_COUPLING
declaration/supplied cell set mismatch -> SNAPSTATE_DECLARATION_INPUT_MISMATCH
declaration/supplied coupling set mismatch -> SNAPSTATE_DECLARATION_INPUT_MISMATCH
coupling endpoint outside declared addressed cells -> SNAPSTATE_UNDECLARED_CELL
excitation target outside declared addressed cells -> SNAPSTATE_UNDECLARED_CELL
```

- [ ] **Step 4: Run RED**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

- [ ] **Step 5: Complete the defenses without unsafe traversal**

Never call `.map`, `.some`, spread, or iteration on a user-supplied array until `dataArray` has copied descriptor values into a trusted dense array. Never read untrusted record fields until `dataRecord` has rejected accessors.

Set equality is over addressed refs:

```ts
function sameRefSet(expected: readonly string[], actual: readonly string[]): boolean {
  const left = [...new Set(expected)].sort();
  const right = [...new Set(actual)].sort();
  return left.length === right.length && left.every((ref, index) => ref === right[index]);
}
```

Local labels `cellId` and `couplingId` never substitute for canonical record refs.

- [ ] **Step 6: Run GREEN and commit**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
git add src/snap-state/validate.ts src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "fix: fail closed on hostile Snap-State topology"
```

---

### Task 8: Exact-head verification and implementation handoff

**Files:**
- Modify only when a verification failure identifies a concrete Snap-State defect.
- Do not update GitBook before the executable PR lands.

- [ ] **Step 1: Run the complete Snap-State surface**

```bash
npm run build && node --test \
  .build/tests/snap-state.test.js \
  .build/tests/snap-state-adversarial.test.js \
  .build/tests/snap-state-specimen.test.js
```

Expected: PASS, zero failed Snap-State tests.

- [ ] **Step 2: Run compile verification**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 3: Run the full repository gate**

```bash
npm run verify:all
```

Expected: TypeScript compile, Node/TypeScript tests, Python fixture verification, and conformance CLI all PASS. Record the actual test count from this exact head; do not predict it in advance.

- [ ] **Step 4: Review the exact diff against the invariant questions**

Every answer must be **no**:

```text
Can an event introduce a cell/coupling absent from the declaration?
Can active state mutate the declared topology envelope?
Can a cell snap twice in v0.1?
Can exhaustion leave unrecorded mutation?
Can simultaneous eligibility depend on insertion/async order?
Can validation execute a hostile accessor?
Can set normalization reorder event history?
Can threshold crossing imply authority/truth/policy standing?
Can recoil erase prior snap history?
Can a second canonicalizer/hasher appear?
```

Also verify `src/l-branch/`, ontology kinds, and canonical receipt unions are unchanged.

- [ ] **Step 5: Correct only evidenced defects and rerun the affected RED -> GREEN cycle**

If a defect is found, add the narrow regression test first, observe it fail, apply the smallest correction, rerun the focused test, then rerun `npm run verify:all`. If no defect is found, create no empty commit.

- [ ] **Step 6: Produce the PR handoff evidence**

The PR description/review handoff must contain:

```text
implementation head SHA
commands actually run
actual pass/fail result and test count from npm run verify:all
focused Snap-State test result
confirmation src/l-branch/ is unchanged
confirmation ontology/receipt unions are unchanged
remaining v0.2 questions preserved from the design
```

Then use the requested Riqor evidence/reviewer, Develoop review loop, and PR Completion workflow. GitBook may receive a project-backed Frontier projection only after the executable PR lands, with Project 0 named as implementation authority.
