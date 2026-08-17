# World Encounter Envelope v0.1 Design

**Status:** design only; no implementation authority

**Issue:** #39

## Purpose

Project0 can now describe bounded before/crossing/after frames through experimental NAV and has proved one fixture-only Project0 → Corpus OS crossing. Floor 1.2 now needs the first versioned adapter-boundary object that can cross such a boundary without turning transport, provenance, verification, or visibility into destination authority.

The governing law is:

> **A source frame may send bounded testimony across a declared boundary; the destination must decide locally what that testimony is allowed to become. Crossing never carries sovereignty.**

This design narrows issue #7's permission-first exchange vocabulary into one executable specimen. It does not create a universal `World` object, master graph, remote protocol, or portable authority transfer system.

## Design goals

World Encounter Envelope v0.1 must prove five things simultaneously:

1. a bounded offered object can retain exact source identity and provenance across a declared boundary;
2. the destination can reject, admit, or remain indeterminate without rewriting source history;
3. source authority may be described as provenance without becoming executable destination authority;
4. disclosure/permission is evaluated before offered content becomes inspectable destination material;
5. NAV may witness the bounded change caused by the encounter but cannot grant or rank the encounter.

## Existing floors reused unchanged

The implementation must reuse, not replace:

- Project0 canonical JSON / SHA-256 addressing;
- the frozen nine-kind ontology and existing canonical receipt kinds;
- Floor 1.1 runtime validation and append-only graph semantics;
- NAV v0.1 `FrameSnapshot`, `CrossingDeclaration`, and `NavCrossingReceipt`;
- issue #7's permission-first exchange direction: `SafeSourceRef`, `RetrievalSnapshot`, `NodeManifest`, `ExchangeEnvelope`;
- the merged PR #38 Project0 → Corpus OS frame pair as the first pinned cross-repository specimen.

No new canonical node kind, relationship kind, or Floor 1.1 receipt kind is required by this design.

## Experimental namespace

The first implementation should live in a focused experimental module, for example:

```text
src/world-encounter/
  types.ts
  validate.ts
  address.ts
  evaluate.ts
  index.ts
```

Its records use an experimental domain/address prefix distinct from canonical `node-`, `edge-`, `rect-`, and existing `nav-` identities. The exact prefix is an implementation detail to settle in the plan, but it must reuse Project0's one canonicalization/hash path.

## Contract

### NodeManifestV01

A manifest states what a participant claims it can receive or emit. It is capability metadata, not an authority grant.

```ts
export type NodeManifestV01 = {
  nodeRef: string;
  protocolVersion: "p0.exchange/0.1";
  accepts: string[];
  emits: string[];
  capabilities: string[];
  requiredScopes: string[];
  mustNever: string[];
};
```

Arrays are deterministic sets after validation/canonical normalization. A manifest must never be interpreted as proof that the named node currently possesses any capability or scope.

### SafeSourceRefV01

The source reference identifies the offered material without forcing destination retrieval.

```ts
export type SafeSourceRefV01 = {
  objectRef: string;
  mediaType: string | null;
  sourceReceiptRefs: string[];
  disclosureClass: string;
};
```

`objectRef` is an already-established identity. The envelope does not embed arbitrary foreign payload bytes in v0.1. This keeps the first proof about encounter semantics rather than transport size or parsing.

### ExchangeEnvelopeV01

```ts
export type ExchangeEnvelopeV01 = {
  protocolVersion: "p0.exchange/0.1";
  originNodeRef: string;
  originFrameRef: string;
  originVersionRef: string;
  offered: SafeSourceRefV01;
  sourceProvenanceRefs: string[];
  sourceAuthorityRefs: string[];
  sourceAuthorityClass: "none" | "local" | "unknown";
  sourceDisposition: "evidence" | "proposal" | "uncertainty" | "unknown";
  capabilityUsed: string;
  limitations: string[];
};
```

`sourceAuthorityRefs` are provenance only. Their presence is never copied into destination `authorityRefs` and never makes the envelope executable authority.

The envelope intentionally contains no destination decision, destination authority, route recommendation, ranking, global world identity, mutable status, or hidden payload.

### DestinationEncounterContextV01

The destination evaluates an envelope under an explicitly supplied local context.

```ts
export type DestinationEncounterContextV01 = {
  destinationNodeRef: string;
  destinationFrameRef: string;
  manifest: NodeManifestV01;
  grantedScopes: string[];
  destinationAuthorityRefs: string[];
};
```

This context is supplied by the caller for the fixture. v0.1 does not discover manifests, enumerate authority, consult a registry, or make network calls.

### EncounterDispositionV01

The destination produces a non-canonical experimental evaluation record:

```ts
export type EncounterDispositionV01 = {
  envelopeRef: string;
  destinationFrameRef: string;
  status: "admitted" | "refused" | "indeterminate";
  reasonCode: EncounterReasonCode;
  inspectedObject: boolean;
  destinationAuthorityRefs: string[];
  evidenceRefs: string[];
};
```

Initial reason codes:

```ts
export type EncounterReasonCode =
  | "ENCOUNTER_ADMITTED"
  | "ENCOUNTER_PROTOCOL_UNSUPPORTED"
  | "ENCOUNTER_TYPE_NOT_ACCEPTED"
  | "ENCOUNTER_CAPABILITY_UNDECLARED"
  | "ENCOUNTER_SCOPE_REQUIRED"
  | "ENCOUNTER_DISCLOSURE_REFUSED"
  | "ENCOUNTER_SOURCE_INVALID"
  | "ENCOUNTER_INDETERMINATE";
```

