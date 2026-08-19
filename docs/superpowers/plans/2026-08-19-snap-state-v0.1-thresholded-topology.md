# Snap-State v0.1 Thresholded Topology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest offline Project 0 specimen proving that a local threshold crossing may activate only predeclared couplings, transfer bounded integer load, recoil current state, and preserve append-only addressed history.

**Architecture:** Add an experimental `src/snap-state/` module parallel to `src/l-branch/`. Cell, coupling, and excitation bodies are addressed before the declaration, so the declaration binds the complete mechanical input state. A pure evaluator derives current state from immutable inputs plus ordered addressed events and checks the finite event budget before every mutation.

**Tech Stack:** TypeScript 7, Node.js `node:test` / `node:assert`, existing `canonicalizeDomainValue`, existing Project 0 verification commands.

**Spec:** `docs/superpowers/specs/2026-08-19-snap-state-v0.1-thresholded-topology-design.md`

## Global Constraints

- Protocol: `p0.snap-state/0.1`.
- Address domain: `Project0-SnapState-v0.1|`; refs: `ssr-<64 lowercase hex>`.
- Record kinds: `cell | coupling | excitation | declaration | event | terminal`.
- No ontology, universal relationship, or canonical receipt-family expansion.
- Reuse `canonicalizeDomainValue`; no second serializer/hasher.
- Safe integers only. `threshold`/`maxEvents` positive; loads/recoil/transfer/excitation non-negative; recoil makes `loadDelta` a signed safe integer.
- Exactly one addressed excitation per run.
- Only `activation: "on-source-snap"`; each cell snaps at most once per v0.1 run.
- Eligible cells sort by addressed cell ref; outgoing couplings sort by addressed coupling ref.
- Event admission precedes mutation. An event that cannot be admitted causes no mutation.
- Malformed input fails before execution; terminals are exactly `settled | exhausted`.
- `eventRefs` are ordered history and must never be set-normalized.
- No model, network, DB, queue, scheduler, UI, clock, randomness, hidden global state, authority grant, or autonomous loop.
- `src/l-branch/`, issue #30 semantics, ontology kinds, and canonical receipt unions remain unchanged.
- Broad gate: `npm run verify:all`.

## Files

- Create `src/snap-state/types.ts` — public v0.1 record types.
- Create `src/snap-state/validate.ts` — descriptor-safe validation/errors.
- Create `src/snap-state/address.ts` — normalization/address/verify.
- Create `src/snap-state/evaluate.ts` — pure execution and atomic event admission.
- Create `src/snap-state/index.ts` — public seam.
- Create `fixtures/snap-state/specimen.ts` — frozen specimen family.
- Create `tests/snap-state.test.ts` — contract and normal mechanics.
- Create `tests/snap-state-adversarial.test.ts` — hostile representation/topology/budget/cycle proofs.
- Create `tests/snap-state-specimen.test.ts` — replay/history/immutability proofs.

---

### Task 1: Contract, validation, and canonical experimental addressing

**Files:** `src/snap-state/types.ts`, `validate.ts`, `address.ts`, `index.ts`, `tests/snap-state.test.ts`

**Produces:** `SNAP_STATE_PROTOCOL_VERSION`, `SNAP_STATE_DOMAIN_PREFIX`, all v0.1 types, `SnapStateValidationError`, validators, `AddressedSnapStateRecord<T>`, `addressSnapStateRecord`, `verifySnapStateRecord`.

- [ ] **Step 1: Write RED identity tests**

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

test("freezes Snap-State identity", () => {
  assert.equal(SNAP_STATE_PROTOCOL_VERSION, "p0.snap-state/0.1");
  assert.equal(SNAP_STATE_DOMAIN_PREFIX, "Project0-SnapState-v0.1|");
  assert.match(addressSnapStateRecord("cell", A).ref, /^ssr-[0-9a-f]{64}$/);
});

