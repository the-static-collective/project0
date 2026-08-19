# Snap-State v0.1 Thresholded Topology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

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
- One v0.1 snap package is `snap -> all outgoing transfers -> recoil -> recompute global eligible frontier`.
- Event admission precedes mutation. An event that cannot be admitted causes no mutation.
- Malformed input fails before execution; terminals are exactly `settled | exhausted`.
- `eventRefs` are ordered history and must never be set-normalized.
- No model, network, DB, queue, scheduler, UI, clock, randomness, hidden global state, authority grant, or autonomous loop.
- `src/l-branch/`, issue #30 semantics, ontology kinds, and canonical receipt unions remain unchanged.
- Broad gate: `npm run verify:all`.

## Implemented Files

- `src/snap-state/types.ts` — public v0.1 record types.
- `src/snap-state/validate.ts` — descriptor-safe validation/errors.
- `src/snap-state/address.ts` — normalization/address/verify.
- `src/snap-state/evaluate.ts` — pure execution and atomic event admission.
- `src/snap-state/index.ts` — public seam.
- `fixtures/snap-state/specimen.ts` — frozen specimen family.
- `tests/snap-state.test.ts` — contract and normal mechanics.
- `tests/snap-state-adversarial.test.ts` — hostile representation/topology/budget/cycle proofs.
- `tests/snap-state-specimen.test.ts` — replay/history/immutability proofs.
- `tests/snap-state-wrapper-adversarial.test.ts` — top-level accessor rejection.

## Completed TDD Sequence

- [x] **Task 1 — Contract, validation, and canonical experimental addressing.** RED Actions #140 (`src/snap-state/index` absent); GREEN Actions #144.
- [x] **Task 2 — Below-threshold run and atomic excitation.** RED Actions #145 (`runSnapState` absent); GREEN Actions #147.
- [x] **Task 3 — One snap, declared transfer, and recoil.** RED Actions #148; GREEN Actions #149.
- [x] **Task 4 — Three-cell cascade, deterministic tie ordering, and cycle snap-once bound.** RED Actions #150; GREEN Actions #152.
- [x] **Task 5 — Event-budget atomicity.** Regression assertions arrived GREEN on Actions #153 because atomic admission had already been required by Task 2.
- [x] **Task 6 — Frozen canonical specimen, replay, immutable sources, and history/current-state distinction.** GREEN Actions #156.
- [x] **Task 7 — Hostile representation and topology-envelope hardening.** RED Actions #157 found endpoint error-classification mismatch; GREEN Actions #158.
- [x] **Owner-review hardening — top-level execution wrapper.** RED Actions #159 proved a getter could execute; GREEN Actions #160 after descriptor-safe wrapper admission.
- [x] **Spec reconciliation — snap-package ordering and wrapper boundary.** Actions #161 passes the complete repository gate against the PR merge ref.

## Final Executable Proof

The frozen baseline is:

```text
A --AB--> B --BC--> C

A threshold 5, initial 0, recoil 5
B threshold 7, initial 4, recoil 7
C threshold 6, initial 2, recoil 6
AB transfer 3
BC transfer 4
excitation +5 -> A
```

The v0.1 path is:

```text
excitation A
-> A snap
-> AB transfer
-> A recoil
-> B snap
-> BC transfer
-> B recoil
-> C snap
-> C recoil
-> settled
```

Final loads return to zero while ordered event history permanently records all three snaps and both activated couplings. A contrasting fixture adds a zero-transfer event yet reaches the same final loads; the terminal identity remains different because history differs.

## Verification Evidence

Exact feature head after spec reconciliation:

`184502cfc490ccebc18790e3f756d008b7aacee3`

GitHub Actions run #161 executed the repository gate against the PR merge ref with current `main`:

```bash
npm run verify:all
```

Observed result:

- TypeScript compile check: PASS;
- Node/TypeScript tests: **192 passed, 0 failed**;
- Python canonical fixture verification: PASS;
- conformance CLI: PASS;
- `npm ci` dependency audit: **0 vulnerabilities**.

## Compatibility / Non-Claims

This slice is additive and experimental. It does not modify the frozen nine-kind ontology, canonical receipt family, L-Branch v0.1, NAV, World Encounter, or issue #30 resonant-tension semantics. It does not claim continuous physics, biological simulation, autonomous execution, authority transfer, or a universal Static Collective Pattern.

## Residual Fog

Deferred beyond v0.1: repeated snaps per cell, coupling deactivation, mutable thresholds, multiple excitations, continuous-time/frequency models, composition with L-Branch, composition with issue #30, and any downstream Toaster/Phonograph embodiment.