`inspectedObject` must remain `false` for any refusal occurring before disclosure/scope admission. Structural envelope validation is not payload inspection.

## Evaluation order

The destination evaluator is pure and deterministic.

```text
validate envelope structure
  ↓
validate protocol compatibility
  ↓
check destination manifest accepts declared offer class
  ↓
check declared destination capability path
  ↓
check required disclosure/scope
  ↓
only then permit object inspection / downstream materialization
  ↓
produce admitted | refused | indeterminate disposition
```

The evaluator does not mutate a graph, fetch content, execute capabilities, or alter source objects.

## Authority boundary

The most important negative invariant is:

```text
sourceAuthorityRefs
        ≠
destinationAuthorityRefs
```

A destination may retain source authority references as provenance explaining what the source claimed or used. It may not adopt those refs into its own authority merely because:

- the envelope validated;
- the object hash matched;
- the source is trusted socially;
- NAV shows a lawful crossing;
- the same object has crossed before;
- the material is popular, repeated, similar, or useful.

Destination authority must be supplied and evaluated locally.

## Relationship to NAV

NAV remains an observation instrument after the encounter.

The first specimen should use:

1. a `before` destination `FrameSnapshot`;
2. a `CrossingDeclaration` naming the encounter;
3. one `ExchangeEnvelopeV01` and `EncounterDispositionV01`;
4. an `after` destination `FrameSnapshot` that may add bounded evidence/particularity when the encounter is admitted or may preserve the frame while retaining refusal evidence in the fixture;
5. existing NAV comparison to produce the crossing witness.

NAV does not decide whether the envelope may be evaluated. It only compares declared bounded frames after the fact.

## First fixture: Project0 → Corpus OS

Reuse the exact frame lineage already pinned by merged PR #38.

The fixture should choose one boring, already-attributable source object reference. The object itself is less important than the boundary proof.

The first three fixture outcomes are mandatory:

### A. Admitted testimony

- envelope validates;
- destination manifest accepts the offered class;
- required scopes are present;
- destination-local evaluation returns `admitted`;
- source authority refs remain source provenance only;
- after-frame evidence may change;
- NAV reports the bounded difference without authority transfer.

### B. Refused testimony

- envelope structure remains valid;
- destination scope/disclosure rule refuses before object inspection;
- `inspectedObject === false`;
- source state and source identity remain unchanged;
- destination authority remains unchanged;
- refusal is deterministic and attributable.

### C. Indeterminate testimony

- the destination cannot establish one required local fact without guessing;
- result remains `indeterminate`, not coerced into refusal or admission;
- no payload inspection or state mutation occurs unless the earlier gates allowed it;
- NAV does not turn indeterminacy into universal impossibility.

## Tamper and hostile-input requirements

Validation must fail closed for:

- unsupported protocol versions;
- sparse arrays, accessors, prototypes, cycles, or unsafe values already forbidden by the canonicalization floor;
- mutated `objectRef` / source receipt lineage;
- unknown top-level record kinds;
- source authority values inserted into destination authority by caller convenience;
- manifest claims used as if they were grants;
- disclosure rules that require inspecting hidden content to decide whether hidden content may be inspected.

Hostile coercion/accessor behavior must not execute during validation.

## Determinism

Canonically equivalent envelopes and encounter dispositions must produce identical experimental addresses. Reordered set-like fields must normalize according to the same deterministic code-unit rules already used by Project0.

No timestamps, randomness, machine identity, model output, locale collation, or network state enters the v0.1 identity.

## Testing strategy

The implementation plan must use explicit RED → GREEN cycles and add focused tests for:

- deterministic envelope identity;
- source-authority non-transfer;
- destination-local authority declaration;
- disclosure-before-inspection;
- manifest-is-not-grant;
- receiving-is-not-canonizing;
- admitted/refused/indeterminate separation;
- source immutability across every destination outcome;
- tamper refusal;
- hostile accessor/coercion refusal;
- NAV post-encounter composition;
- no canonical Node/Edge/Receipt/Request identity drift;
- full offline `npm run verify:all` regression.

## Non-goals

World Encounter Envelope v0.1 does not implement:

- a universal world ontology or `World` node;
- global world IDs;
- network transport, HTTP/RPC, authentication, browser sessions, or discovery;
- automatic route search or route ranking;
- automatic crossing;
- recursive scouts or `TraversalWarrant`;
- authority delegation/lease transfer across frames;
- semantic translation, embeddings, model inference, similarity scoring, or universal schema mapping;
- durable remote inboxes;
- consensus;
- legal-validity claims;
- a master multiverse graph.

## Failure conditions

Return to design instead of implementing around the problem if the specimen requires:

- a second canonicalizer/hash path;
- a tenth universal node kind or new canonical receipt kind;
- reading disallowed payload content to decide whether reading it is allowed;
- source authority becoming executable destination authority by transport;
- source history mutation to reflect a destination decision;
- NAV becoming permission or route authority;
- forced semantic equivalence between Project0 and Corpus OS vocabularies;
- a registry, server, or agent runtime before the fixed offline fixture can pass.

## Success statement

The first successful specimen should justify exactly this claim and no more:

> **Two bounded frames can perform one attributable encounter in which testimony crosses, destination authority remains local, source history remains intact, and the resulting difference can be witnessed without requiring one frame to become the master map.**

That is enough to open the next Floor 1.2 question: whether one real downstream adapter can implement the same contract independently.