test("normalizes only declaration sets", () => {
  const a = addressSnapStateRecord("cell", A);
  const b = addressSnapStateRecord("cell", B);
  const excitation = addressSnapStateRecord("excitation", {
    excitationId: "pulse-A", targetCellRef: a.ref, amount: 5,
  });
  const d = {
    protocolVersion: SNAP_STATE_PROTOCOL_VERSION,
    snapshotRef: "snapshot-contract",
    purposeRef: "purpose-contract",
    excitationRef: excitation.ref,
    cellRefs: [b.ref, a.ref], couplingRefs: [],
    evaluatorId: "snap-state-reference", evaluatorVersion: "0.1.0",
    orderingRule: "cell-ref-lexicographic" as const,
    budget: { maxEvents: 8 },
  };
  assert.equal(
    addressSnapStateRecord("declaration", d).ref,
    addressSnapStateRecord("declaration", { ...d, cellRefs: [a.ref, b.ref] }).ref,
  );
});
```

- [ ] **Step 2: Verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

Expected: missing `src/snap-state/index`.

- [ ] **Step 3: Add exact types**

```ts
export const SNAP_STATE_PROTOCOL_VERSION = "p0.snap-state/0.1" as const;
export type SnapStateBudgetV01 = { maxEvents: number };
export type SnapCellV01 = { cellId: string; threshold: number; initialLoad: number; recoilAmount: number };
export type SnapCouplingV01 = {
  couplingId: string; fromCellRef: string; toCellRef: string;
  transferAmount: number; activation: "on-source-snap";
};
export type SnapExcitationV01 = { excitationId: string; targetCellRef: string; amount: number };
export type SnapStateDeclarationV01 = {
  protocolVersion: typeof SNAP_STATE_PROTOCOL_VERSION;
  snapshotRef: string; purposeRef: string; excitationRef: string;
  cellRefs: string[]; couplingRefs: string[];
  evaluatorId: string; evaluatorVersion: string;
  orderingRule: "cell-ref-lexicographic";
  budget: SnapStateBudgetV01;
};
export type SnapEventKindV01 = "excitation" | "snap" | "transfer" | "recoil";
export type SnapEventRecordV01 = {
  declarationRef: string; eventIndex: number; kind: SnapEventKindV01;
  cellRef: string; sourceEventRef: string | null; couplingRef: string | null;
  loadBefore: number; loadDelta: number; loadAfter: number;
};
export type SnapStateTerminalDispositionV01 = "settled" | "exhausted";
export type SnapStateTerminalRecordV01 = {
  declarationRef: string; disposition: SnapStateTerminalDispositionV01;
  eventRefs: string[]; snappedCellRefs: string[];
  finalLoads: Record<string, number>; activeCouplingRefs: string[];
  remainingBudget: SnapStateBudgetV01;
};
export type SnapStateRecordTypeV01 =
  | "cell" | "coupling" | "excitation" | "declaration" | "event" | "terminal";
```

- [ ] **Step 4: Add descriptor-safe validators**

Use the proven Project 0 pattern before reading values:

```ts
export class SnapStateValidationError extends Error {
  constructor(code: string) { super(code); this.name = "SnapStateValidationError"; }
}
function dataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  if (Object.getOwnPropertySymbols(value).length)
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  for (const d of Object.values(Object.getOwnPropertyDescriptors(value)))
    if (d.get || d.set || !d.enumerable)
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  return value as Record<string, unknown>;
}
function dataArray(value: unknown): unknown[] {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length)
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  const names = Object.getOwnPropertyNames(value);
  const expected = new Set<string>(["length"]);
  const out: unknown[] = [];
  for (let i = 0; i < value.length; i += 1) {
    const key = String(i); expected.add(key);
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!d || d.get || d.set || !d.enumerable)
      throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
    out.push(d.value);
  }
  if (names.some((name) => !expected.has(name)))
    throw new SnapStateValidationError("SNAPSTATE_INVALID_REPRESENTATION");
  return out;
}
```

Implement exact-key checking plus positive, non-negative, and signed safe-integer guards. Export validators for every record and for cell/coupling lists. Event `loadBefore`/`loadAfter` are non-negative safe integers; `loadDelta` is signed. Terminal `finalLoads` itself passes `dataRecord`; every value is non-negative safe integer.

Use stable codes:

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

- [ ] **Step 5: Add canonical experimental addressing**

```ts
export const SNAP_STATE_DOMAIN_PREFIX = "Project0-SnapState-v0.1|";
export type AddressedSnapStateRecord<T> = {
  ref: string; digestHex: string; canonicalBytes: Buffer;
  recordType: SnapStateRecordTypeV01; body: T;
};
```

All six overloads validate then call:

```ts
canonicalizeDomainValue(SNAP_STATE_DOMAIN_PREFIX, { recordType, body: normalizedBody })
```

Declaration normalization sorts/deduplicates `cellRefs` and `couplingRefs`. Terminal normalization preserves `eventRefs` exactly, sorts/deduplicates `snappedCellRefs` and `activeCouplingRefs`, and sorts `finalLoads` entries by cell ref. `verifySnapStateRecord` recomputes and requires `/^ssr-[0-9a-f]{64}$/`.

- [ ] **Step 6: Export, GREEN, commit**

```ts
export * from "./types";
export * from "./validate";
export * from "./address";
```

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state tests/snap-state.test.ts
git commit -m "feat: define Snap-State v0.1 contract"
```

