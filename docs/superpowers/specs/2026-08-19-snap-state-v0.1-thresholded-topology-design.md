# Snap-State v0.1 — Thresholded Topology Design

## Status

Approved design direction for a new experimental Project 0 primitive. This document specifies the smallest Project 0-owned contract for **thresholded topology / snap-state mechanics**: a declared structure whose active coupling may change when local accumulated load crosses a deterministic threshold, while declared bounds remain fixed and event history remains append-only.

This is an architectural sibling of L-Branch v0.1, not an extension or rewrite of it. It does not alter Project 0's frozen nine-kind ontology, does not add a universal relationship kind, and does not create a scheduler, autonomous runtime, model loop, or product-specific effect system.

## Design sentence

> Active topology may change inside a declared structural envelope. Recoil may restore material state; history does not recoil.

Human-facing compression:

> Beetle stores the shape. Bumblebee makes the shape ring. Cicada lets the shape change how it can ring after a threshold is crossed.

The biological image is design lineage only. Project 0 does not depend on literal cicada biomechanics. The useful systems pattern is narrower: **stored local load may cross a declared threshold, cause a bounded state transition, change which already-declared couplings are active, and later recoil without erasing the transition from history.**

## Why this is separate from L-Branch

L-Branch v0.1 already proves bounded propagation through a fixed declared candidate topology:

```text
admitted excitation
  -> candidate eligibility
  -> step record
  -> new local evidence
  -> next eligible step
  -> explicit terminal record
```

Its key law is that propagation may continue without a new external command for every micro-step, while authority, policy, participants, and work budget remain bounded by the declaration.

Snap-State answers a different question:

> What if the structure itself has multiple predeclared active configurations, and crossing a local threshold changes which configuration is currently conducting?

That is not merely another eligibility predicate. It introduces three distinct state layers that must remain mechanically separate:

```text
declared topology envelope
        !=
active topology state
        !=
append-only event history
```

L-Branch should remain the primitive for bounded propagation through declared candidates. Snap-State should remain the primitive for deterministic threshold crossings that alter active coupling inside a predeclared structural envelope.

A later composition may allow L-Branch to consume Snap-State evidence, or Snap-State to use an L-Branch result as excitation. Neither primitive should absorb the other in v0.1.

## Relationship to Resonant Tension issue #30

Issue #30 owns the separate executable line for deterministic resonant-tension evaluation. That evaluator preserves disagreement, provenance, disclosure boundaries, and unresolved remainder while refusing to manufacture authority or force adoption.

Snap-State is not a semantic resonance evaluator. It should not answer whether two claims, motifs, interpretations, or tensions resonate.

Its first slice is deliberately mechanical:

- integer local load;
- integer thresholds;
- integer transfer amounts;
- finite predeclared cells;
- finite predeclared couplings;
- deterministic event ordering;
- explicit settling/exhaustion.

Issue #30 remains independently implementable and independently versioned.

## Classification and ownership boundary

This is an architectural addition above ontology v0.1 because it defines a portable process contract that downstream products may later implement.

Project 0 owns:

- the versioned declaration boundary;
- the distinction between declared and active topology;
- deterministic threshold crossing semantics;
- bounded coupling activation semantics;
- append-only snap/recoil/terminal evidence;
- finite termination rules;
- canonical addressed records under an experimental domain;
- adversarial fixtures proving no undeclared topology can emerge.

Project 0 does not own:

- visual wing simulation;
- continuous physics;
- audio DSP;
- creative scoring;
- model interpretation;
- music analysis;
- UI animation;
- video rendering;
- autonomous scheduling;
- product-specific meanings of load, threshold, snap, recoil, or coupling.

Downstream systems may map their own domain quantities into the primitive only after the deterministic contract exists.

## Considered approaches

### A. Extend L-Branch to v0.2

Add threshold accumulation, active coupling state, snap events, and recoil directly to L-Branch.

Rejected for v0.1. L-Branch currently has one coherent responsibility: bounded propagation through declared candidates. Adding structural state transitions would bundle propagation mechanics and topology mechanics into one primitive and make both harder to reason about.

### B. Implement the idea first in Haunted Toaster

Treat musical energy as load, visual topology modes as cells/couplings, and let a render cross thresholds into alternate visual configurations.

