# WHOLE RETURN v0 Design

## Status

Proposed experimental Project0 profile. This is additive and does not change the frozen node ontology, existing receipt families, NAV semantics, World Encounter semantics, or authority rules.

## Problem

The ecosystem can already perform individual crossings, measurements, and continuity operations, but there is no small portable contract for one bounded job that crosses multiple sovereign repositories, survives interruption, and returns with enough evidence to resume without reconstructing history by hand.

The missing primitive is not a central orchestrator. It is a deterministic, inspectable journey envelope.

## Decision

Add **WHOLE RETURN v0** as an experimental Project0 contract profile with a pure TypeScript validator/reducer and adversarial tests.

A Whole Return declaration freezes:

- a stable `jobId` describing the declared work;
- a distinct `occurrenceId` identifying this concrete attempt;
- purpose, allowed operations, and completion condition;
- every participating repository revision;
- every adapter version;
- every participant's native identity domain.

An append-only event sequence then records crossings, interruption, resumption, refusal, and completion. Replaying the same declaration and events must reconstruct the same state and resume token.

## Core law

> **CROSSING PRESERVES NATIVE IDENTITY; IT DOES NOT INVENT SHARED IDENTITY.**

A crossing records both the producer-native identity and the consumer-native identity. Project0 witnesses the mapping between them; it does not replace either with a synthetic universal identifier.

Hashes remain identity/tamper evidence only. A matching digest does not establish semantic equivalence, authority, artistic quality, or truth.

## Contract

### Participant lock

Each participant contains:

- `participantId`
- `repoRef`
- `revision`
- `adapterVersion`
- `identityDomain`

`participantId` and `identityDomain` must be unique within the declaration. Empty version, revision, repository, or domain values are invalid.

### Native identity

A native identity is `{ domain, ref }`. The domain on a crossing must exactly match the declared identity domain of the corresponding producer or consumer.

### Crossing event

A crossing records:

- producer and consumer participant IDs;
- producer-native source identity;
- consumer-native observed identity;
- producer receipt reference;
- mapping receipt reference;
- source artifact SHA-256 digest;
- accepted artifact SHA-256 digest.

The two digests must match. This proves only that the receiving crossing claims the same artifact bytes; it does not prove semantic sameness.

### Lifecycle events

The minimal state machine is:

- `declared + crossing -> running`
- `declared + interrupt -> interrupted`
- `declared + refuse -> refused`
- `running + crossing -> running`
- `running + interrupt -> interrupted`
- `running + complete -> completed`
- `running + refuse -> refused`
- `interrupted + resume -> running`
- `interrupted + refuse -> refused`

`completed` and `refused` are terminal. While interrupted, the only admitted next events are `resume` or `refuse`.

A `resume` event must name the exact active interruption event. This prevents a later resume from silently answering a different interruption.

A `complete` event must retain at least one native return reference so the finished job has an explicit route back into participating systems.

### Event history

Events are append-only and have contiguous `seq` values beginning at 1. Event IDs are unique. Reordered, duplicated, skipped, or post-terminal events are invalid.

### Resume token

The reducer produces a deterministic `resumeToken` by canonicalizing and hashing:

- the exact declaration;
- the exact admitted event prefix;
- the derived lifecycle status.

The token is a replay fingerprint, not authority. A different participant revision, adapter version, event order, artifact digest, receipt reference, or occurrence ID must produce a different token or fail validation.

## Reference journey

The first intended ecosystem specimen is the existing Dogram PR #121 Toaster experiment:

`Toaster render -> Dogram exact measurement -> later ALEX inquiry retention -> later TranchNode durable continuity -> interruption -> replay/resume -> native return references`

WHOLE RETURN v0 does not import Toaster, Dogram, ALEX, or TranchNode code. Downstream adapters remain owned by their receiving repositories. Project0 owns only the portable declaration/event contract and conformance behavior.

## Adversarial requirements

The executable proof must reject or distinguish:

1. artifact digest changes across a crossing;
2. missing producer or mapping receipt references;
3. identity domains that do not match the locked participants;
4. changed repository revision or adapter version on replay;
5. non-contiguous event sequence;
6. duplicate event IDs;
7. crossing while interrupted;
8. resume naming the wrong interruption;
9. events after completion or refusal;
10. completion with no return references;
11. replay of the same occurrence versus a separately declared occurrence.

The same declaration and exact admitted event prefix must reproduce the same derived status and resume token.

## Non-goals

WHOLE RETURN v0 does not:

- execute downstream applications;
- schedule work;
- choose what job should run;
- create a universal object ID;
- merge repository ontologies;
- grant crossing authority;
- infer semantic equivalence from hashes;
- make ALEX interpretation or Dogram measurement canonical truth;
- require a database, server, queue, model, or network service.

## Ownership

Project0 owns the portable contract, deterministic replay semantics, and conformance fixtures. Products own their native identities, artifacts, receipts, adapters, workflow decisions, persistence, and user experiences.

## Compatibility and migration

This landing is additive. Existing Project0 documents, public types, fixtures, addresses, and receipt identities remain unchanged. No migration is required.

If WHOLE RETURN later becomes canonical rather than experimental, that promotion requires a separate versioned decision and compatibility review. Downstream repositories may adopt adapters independently without claiming whole-ecosystem conformance.

## Invariants exercised

- 4 Stable identity
- 5 Relationship preservation
- 6 Retrieval is not authority
- 8 Disclosure travels with the object (not widened here)
- 9 Least revelation
- 13 Hashing is identity and tamper evidence
- 14 Receipts are append-only
- 17 Applications are replaceable
- 18 Deterministic verification
- 19 Offline survivability
- 20 Explicit uncertainty

## Mathematical pressure test

The five-state transition system (`declared`, `running`, `interrupted`, `completed`, `refused`) was enumerated independently in Wolfram Language before implementation. The proposed nine admitted transition classes were deterministic, terminal states had no outgoing transitions, and the interrupted state admitted no crossing/complete transition. The executable TypeScript tests remain the repository evidence; the Wolfram enumeration is an external design check, not a runtime dependency.
