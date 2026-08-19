# Snap-State v0.1 — Thresholded Topology Design

## Status

Approved design direction for a new experimental Project 0 primitive. This document fixes the smallest Project 0-owned contract for **thresholded topology / snap-state mechanics**: local load may cross a declared threshold, causing a bounded state transition that changes which already-declared couplings are active, while the structural envelope remains immutable and event history remains append-only.

Snap-State is an architectural sibling of L-Branch v0.1, not an extension or rewrite of it. It does not alter Project 0's frozen nine-kind ontology, add a universal relationship kind, or create a scheduler, autonomous runtime, model loop, physics engine, or product-specific effect system.

## Design sentence

> Active topology may change inside a declared structural envelope. Recoil may restore current material state; history does not recoil.

Human-facing compression:

> Beetle stores the shape. Bumblebee makes the shape ring. Cicada lets the shape change how it can ring after a threshold is crossed.

The biological image is design lineage only. Project 0 does not depend on literal cicada biomechanics. The portable systems claim is narrower: **stored local load may cross a declared threshold, cause one attributable snap, activate only predeclared couplings, transfer bounded load, and recoil without erasing the snap from history.**

## Why this is separate from L-Branch

L-Branch v0.1 proves bounded propagation through a fixed declared candidate topology:

```text
admitted excitation
  -> candidate eligibility
  -> step record
  -> new local evidence
  -> next eligible step
  -> explicit terminal record
```

Its responsibility is bounded propagation. Snap-State answers a different question:

> What if one fixed structural envelope contains multiple possible active configurations, and crossing a local threshold changes which declared configuration is currently conducting?

That requires three state layers that must remain mechanically distinct:

```text
declared topology envelope
        !=
active topology projection
        !=
append-only event history
```

L-Branch remains the primitive for bounded candidate propagation. Snap-State remains the primitive for deterministic threshold crossings and active-coupling changes inside a predeclared envelope. A later composition may connect them explicitly; neither absorbs the other in v0.1.

## Relationship to Resonant Tension issue #30

Issue #30 owns deterministic resonant-tension evaluation: preserving tension, dissent, provenance, disclosure boundaries, and unresolved remainder without manufacturing authority or forcing adoption.

Snap-State is not a semantic resonance evaluator. Its first proof is deliberately mechanical:

- safe-integer local loads;
- safe-integer thresholds;
- safe-integer transfer amounts;
- finite addressed cells and couplings;
- deterministic event ordering;
- finite event budget;
- explicit settling or exhaustion.

Issue #30 remains independently versioned and independently implementable.

## Ownership boundary

Project 0 owns:

- versioned Snap-State record semantics;
- the declared-topology / active-topology distinction;
- deterministic threshold crossing;
- bounded coupling activation;
- append-only excitation/snap/transfer/recoil history;
- finite termination;
- canonical experimental addressing using the existing Project 0 canonicalizer;
- adversarial fixtures proving undeclared topology cannot emerge.

Project 0 does not own:

- continuous physics;
- visual wing simulation;
- audio DSP;
- musical or emotional meaning of load;
- creative scoring;
- model interpretation;
- rendering/UI;
- autonomous scheduling;
- product-specific snap effects.

A downstream adapter may map a domain quantity into integer excitation only through an explicit versioned mapping.

## Considered approaches

### A. Extend L-Branch v0.1/v0.2

Rejected for this slice. Adding load accumulation, structural state, snap, recoil, and active coupling to L-Branch would bundle two independent responsibilities.

### B. Prove it first in Haunted Toaster

Rejected as the first proof. A Toaster embodiment could be useful, but aesthetic behavior should not become the implicit cross-project contract before the deterministic structural distinction is executable.

### C. Add a sibling experimental Snap-State module

Selected. Add a fixture-sized deterministic module parallel to `src/l-branch/`, with versioned records, fail-closed validation, pure evaluation, canonical addressing, focused tests, and no runtime infrastructure.

## Governing invariant

> A snap may change active state only among structures already declared in the envelope. It may not invent a cell, coupling, threshold, transfer law, participant, authority, policy, or scope.

For every reachable state in v0.1:

```text
current_cells = declared_cells
active_couplings subset-of declared_couplings
```

The possibility envelope is immutable. Only its active projection changes.

## Experimental protocol and address domain

Machine protocol:

```text
p0.snap-state/0.1
```

Experimental canonical domain:

```text
Project0-SnapState-v0.1|
```

All Snap-State records use:

```text
ssr-<64 lowercase hex digest>
```

These are **experimental addressed records**, not additions to the frozen canonical `ReceiptType` family.

The record types are exactly:

```ts
type SnapStateRecordTypeV01 =
  | "cell"
  | "coupling"
  | "excitation"
  | "declaration"
  | "event"
  | "terminal";
```

Every record is addressed with the existing Project 0 canonicalization/hash path. No second serializer or hasher is permitted.

## Input records

### Cell

```ts
export type SnapCellV01 = {
  cellId: string;
  threshold: number;
  initialLoad: number;
  recoilAmount: number;
};
```

Rules:

- `cellId` is a non-empty local label, not the canonical address;
- `threshold` is a positive safe integer;
- `initialLoad` and `recoilAmount` are non-negative safe integers;
- the addressed cell ref is derived from the complete cell body.

Changing a threshold, starting load, or recoil amount therefore changes the cell address.

### Coupling

```ts
export type SnapCouplingV01 = {
  couplingId: string;
  fromCellRef: string;
  toCellRef: string;
  transferAmount: number;
  activation: "on-source-snap";
};
```

Rules:

- `fromCellRef` and `toCellRef` must be addressed cell refs in the declaration;
- `transferAmount` is a non-negative safe integer;
- v0.1 supports only `on-source-snap`;
- a coupling conducts at most once in a run because its source cell snaps at most once.

### Excitation

```ts
export type SnapExcitationV01 = {
  excitationId: string;
  targetCellRef: string;
  amount: number;
};
```

Rules:

- `targetCellRef` must be a declared addressed cell ref;
- `amount` is a non-negative safe integer;
- one run has exactly one addressed excitation record in v0.1.

This resolves excitation deterministically: no fixture lookup, ambient mapping, callback, or external resolver is part of the executable contract.

## Declaration

```ts
export const SNAP_STATE_PROTOCOL_VERSION = "p0.snap-state/0.1" as const;

export type SnapStateBudgetV01 = {
  maxEvents: number;
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
```

`cellRefs` and `couplingRefs` are set-like and normalize to sorted unique order for addressing. `excitationRef` must equal the addressed excitation record supplied to execution.

Because the declaration references addressed cell, coupling, and excitation records, its identity binds the full mechanical input state without embedding duplicate mutable definitions.

`maxEvents` is a positive safe integer. Budget changes require a new declaration and therefore a new declaration address.

## Event and terminal records

### Event

```ts
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
```

Meanings:

- `excitation`: applies the declared excitation amount to the target cell;
- `snap`: records that a cell crossed threshold and activates its declared outgoing couplings;
- `transfer`: applies one declared coupling's transfer amount to its target;
- `recoil`: reduces the snapped source cell by its declared recoil amount, clamped at zero.

`sourceEventRef` preserves explicit causal lineage. Transfer and recoil events cite the snap that caused them. A snap cites the load-changing event that made the cell threshold-eligible.

### Terminal

```ts
export type SnapStateTerminalDispositionV01 =
  | "settled"
  | "exhausted";

export type SnapStateTerminalRecordV01 = {
  declarationRef: string;
  disposition: SnapStateTerminalDispositionV01;
  eventRefs: string[];
  snappedCellRefs: string[];
  finalLoads: Record<string, number>;
  activeCouplingRefs: string[];
  remainingBudget: SnapStateBudgetV01;
};
```

Malformed or unsupported input is **not** represented as an `inadmissible` terminal because no trustworthy addressed declaration may exist. Validation fails before execution with a stable `SnapStateValidationError` code. This matches the principle that invalid source representation must not be canonized merely to describe its invalidity.

`eventRefs` are ordered history and must never be sorted during normalization. `snappedCellRefs` and `activeCouplingRefs` are set-like terminal projections and normalize by sorted uniqueness.

## Execution interface

The pure evaluator should have an explicit shape equivalent to:

```ts
runSnapState({
  declaration,
  cells,
  couplings,
  excitation,
}) -> {
  declaration,
  inputs,
  events,
  terminal,
}
```

Execution performs these steps before any state mutation:

1. validate all raw representations without executing accessors;
2. address every cell, coupling, and excitation record;
3. verify that declaration refs exactly match the supplied addressed inputs;
4. verify every coupling endpoint belongs to `cellRefs`;
5. address the declaration;
6. initialize current loads from addressed cells;
7. initialize snapped cells and active couplings as empty;
8. initialize ordered event history as empty.

No hidden mutable state or resolver is required for deterministic replay.

## Atomic event admission

The event budget is an admission boundary, not a counter updated after mutation.

Before every state-changing event:

1. determine the next event from current addressed state;
2. if no event budget remains, stop as `exhausted` **without applying its mutation**;
3. construct and address the event record;
4. append the event ref;
5. only then apply the event's declared current-state mutation;
6. decrement remaining budget.

Therefore no current-state change can exist without a corresponding addressed event.

## Deterministic ordering

A cell snaps at most once in one v0.1 run.

After each load-changing event, collect every declared unsnapped cell whose current load is greater than or equal to its threshold. If more than one is eligible, process by:

```text
addressed cellRef lexicographic ascending
```

For one snapped source, outgoing active couplings are processed by:

```text
addressed couplingRef lexicographic ascending
```

These rules are fixed by v0.1 and identified by `orderingRule: "cell-ref-lexicographic"`.

No wall clock, async completion order, object insertion order, randomness, or scheduler timing may affect replay.

## Snap / transfer / recoil semantics

For one eligible unsnapped cell:

1. admit and record `snap`;
2. mark the cell snapped;
3. mark all of its declared `on-source-snap` outgoing couplings active;
4. for each outgoing coupling in canonical coupling-ref order, admit and record `transfer`, then add its amount to the target cell;
5. admit and record one `recoil`, then set:

```text
load_after = max(0, load_before - recoilAmount)
```

6. reevaluate threshold eligibility after every load-changing transfer/recoil event.

Activation itself is the declared consequence of the already-recorded snap; it does not mint a new coupling identity.

If budget exhaustion occurs after a snap but before one transfer/recoil, the snap and resulting active-coupling projection remain historical/current facts, while the unadmitted later event does not occur.

## Historical irreversibility without material irreversibility

The central v0.1 proof is:

```text
current projection:
rest -> loaded -> snapped -> recoiled -> rest-like

history:
excitation -> snap -> transfer(s) -> recoil -> permanently retained lineage
```

Returning to a previous load does not return to an equivalent history.

Two executions may end with identical `finalLoads` but different ordered `eventRefs`; they remain different addressed histories.

Recoil may restore current load. It may never delete, replace, reorder, or rewrite a prior snap event.

## First frozen specimen

Use exactly three addressed cells and two addressed couplings:

```text
A --AB--> B --BC--> C
```

Cell bodies:

```text
A: threshold 5, initialLoad 0, recoilAmount 5
B: threshold 7, initialLoad 4, recoilAmount 7
C: threshold 6, initialLoad 2, recoilAmount 6
```

Couplings:

```text
AB: A -> B, transferAmount 3
BC: B -> C, transferAmount 4
```

Excitation:

```text
+5 -> A
```

Expected conceptual path:

```text
excitation A: 0 -> 5
A snap
AB active
transfer AB: B 4 -> 7
A recoil: 5 -> 0
B snap
BC active
transfer BC: C 2 -> 6
B recoil: 7 -> 0
C snap
C recoil: 6 -> 0
settled
```

Terminal projection:

```text
snappedCellRefs = [A, B, C] by addressed ref order
activeCouplingRefs = [AB, BC] by addressed ref order
finalLoads = { A: 0, B: 0, C: 0 } keyed by addressed cell refs
```

The proof is not merely that a cascade happened. It is that **current loads can return to baseline while the append-only event path permanently distinguishes the run from a run in which no snap occurred.**

## Contrasting fixtures

### Below threshold

Excitation `+4 -> A`.

Expected: one excitation event, no snap, no active coupling, terminal `settled`.

### Partial chain

Lower B's initial load so A snaps and transfers to B but B remains below threshold.

Expected: A snapped; AB active; B loaded; B unsnapped; BC inactive; terminal `settled`.

### Simultaneous eligibility

Construct a declared fixture where one transfer makes two unsnapped cells threshold-eligible at once.

Expected: snap order follows addressed `cellRef` lexicographic order and produces stable event refs on repeat execution.

### Exhaustion