Rejected as the first proof. This would produce useful aesthetic behavior but would not prove the portable distinction between declared topology, active topology, and historical event state. Product behavior would become the de facto contract before the contract is mechanically clear.

### C. Add a sibling experimental Snap-State module

Create one fixture-sized deterministic module parallel to `src/l-branch/`, with versioned declaration/cell/coupling/event/terminal records, pure evaluation, canonical addressing, fail-closed validation, and no runtime infrastructure.

Selected. This preserves the semantic boundary and makes later composition explicit rather than accidental.

## Core law

The Snap-State primitive has one governing constraint:

> A snap may change active state only among modes already declared in the structural envelope. A snap may not invent a new cell, coupling, threshold, transfer law, participant, authority, policy, or scope.

In v0.1:

```text
active_topology(t) subset-of declared_topology_envelope
```

At every event:

```text
cells_after = cells_declared
couplings_after subset-of couplings_declared
```

The set of possible structural relationships is fixed before excitation begins. What changes is which declared relationships are active.

## Three state layers

### 1. Declared topology envelope

The immutable declaration names the complete structural possibility space for one run:

- protocol/version;
- snapshot reference;
- excitation reference;
- purpose reference;
- evaluator identity/version;
- fixed cell definitions;
- fixed coupling definitions;
- deterministic ordering law;
- finite event budget;
- optional policy/disclosure references when external evidence is represented;
- no product-specific hidden state.

The declaration itself is content-addressed.

### 2. Active topology state

The current state is a deterministic projection of the declaration plus append-only prior events.

A cell may be in one of a small finite v0.1 states:

```text
rest
loaded
snapped
recoiled
```

These are runtime dispositions, not new Project 0 node kinds.

A coupling may be inactive or active according to a predeclared activation rule.

No mutation of the declaration is required to represent active-state change.

### 3. Event history

Every threshold crossing that changes active state produces an append-only addressed event record.

A later recoil may return the cell to a baseline material disposition, but the previous snap event remains part of history.

This distinction is intentional:

```text
material/current state may return
historical state only grows
```

That is the central proof target for v0.1.

## Proposed experimental protocol

The machine identifier should be:

```text
p0.snap-state/0.1
```

The canonical addressing domain should be distinct from Project 0 canonical receipts and from L-Branch experimental addresses:

```text
Project0-SnapState-v0.1|
```

Address refs should use a distinct prefix:

```text
ssr-<64 lowercase hex digest>
```

These are experimental addressed records, not additions to the frozen canonical `ReceiptType` family.

## Proposed contracts

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

1. validate the execution wrapper and all raw representations without executing accessors;
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

After each completed snap package, collect every declared unsnapped cell whose current load is greater than or equal to its threshold. If more than one is eligible, process by:

```text
addressed cellRef lexicographic ascending
```

For one snapped source, outgoing active couplings are processed by:

```text
addressed couplingRef lexicographic ascending
```

A v0.1 **snap package** is processed without interleaving another cell's snap:

```text
source snap
  -> all declared outgoing transfers in coupling-ref order
  -> source recoil
  -> recompute the global eligible-cell frontier
```

This package ordering matches the frozen baseline specimen (`A snap -> AB transfer -> A recoil -> B snap`) and makes recoil part of the same local structural transition that activated the source's couplings. A future profile that permits a newly thresholded neighbor to interleave before source recoil requires a new explicit version/ordering rule; it is not silently equivalent to v0.1.

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

6. after the snap package completes, reevaluate threshold eligibility using the deterministic global cell-ref ordering rule.

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
excitation +5 -> A
A SNAP
AB activates / transfers +3 -> B
A recoil -> 0
B SNAP
BC activates / transfers +4 -> C
B recoil -> 0
C SNAP
C recoil -> 0
settled
```

Expected historical facts:

```text
snappedCellRefs = [A, B, C]
activeCouplingRefs = [AB, BC]
finalLoads = { A: 0, B: 0, C: 0 }
```

The important proof is that **the material load projection returns to baseline while historical state proves that three threshold transitions occurred and two couplings activated.**

## Required contrasting fixtures

### Below-threshold fixture

Excitation `+4` to A.

Expected:

- one excitation event;
- no snap;
- no active coupling;
- no transfer;
- terminal `settled`;
- all declared topology remains available but inactive.

### Partial-chain fixture

Use a smaller B initial load so A snaps and transfers to B, but B remains below threshold.

Expected:

- A snaps;
- AB activates;
- B receives transfer;
- B does not snap;
- BC remains inactive;
- terminal `settled`.

### Exhaustion fixture

Use the baseline specimen with an event budget that ends after a snap but before one required transfer or recoil event.

Expected:

- terminal `exhausted`;
- no unrecorded state mutation beyond the last addressed event;
- replay from declaration + event ledger yields the exact same partial current state.

## Historical irreversibility without material irreversibility

The primitive must make this distinction explicit:

```text
current material projection:
rest -> loaded -> snapped -> recoiled -> rest-like