---

### Task 2: Below-threshold run and atomic excitation

**Files:** create `src/snap-state/evaluate.ts`; modify `index.ts`, `tests/snap-state.test.ts`.

**Produces:** `SnapStateExecutionInputV01`, `SnapStateExecutionResultV01`, `runSnapState`.

- [ ] **Step 1: RED below-threshold test**

Address A and `+4 -> A`; declaration names those exact refs. Require one `excitation`, A load 4, no snap/coupling, `settled`.

```ts
const result = runSnapState(input);
assert.deepEqual(result.events.map((e) => e.body.kind), ["excitation"]);
assert.equal(result.events[0].body.loadAfter, 4);
assert.equal(result.terminal.body.disposition, "settled");
assert.deepEqual(result.terminal.body.snappedCellRefs, []);
assert.equal(result.terminal.body.finalLoads[addressedA.ref], 4);
```

- [ ] **Step 2: Verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

- [ ] **Step 3: Define execution seam and verify input identity before state exists**

```ts
export type SnapStateExecutionInputV01 = {
  declaration: SnapStateDeclarationV01;
  cells: SnapCellV01[]; couplings: SnapCouplingV01[]; excitation: SnapExcitationV01;
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

Descriptor-validate lists first, address supplied inputs, reject duplicate addressed cell/coupling refs, require exact declaration ref sets and excitation ref, then require all coupling endpoints/excitation target in declared cell refs. Errors:

```text
SNAPSTATE_DUPLICATE_CELL
SNAPSTATE_DUPLICATE_COUPLING
SNAPSTATE_DECLARATION_INPUT_MISMATCH
SNAPSTATE_UNDECLARED_CELL
SNAPSTATE_UNDECLARED_COUPLING
```

- [ ] **Step 4: Implement atomic event admission and causal tracking**

```ts
const currentLoads = new Map(cells.map((c) => [c.ref, c.body.initialLoad]));
const snapped = new Set<string>();
const activeCouplings = new Set<string>();
const causeByCell = new Map<string, string>();
const events: AddressedSnapStateRecord<SnapEventRecordV01>[] = [];
let remainingEvents = addressedDeclaration.body.budget.maxEvents;
let exhausted = false;

function admitEvent(body: SnapEventRecordV01, mutate: (eventRef: string) => void): boolean {
  if (remainingEvents === 0) { exhausted = true; return false; }
  const addressed = addressSnapStateRecord("event", body);
  events.push(addressed);
  mutate(addressed.ref);
  remainingEvents -= 1;
  return true;
}
```

Excitation mutation sets both load and cause:

```ts
admitEvent(excitationBody, (ref) => {
  currentLoads.set(targetRef, after);
  causeByCell.set(targetRef, ref);
});
```

- [ ] **Step 5: Build addressed terminal and GREEN**

```ts
const terminal = addressSnapStateRecord("terminal", {
  declarationRef: addressedDeclaration.ref,
  disposition: exhausted ? "exhausted" : "settled",
  eventRefs: events.map((e) => e.ref),
  snappedCellRefs: [...snapped],
  finalLoads: Object.fromEntries(currentLoads.entries()),
  activeCouplingRefs: [...activeCouplings],
  remainingBudget: { maxEvents: remainingEvents },
});
```

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state/evaluate.ts src/snap-state/index.ts tests/snap-state.test.ts
git commit -m "feat: settle below-threshold Snap-State runs"
```

---

### Task 3: One snap, declared transfer, and recoil

**Files:** modify `evaluate.ts`, `tests/snap-state.test.ts`.

- [ ] **Step 1: RED one-snap causal test**

