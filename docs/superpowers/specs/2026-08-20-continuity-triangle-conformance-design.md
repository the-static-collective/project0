# Continuity Triangle Conformance — Design

Date: 2026-08-20
Source issue: #56 — Continuity Triangle conformance
Status: approved third side of the Continuity Triangle

## Purpose

Pressure-test the existing Project0 Typed Continuity Braid against two materially different, already-landed donor witnesses:

- TranchNode Continuity Boundary Witness v0.1;
- Corpus OS Continuity Attestation v0.1.

The proof must answer one question:

> Can Project0 preserve the donors' continuity distinctions and catch seductive false continuity without importing donor execution law or manufacturing portable authority?

## Governing boundary

Project0 owns the portable meaning/conformance floor. It does not own TranchNode transition law or Corpus WorldCut/warrant law.

This slice therefore remains fixture-local unless a real grammar gap is first proven by a failing test.

No donor package/runtime dependency is permitted.

## Selected shape

Add two checked-in synthetic donor snapshots modeled exactly on the landed outputs and one fixture-local mapping module.

The mapping module returns:

- one ordinary `ContinuityClaimV0` using the existing Typed Continuity Braid;
- an explicit donor identifier;
- `grammarGap: "NO_GAP" | "BOUNDED_GAP"`;
- explicit residual/unmapped dimensions when needed.

Domain distinctions that fit the existing open `ContinuityDimension` seam remain namespaced dimensions rather than new universal lanes or modes.

## TranchNode mapping

Use one `representation-story` continuity lane with mode `transformed`.

Namespaced dimensions preserve, mechanically and separately:

- `tranchnode.preserved`;
- `tranchnode.differentiated`;
- `tranchnode.lost`;
- `tranchnode.unresolved`;
- completed transfer / transition witness evidence.

`doesNotEstablish` must include `authority`. The mapped Project0 claim may only use `occurrenceClaim: "continuation-only"`; the donor's `transition-witness-only` statement is preserved as namespaced evidence/context rather than widened into occurrence.

## Corpus mapping

Use one `representation-story` continuity lane with mode `transformed`.

Namespaced dimensions preserve, mechanically and separately:

- exact preserved constituted refs;
- each explicitly evidenced transform edge;
- each explicitly evidenced loss edge;
- unresolved constituted refs;
- prior/current terminal dispositions, without collapsing `session-refused`, `host-failed`, and `completed`;
- prior/current orphan observations;
- authority-cut change;
- `legalValidity: "unclaimed"`.

Authority evidence may be carried only as inert context/evidence. The mapped claim must not contain an `authority` lane, and `doesNotEstablish` must include `authority`.

## Hostile controls

The executable specimen must prove:

1. omitted loss never becomes preservation;
2. copied warrant/authority-shaped material never creates an authority lane;
3. `session-refused` and `host-failed` remain distinct;
4. matching orphan observations never become preserved;
5. semantic lookalikes do not become preserved without exact donor evidence;
6. donor-local distinctions that cannot fit the existing namespaced-dimension seam become an explicit bounded gap instead of coercion;
7. identical fixture input produces the same Project0 continuity address.

## Representation admission

Fixture adapters accept `unknown`, reuse Project0 canonicalization admission to reject executable/hostile representations, and then validate an exact donor fixture shape. Unknown top-level fields fail closed so authority-shaped smuggling cannot be silently ignored.

## Expected architectural result

The working hypothesis is **NO_GAP**: the existing Typed Continuity Braid plus namespaced dimensions is already expressive enough for these donors.

That hypothesis is not assumed. Tests decide it. If a donor distinction cannot be represented without semantic coercion, stop at `BOUNDED_GAP` and open a narrow follow-up issue for only that missing distinction.

## Non-goals

- no new continuity lane or mode;
- no new ontology kind;
- no TranchNode/Corpus import;
- no donor execution;
- no warrant validation/consumption;
- no WorldCut derivation;
- no universal adapter package/service/event bus;
- no automatic genealogy from similarity;
- no authority continuity from copied evidence;
- no Project0 production semantics change unless RED proves an actual grammar gap.

## Working compression

> Shared questions. Local answers. Cross-domain pressure. No portable authority.