historical projection:
no event -> excitation -> snap -> transfer -> recoil -> permanent append-only lineage
```

Returning to an equivalent current load does not mean returning to an equivalent world history.

Two runs may therefore end with identical final loads but different histories and must remain independently addressable.

This directly preserves Project 0's broader no-silent-rewrite and stable-identity laws.

## Identity and canonicalization

Snap-State must reuse Project 0's existing canonical serialization/hash path. It must not introduce a second serializer or hashing implementation.

Addressing should follow the same experimental pattern used by L-Branch:

```text
canonicalizeDomainValue(
  "Project0-SnapState-v0.1|",
  { recordType, body: normalizedBody }
)
```

Set-like arrays in declarations and terminal records should be normalized with sorted uniqueness before addressing where semantics are set-like.

Ordered event refs must preserve execution order and must not be sorted.

A record verifier must reject malformed refs and hash mismatches.

## Representation and validation rules

Validation must fail closed and must not execute hostile getters/accessors, including accessors on the top-level execution wrapper.

The implementation should follow the defensive patterns already established in Project 0's L-Branch and World Encounter validators.

At minimum reject:

- non-plain objects;
- unknown fields;
- unsupported protocol versions;
- unsupported ordering rules;
- empty required strings;
- non-safe integers;
- negative loads or transfers;
- zero/negative thresholds;
- zero/negative event budgets;
- duplicate supplied addressed cell refs;
- duplicate supplied addressed coupling refs;
- declaration/input identity mismatch;
- undeclared coupling endpoints;
- sparse arrays;
- arrays with symbol keys or unexpected own properties;
- accessors in the execution wrapper, arrays, or nested objects;
- cells/couplings supplied outside the declaration envelope.

Suggested stable error codes include:

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
SNAPSTATE_DUPLICATE_CELL
SNAPSTATE_DUPLICATE_COUPLING
SNAPSTATE_DECLARATION_INPUT_MISMATCH
SNAPSTATE_UNDECLARED_CELL
```

Exact names may be refined during implementation if the semantic distinctions remain stable.

## Authority and disclosure boundary

The first v0.1 fixture should not require authority consumption or cross-scope access. It should remain purely local and fixture-backed.

That is intentional: the primitive being proven is structural state transition, not execution capability.

If future embodiments use privileged external material, they must compose with existing Project 0 authority/disclosure contracts rather than adding ambient authority to Snap-State.

A threshold crossing itself can never create authority.

A coupling activation itself can never create authority.

A successful chain itself can never create authority.

If an implementation requires executable capability to perform a downstream side effect, that side effect belongs behind an independently admitted authority boundary.

## No hidden semantics in "load"

Project 0 must treat `load` as an abstract deterministic integer quantity in v0.1.

It does not mean, by itself:

- physical force;
- electrical charge;
- musical energy;
- emotional intensity;
- legal weight;
- confidence;
- model probability;
- authority;
- semantic truth.

A downstream adapter may define a domain mapping, but the adapter must remain explicit and versioned.

This prevents a useful mechanical metaphor from silently becoming a universal measurement claim.

## TDD / executable specimen strategy

Implementation should use strict RED -> GREEN increments.

### RED 1 — contract absent

Add a focused test that imports the not-yet-existing Snap-State module and requires:

- protocol constant `p0.snap-state/0.1`;
- valid three-cell declaration;
- distinct experimental domain prefix;
- deterministic declaration address;
- set-like declaration arrays normalize canonically.

Expected RED: module does not exist.

### GREEN 1 — contract and addressing

Implement only types, fail-closed validators, canonical addressing, and public exports.

### RED 2 — below-threshold settling