Use A threshold5/recoil5; B threshold10/initial0; AB transfer3; `+5 -> A`. Require event kinds `[excitation,snap,transfer,recoil]`; snap cites excitation; transfer/recoil cite snap; AB is active; A final0/B final3.

- [ ] **Step 2: Verify RED**

```bash
npm run build && node --test .build/tests/snap-state.test.js
```

- [ ] **Step 3: Index only addressed topology and deterministic eligibility**

```ts
const cellByRef = new Map(cells.map((c) => [c.ref, c]));
const outgoing = new Map<string, typeof couplings>();
for (const c of couplings) {
  const list = outgoing.get(c.body.fromCellRef) ?? [];
  list.push(c); outgoing.set(c.body.fromCellRef, list);
}
for (const list of outgoing.values()) list.sort((a, b) => a.ref.localeCompare(b.ref));
function eligibleCellRefs(): string[] {
  return cells.filter((c) => !snapped.has(c.ref))
    .filter((c) => (currentLoads.get(c.ref) ?? 0) >= c.body.threshold)
    .map((c) => c.ref).sort();
}
```

- [ ] **Step 4: Implement `processSnap(cellRef)`**

Admit snap first. Only its mutation marks the cell snapped and all its already-declared outgoing coupling refs active. For each outgoing coupling in ref order, construct transfer from exact target load, admit before mutation, then:

```ts
currentLoads.set(targetRef, after);
causeByCell.set(targetRef, transferEventRef);
```

Then admit recoil before changing source load:

```ts
const after = Math.max(0, before - cell.body.recoilAmount);
const recoilBody = {
  declarationRef: addressedDeclaration.ref, eventIndex: events.length,
  kind: "recoil" as const, cellRef,
  sourceEventRef: snap.ref, couplingRef: null,
  loadBefore: before, loadDelta: after - before, loadAfter: after,
};
```

Do not interleave another cell's snap inside the current source's transfer/recoil sequence.

- [ ] **Step 5: GREEN, commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js
git add src/snap-state/evaluate.ts tests/snap-state.test.ts
git commit -m "feat: add Snap-State snap transfer and recoil"
```

---

### Task 4: Cascade, tie ordering, and snap-once cycle bound

**Files:** modify `evaluate.ts`, `tests/snap-state.test.ts`, `tests/snap-state-adversarial.test.ts`.

- [ ] **Step 1: RED approved three-cell cascade**

Use exact approved bodies:

```text
A threshold5 initial0 recoil5
B threshold7 initial4 recoil7
C threshold6 initial2 recoil6
AB transfer3; BC transfer4; excitation +5 -> A
```

Require `settled`, A/B/C each snapped exactly once, AB/BC active, all final loads zero.

- [ ] **Step 2: RED simultaneous ordering**

Two cells start exactly at threshold while the excitation target stays below. Expected first two snap cell refs are:

```ts
const expected = [loadedOne.ref, loadedTwo.ref].sort();
```

not local label or insertion order.

- [ ] **Step 3: RED cycle/snap-once proof**

Create A->B and B->A couplings with enough transfer to leave both at/above threshold after their first snaps. Require:

```ts
const snaps = result.events.filter((e) => e.body.kind === "snap");
assert.equal(snaps.filter((e) => e.body.cellRef === a.ref).length, 1);
assert.equal(snaps.filter((e) => e.body.cellRef === b.ref).length, 1);
assert.equal(result.terminal.body.disposition, "settled");
```

The `snapped` set, not budget luck, must prevent a second snap.

- [ ] **Step 4: Verify RED and implement finite loop**

```bash
npm run build && node --test .build/tests/snap-state.test.js .build/tests/snap-state-adversarial.test.js
```

```ts
while (!exhausted) {
  const next = eligibleCellRefs()[0];
  if (!next) break;
  if (!processSnap(next)) break;
}
```

- [ ] **Step 5: GREEN, commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js .build/tests/snap-state-adversarial.test.js
git add src/snap-state/evaluate.ts tests/snap-state.test.ts tests/snap-state-adversarial.test.ts
git commit -m "feat: cascade Snap-State thresholds deterministically"
```

---

### Task 5: Event-budget exhaustion without hidden mutation

**Files:** modify `evaluate.ts`, `tests/snap-state-adversarial.test.ts`.

- [ ] **Step 1: RED exhaustion after admitted snap**