Use the baseline specimen with a budget that ends between two required events.

Expected: terminal `exhausted`; no mutation associated with the unadmitted event; replay of declaration + addressed inputs + ordered events reproduces the same partial current state.

### Same final load, different history

Create two lawful runs with identical final loads but distinct snap paths.

Expected: distinct ordered event histories and distinct terminal addresses.

## Validation and fail-closed representation

Validation must reject hostile representation without executing getters/accessors. Reuse the defensive descriptor-based patterns already established by Project 0.

At minimum reject:

- non-plain objects;
- unknown fields;
- unsupported protocol versions;
- unsupported ordering rules;
- empty required identifiers;
- non-safe integers;
- negative loads/transfers/recoil;
- zero or negative thresholds;
- zero or negative event budgets;
- duplicate cell/coupling input identities;
- declaration refs not matching supplied addressed inputs;
- undeclared excitation target;
- coupling endpoints outside the declared cell set;
- sparse arrays;
- accessor-bearing arrays or nested objects;
- symbol keys or unexpected own properties;
- malformed `ssr-...` refs;
- record/address mismatches.

Suggested stable error families:

```text
SNAPSTATE_INVALID_REPRESENTATION
SNAPSTATE_UNKNOWN_FIELD
SNAPSTATE_PROTOCOL_UNSUPPORTED
SNAPSTATE_ORDERING_UNSUPPORTED
SNAPSTATE_INVALID_BUDGET
SNAPSTATE_INVALID_CELL
SNAPSTATE_INVALID_COUPLING
SNAPSTATE_INVALID_EXCITATION
SNAPSTATE_DUPLICATE_INPUT
SNAPSTATE_UNDECLARED_CELL
SNAPSTATE_UNDECLARED_COUPLING
SNAPSTATE_REFERENCE_MISMATCH
```

Exact error-code subdivision may be refined during the implementation plan, but the failure distinctions above may not be collapsed into permissive fallback behavior.

## Authority and disclosure boundary

The v0.1 specimen is local and fixture-backed. It does not consume authority or cross disclosure scopes.

This is deliberate: Snap-State proves structural state transition, not execution capability.

A threshold crossing, snap, coupling activation, transfer, recoil, or successful cascade **never creates authority**. If a later product uses Snap-State evidence to request an external side effect, that side effect must pass through an independently admitted authority boundary.

## No hidden semantics in `load`

`load` is an abstract deterministic safe integer in Project 0 v0.1. It does not inherently mean force, charge, musical energy, emotional intensity, legal weight, confidence, probability, truth, or authority.

A downstream mapping must declare its own domain meaning and version boundary.

## TDD sequence

Implementation should proceed RED -> GREEN in these bounded slices:

1. **Contract/addressing RED** — module absent; require protocol, record types, addressing domain, set normalization, and verification.
2. **Contract/addressing GREEN** — implement types, validators, addressing, exports.
3. **Below-threshold RED/GREEN** — excitation changes load but no snap occurs.
4. **One-snap RED/GREEN** — exact threshold emits snap, activates declared coupling, transfers, recoils, retains history.
5. **Cascade RED/GREEN** — A causes B causes C with no external command or undeclared topology.
6. **History/recoil RED/GREEN** — final baseline load does not erase snap lineage.
7. **Simultaneous-order RED/GREEN** — addressed cell refs fix snap ordering.
8. **Exhaustion RED/GREEN** — budget admission prevents hidden mutation after exhaustion.
9. **Hostile-input RED/GREEN** — sparse/accessor inputs fail closed without execution.
10. **Frozen specimen RED/GREEN** — canonical fixture identities and terminal record are repeatable and source fixtures remain unchanged.

Broad gate:

```bash
npm run verify:all
```

No model, network, database, queue, scheduler, UI, physics library, or second canonicalizer may be introduced.

## Required acceptance evidence

The first implementation must mechanically prove all of the following:

1. below-threshold excitation produces no snap;
2. exact threshold crossing produces exactly one snap for that cell;
3. a cell snaps at most once per v0.1 run;
4. a snap activates only predeclared couplings from that cell;
5. undeclared cells/couplings never appear;
6. transfer can make another declared cell threshold-eligible;
7. recoil changes current state without deleting event history;
8. identical final loads with different histories remain distinguishable;
9. simultaneous eligibility uses deterministic addressed-ref ordering;
10. identical canonical inputs replay to identical declaration/event/terminal refs;
11. exhaustion is distinct from settling;
12. no state mutation occurs without a corresponding admitted addressed event;
13. source input records remain unchanged after execution;
14. set-like declaration refs canonicalize independent of source array order;
15. ordered event refs preserve execution order and are not sorted;
16. hostile getters/accessors are rejected without execution;
17. sparse arrays and unexpected own properties fail closed;
18. no Project 0 canonical node, relationship, receipt, NAV, World Encounter, L-Branch, or issue #30 contract is changed;
19. verification remains offline and deterministic;
20. the exact implementation head passes `npm run verify:all`.

## Compatibility and migration

The v0.1 effect is additive and experimental. Existing canonical records require no migration.

Stop and require a separate version-boundary/ADR decision if implementation appears to require:

- a tenth universal node kind;
- a new universal relationship kind;
- mutation of L-Branch v0.1;
- reinterpretation of `authorityRefs` or `influenceRefs`;
- a second canonicalizer/hasher;
- floating-point canonical identity;
- a scheduler or autonomous loop;
- hidden model inference in deterministic verification;
- product-specific visual/audio semantics in Project 0.

## Downstream adoption after proof

Only after the deterministic Project 0 specimen lands should products adopt the primitive.

Potential later embodiments:

- **Haunted Toaster** — bounded integer evidence can excite visual topology cells; a snap activates an alternate predeclared visual coupling; recoil allows return while the render receipt preserves lineage.
- **Haunted Phonograph** — motif/rhythm/harmony adapters can excite declared musical cells and preserve exact mutation lineage.
- **TranchNode** — possible thresholded continuity/reconstruction experiments only after an explicit compatible version boundary exists.
- **Corpus OS / NAV** — snap history may become witnessable evidence or attention-shaping influence, never authority merely because a threshold was crossed.

## GitBook projection rule

Before executable proof, GitBook may represent Snap-State only as **Frontier / approved design**. After a deterministic Project 0 specimen lands, GitBook may project the field law with exact issue/PR/commit evidence and Project 0 named as implementation authority.

Do not promote Snap-State into a universal Static Collective Pattern on design strength alone. A later Pattern promotion should require landed Project 0 proof plus independent downstream evidence.

## Security review focus

Reviewers should challenge these questions directly:

1. Can an event introduce topology absent from the declaration?
2. Can active-state change mutate the declared envelope?
3. Can any cell snap twice in v0.1?
4. Can exhaustion leave unrecorded state mutation?
5. Can simultaneous eligibility become order-dependent on runtime timing?
6. Can hostile accessors execute during validation/normalization?
7. Can set normalization erase ordered history?
8. Can snap or threshold status accidentally imply authority, truth, confidence, or policy standing?
9. Can recoil erase prior snap history?
10. Can any second identity/canonicalization path appear?

Any yes answer is a design violation.

## Definition of done

The first implementation is complete only when:

- `src/snap-state/` exposes one experimental versioned module;
- cell/coupling/excitation/declaration/event/terminal records are fail-closed and deterministically addressed;
- the three-cell frozen specimen proves the cascade;
- below-threshold, partial-chain, simultaneous-order, exhaustion, and same-final-load/different-history fixtures pass;
- recoil restores current load without historical erasure;
- undeclared topology cannot emerge;
- hostile representations fail closed without getter execution;
- L-Branch and issue #30 remain unchanged;
- the exact implementation head passes `npm run verify:all`;
- PR review explicitly checks declared topology vs active topology vs event history;
- any GitBook projection cites Project 0 as implementation authority and preserves unresolved fog.

## Residual fog

Deliberately deferred beyond v0.1:

- repeated snaps by one cell;
- coupling deactivation;
- mutable thresholds;
- multiple excitation records in one run;
- recoil profiles beyond safe-integer subtraction;
- continuous time, frequency, velocity, or other physical models;
- stochastic or probabilistic behavior;
- exact mechanical composition with L-Branch;
- how issue #30 semantic resonance might lawfully produce a Snap-State excitation;
- whether independent downstream specimens eventually justify promotion to a portable Pattern.

None is a blocker for v0.1.

## Final invariant

> **The system may change which declared paths are active because a declared local threshold was crossed, but it may never pretend that the resulting current state erases the path by which it got there.**