Require a `+4` excitation to A to produce an excitation event, no snap, no transfer, no active coupling, and terminal `settled`.

### GREEN 2 — load and threshold evaluation

Implement only enough deterministic state handling to satisfy the fixture.

### RED 3 — one snap and coupling activation

Require `+5` to A to cross A's threshold, emit one snap, activate AB, transfer `+3` to B, recoil A, and preserve A's snap history.

### GREEN 3 — snap / transfer / recoil

Implement the minimum event chain.

### RED 4 — neighboring threshold propagation

Use the primed B/C baseline fixture. Require A snap -> B snap -> C snap without any undeclared coupling or external command.

### GREEN 4 — deterministic local cascade

Add deterministic queue/ordering logic with no scheduler or async runtime.

### RED 5 — history survives recoil

Require final loads to return to baseline while snapped cell refs and event history remain complete and addressed.

### GREEN 5 — terminal reconstruction

Implement terminal projection from event history.

### RED 6 — simultaneous threshold ordering

Create a fixture where two cells become threshold-eligible from one preceding event. Require lexicographic `cellRef` ordering and stable event refs.

### GREEN 6 — explicit ordering law

Implement only the fixed v0.1 rule.

### RED 7 — finite exhaustion

Use a too-small `maxEvents`. Require `exhausted`, no hidden mutation after the last recorded event, and deterministic replay of the partial run.

### GREEN 7 — bounded event budget

Implement exact event-budget admission.

### RED 8 — hostile representation

Add accessor-bearing and sparse-array fixtures for the execution wrapper, declaration, cells, and coupling arrays. Require fail-closed validation without executing hostile getters.

### GREEN 8 — defensive validator completion

Reuse existing descriptor-based defensive patterns.

### Broad gate

```bash
npm run verify:all
```

must pass offline with no model, network, database, queue, scheduler, UI, physics library, or second canonicalizer.

## Required adversarial acceptance fixtures

1. below-threshold excitation produces no snap;
2. exact threshold crossing produces exactly one snap for that cell;
3. a snapped source activates only couplings already declared from that source;
4. undeclared cells and couplings can never appear in current or terminal state;
5. transfer can cause a neighboring declared cell to cross threshold;
6. a cell snaps at most once per v0.1 run;
7. recoil changes current load without deleting snap history;
8. identical final loads with different event histories remain independently addressable;
9. simultaneous threshold crossings use deterministic declared ordering;
10. identical canonical inputs replay to identical declaration, event, and terminal refs;
11. event budget exhaustion is distinct from settled termination;
12. no mutation may occur after budget exhaustion without a corresponding event record;
13. source fixtures remain unchanged after execution;
14. reordering set-like declaration arrays does not change declaration identity;
15. reordering ordered event refs is not canonicalized away;
16. coupling endpoints outside the declared cell set fail closed;
17. hostile getters/accessors are rejected without execution, including the execution wrapper;
18. sparse arrays and unexpected own properties fail closed;
19. no canonical Project 0 node kind, relationship kind, or receipt family is changed;
20. full verification remains offline and deterministic.

## Error handling and reconstruction

The evaluator should not throw for ordinary lawful terminal conditions. `settled` and `exhausted` are normal terminal dispositions represented in the terminal record.

Malformed declarations may be handled through a validation error before addressed execution begins. If the implementation chooses to materialize an `inadmissible` terminal record, it must do so without pretending that invalid unaddressable source bytes have a canonical declaration identity.

The implemented v0.1 boundary is stricter: malformed or unsupported input fails before addressed execution, so `inadmissible` is not a terminal disposition.

Reconstruction must be possible from:

```text
addressed declaration
+ addressed cell/coupling/excitation inputs
+ ordered event refs/events
= final current projection + complete historical path
```

No hidden mutable state may be required.

## Compatibility and migration

The intended v0.1 effect is additive and experimental.

No migration is required for:

- canonical Project 0 nodes;
- canonical relationships;
- canonical receipt families;
- NAV;
- World Encounter;
- L-Branch;
- Resonance Seed work;
- issue #30 Resonant Tension work.

If implementation appears to require any of the following, stop and create an explicit version-boundary/ADR decision before continuing:

- a tenth universal node kind;
- a new universal relationship kind;
- mutation of L-Branch v0.1 contracts;
- reinterpretation of `influenceRefs` or `authorityRefs`;
- a second canonicalizer or hasher;
- floating-point canonical identity rules;
- a scheduler or autonomous runtime;
- hidden model inference inside deterministic verification;
- product-specific visual/audio semantics in the Project 0 kernel.

## Downstream adoption after proof

Only after the deterministic Project 0 specimen exists should downstream products adopt the primitive.

### Haunted Toaster

Possible embodiment:

```text
musical/visual evidence
  -> domain adapter maps evidence to bounded integer excitation
  -> topology cell crosses threshold
  -> alternate predeclared visual coupling becomes active
  -> topology response changes
  -> recoil allows later visual return
  -> render receipt preserves the snap lineage
```

This could support temporary topology mutations without treating one global filter or topology as permanent state.

### Haunted Phonograph

Possible embodiment:

```text
motif/harmonic/rhythmic evidence
  -> bounded excitation
  -> local musical cell snaps
  -> predeclared transformation lane conducts
  -> downstream motif receives load
  -> resulting score keeps exact mutation lineage
```

### TranchNode / continuity experiments

Possible later use: thresholded local reconstruction or topology activation. This must remain speculative until TranchNode owns an explicit compatible version boundary.

### Corpus OS / NAV

A snap event may later be useful as witnessable history or attention-shaping evidence. It must not become authority merely because a threshold was crossed.

## GitBook projection rule

Before executable proof, GitBook may hold this only as **Frontier / approved design** if publication is useful.

After executable proof lands, GitBook may project the field law with exact Project 0 evidence and commit/PR lineage.

GitBook must not claim the primitive is a universal Static Collective Pattern merely because the design is compelling.

Promotion should require at least one landed deterministic Project 0 specimen and later independent downstream evidence if a portable Pattern is proposed.

## Security review focus

Reviewers should challenge these questions directly:

1. Can any event introduce a cell or coupling absent from the declaration?
2. Can active-state change mutate the declared topology envelope?
3. Can a cell snap twice in v0.1 through an accidental cycle?
4. Can event-budget exhaustion leave unrecorded state mutation?
5. Can simultaneous eligibility produce nondeterministic ordering?
6. Can a hostile accessor execute during validation or normalization, including on the execution wrapper?
7. Can set normalization erase execution ordering that should remain historical?
8. Can a threshold crossing accidentally imply authority, truth, confidence, or policy standing?
9. Can recoil erase or rewrite prior snap history?
10. Can a second canonicalization path emerge for convenience?

Any yes answer is a design violation.

## Definition of done for the first implementation

The implementation is complete only when all of the following are true:

- one versioned experimental Snap-State module exists in Project 0;
- declaration/cell/coupling/excitation/event/terminal shapes are mechanically validated;
- records are deterministically addressed under `Project0-SnapState-v0.1|`;
- one frozen three-cell specimen proves a threshold cascade;
- one contrasting specimen proves below-threshold settling;
- one contrasting specimen proves partial-chain settling;
- one fixture proves deterministic simultaneous ordering;
- one fixture proves exhaustion without hidden mutation;
- recoil restores current load while historical snap evidence remains;
- undeclared topology cannot emerge;
- hostile input representation fails closed without getter execution, including the execution wrapper;
- existing L-Branch and issue #30 boundaries remain unchanged;
- `npm run verify:all` passes on the exact implementation head;
- PR review explicitly checks the declared-topology / active-topology / history distinction;
- GitBook publication, if performed, cites Project 0 as implementation authority and preserves unresolved fog.

## Residual fog

The following questions are intentionally left unresolved for later versions:

- whether cells may snap more than once in one run;
- whether recoil should have profiles beyond integer subtraction;
- whether coupling activation can later deactivate in the same run;
- whether thresholds can themselves change through declared history;
- whether multiple excitation sources belong in one declaration;
- whether continuous-time or frequency-domain models are useful enough to justify a separate primitive;
- how Snap-State should compose mechanically with L-Branch;
- how issue #30 resonance evaluation might produce a lawful excitation without coupling semantic judgment to execution;
- whether downstream independent specimens justify promoting part of this design into a portable Pattern.

Those are not blockers for v0.1.

## Final invariant

The entire first slice can be tested against one sentence:

> **The system may change which declared paths are active because a declared local threshold was crossed, but it may never pretend that the resulting current state erases the path by which it got there.**