A->B with `maxEvents: 2`: excitation and snap admit; transfer/recoil cannot.

```ts
assert.equal(result.terminal.body.disposition, "exhausted");
assert.deepEqual(result.events.map((e) => e.body.kind), ["excitation", "snap"]);
assert.equal(result.terminal.body.finalLoads[a.ref], 5);
assert.equal(result.terminal.body.finalLoads[b.ref], 0);
assert.deepEqual(result.terminal.body.snappedCellRefs, [a.ref]);
assert.deepEqual(result.terminal.body.activeCouplingRefs, [ab.ref]);
assert.equal(result.terminal.body.remainingBudget.maxEvents, 0);
```

- [ ] **Step 2: RED exact-budget settled regression**

A below-threshold one-event run with `maxEvents: 1` must end `settled` with zero remaining budget.

- [ ] **Step 3: Verify/repair rule**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

`exhausted` becomes true only when a lawful required event is actually attempted with zero budget. `remainingEvents === 0` alone never implies exhaustion.

- [ ] **Step 4: GREEN, commit**

```bash
npm run build && node --test .build/tests/snap-state.test.js .build/tests/snap-state-adversarial.test.js
git add src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "test: prove Snap-State event budget atomicity"
```

---

### Task 6: Frozen specimens and historical irreversibility

**Files:** create `fixtures/snap-state/specimen.ts`, `tests/snap-state-specimen.test.ts`.

- [ ] **Step 1: Build deeply frozen raw fixtures**

```ts
function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const item of Object.values(value as Record<string, unknown>)) deepFreeze(item);
  return Object.freeze(value);
}
```

Factories may address raw bodies to derive declaration refs but return/freeze only raw `SnapStateExecutionInputV01`, never addressed records/Buffers. Export baseline, below-threshold, partial-chain, simultaneous-order, exhaustion, and `zeroTransferHistoryContrast`.

The history contrast reuses exactly the baseline A/B/C cell bodies and AB/BC couplings, but adds a declared A->C coupling with `transferAmount: 0`. Same addressed cell refs and final loads; one additional transfer event/history path.

- [ ] **Step 2: Replay and immutability test**

```ts
const before = structuredClone(SNAP_STATE_SPECIMEN.baseline);
const first = runSnapState(SNAP_STATE_SPECIMEN.baseline);
const second = runSnapState(SNAP_STATE_SPECIMEN.baseline);
assert.equal(first.declaration.ref, second.declaration.ref);
assert.deepEqual(first.events.map((e) => e.ref), second.events.map((e) => e.ref));
assert.equal(first.terminal.ref, second.terminal.ref);
assert.deepEqual(SNAP_STATE_SPECIMEN.baseline, before);
assert.ok(Object.isFrozen(SNAP_STATE_SPECIMEN));
```

- [ ] **Step 3: Same final projection, different history**

```ts
const base = runSnapState(SNAP_STATE_SPECIMEN.baseline);
const contrast = runSnapState(SNAP_STATE_SPECIMEN.zeroTransferHistoryContrast);
assert.deepEqual(base.terminal.body.finalLoads, contrast.terminal.body.finalLoads);
assert.notDeepEqual(base.terminal.body.eventRefs, contrast.terminal.body.eventRefs);
assert.notEqual(base.terminal.ref, contrast.terminal.ref);
```

- [ ] **Step 4: Prove ordered event refs are not normalized away**

Take a valid terminal with at least two events, reverse only `eventRefs`, re-address it, and require different identity:

```ts
const original = base.terminal;
const reversed = addressSnapStateRecord("terminal", {
  ...original.body,
  eventRefs: [...original.body.eventRefs].reverse(),
});
assert.notEqual(reversed.ref, original.ref);
```

- [ ] **Step 5: Prove below-threshold and partial-chain projections**

Below-threshold: no snap/active coupling. Partial chain: only A snapped; AB active; B remains below threshold; BC inactive.

- [ ] **Step 6: GREEN, commit**

```bash
npm run build && node --test .build/tests/snap-state-specimen.test.js
git add fixtures/snap-state/specimen.ts tests/snap-state-specimen.test.ts
git commit -m "test: freeze Snap-State v0.1 specimens"
```

---

### Task 7: Hostile representation and exact topology-envelope hardening

**Files:** modify `validate.ts`, `evaluate.ts`, `tests/snap-state-adversarial.test.ts`.

- [ ] **Step 1: RED accessor test with zero execution**

```ts
let calls = 0;
const hostile = {
  cellId: "A", threshold: 5, initialLoad: 0,
  get recoilAmount() { calls += 1; return 5; },
};
assert.throws(() => addressSnapStateRecord("cell", hostile as never), /SNAPSTATE_INVALID_REPRESENTATION/);
assert.equal(calls, 0);
```

Repeat with an accessor at numeric index 0 of `cells`.

- [ ] **Step 2: RED sparse/symbol/extra-property arrays**

```ts
const sparse = new Array(2); sparse[0] = validCell;
const extra = [validCell]; Object.defineProperty(extra, "surprise", { value: 1, enumerable: true });
const symbols = [validCell] as unknown as Record<symbol, unknown> & unknown[]; symbols[Symbol("x")] = 1;
```

All fail `SNAPSTATE_INVALID_REPRESENTATION`.

- [ ] **Step 3: RED addressed-envelope attacks**

Require exact errors:

```text
duplicate supplied addressed cell -> SNAPSTATE_DUPLICATE_CELL
duplicate supplied addressed coupling -> SNAPSTATE_DUPLICATE_COUPLING
cell/coupling declaration set mismatch -> SNAPSTATE_DECLARATION_INPUT_MISMATCH
coupling endpoint outside declared cells -> SNAPSTATE_UNDECLARED_CELL
excitation target outside declared cells -> SNAPSTATE_UNDECLARED_CELL
```

- [ ] **Step 4: Verify RED and complete defenses**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
```

Never `.map`, `.some`, spread, or iterate untrusted arrays before `dataArray` returns a trusted dense copy. Never read fields before `dataRecord` rejects accessors. Set equality is addressed-ref equality:

```ts
function sameRefSet(expected: readonly string[], actual: readonly string[]): boolean {
  const left = [...new Set(expected)].sort();
  const right = [...new Set(actual)].sort();
  return left.length === right.length && left.every((ref, i) => ref === right[i]);
}
```

- [ ] **Step 5: GREEN, commit**

```bash
npm run build && node --test .build/tests/snap-state-adversarial.test.js
git add src/snap-state/validate.ts src/snap-state/evaluate.ts tests/snap-state-adversarial.test.ts
git commit -m "fix: fail closed on hostile Snap-State topology"
```

---

### Task 8: Exact-head verification and handoff

**Files:** modify only for a defect proved by a new failing regression test. Do not publish GitBook proof before landing.

- [ ] **Step 1: Focused full Snap-State gate**

```bash
npm run build && node --test \
  .build/tests/snap-state.test.js \
  .build/tests/snap-state-adversarial.test.js \
  .build/tests/snap-state-specimen.test.js
```

Expected: zero failures.

- [ ] **Step 2: Compile and repository gate**

```bash
npm run check
npm run verify:all
```

Expected: TypeScript compile, Node/TypeScript tests, Python fixture verification, and conformance CLI all PASS. Record actual test counts from the exact head.

- [ ] **Step 3: Exact-diff invariant review**

Every answer must be **no**:

```text
Can an event introduce undeclared topology?
Can active state mutate the declaration?
Can a cell snap twice?
Can exhaustion leave unrecorded mutation?
Can ordering depend on insertion/async timing?
Can validation execute a hostile accessor?
Can set normalization reorder event history?
Can threshold crossing imply authority/truth/policy?
Can recoil erase prior snap history?
Can a second canonicalizer/hasher appear?
```

Verify `src/l-branch/`, ontology kinds, and canonical receipt unions are unchanged.

- [ ] **Step 4: If verification finds a defect, run a fresh RED -> GREEN microcycle**

Write the narrow regression test first, observe failure, apply the minimum correction, rerun focused tests, then rerun `npm run verify:all`. No empty reconciliation commit.

- [ ] **Step 5: PR/review handoff evidence**

Record:

```text
implementation head SHA
commands actually run
actual test count and pass/fail from npm run verify:all
focused Snap-State result
src/l-branch unchanged confirmation
ontology/receipt-union unchanged confirmation
remaining v0.2 questions from the spec
```

Then run the requested Riqor evidence/reviewer, Develoop review loop, and PR Completion workflow. After the executable PR lands, GitBook may publish a project-backed Frontier projection naming Project 0 as implementation authority.
