# PHASELIFT — Crossing, Threshold, and Reconstitution Design

**Status:** approved architectural design candidate; committed for human spec review; not implementation authority yet  
**Date:** 2026-08-30  
**Branch:** `lumi/phaselift-crossing-reconstitution-design`

> **Carry the road. Do not carry the throne.**
>
> **The world may change. The road must remain attributable. The next world must decide for itself. The next edge must remain possible.**

## 1. Purpose

The Static Collective now has several independently bounded organs with increasingly strong local law. The next phase is not to centralize them under one runtime. It is to make lawful crossings between locally sovereign worlds explicit, inspectable, and reconstitutable.

PHASELIFT is the design for that transition.

```text
collection of bounded organs
        ->
federation of reconstitutable worlds
```

A world may produce attributable testimony about what happened there. That testimony may cross a boundary. A receiver may evaluate it under a different local constitution and, if locally admitted, constitute a new world that is historically continuous without being the same occurrence.

The central proof target is:

> **Continuity can cross without control crossing with it.**

This design is cross-project in consequence but intentionally narrow in mechanism. It reuses Project 0's existing portable contracts, LOADOUT's local world-constitution law, and existing Project 0 continuity/fork semantics. It does not create a new master runtime or a new sovereign protocol repository.

## 2. Existing floor this design must not duplicate

This design was self-reviewed against the current project floor before being handed back for human review.

### 2.1 Project 0 already owns the shared meaning and crossing contract

Project 0 is already the shared semantic floor for meaning-bearing objects, lineage, receipts, bounded authority, continuity, and bounded crossings. Its current World Encounter Envelope proves that bounded source testimony may cross a declared boundary while destination authority remains local.

Therefore PHASELIFT **must not create a separate `crossing` repository or a second universal crossing ontology**.

Project 0 remains the owner of shared portable semantics.

### 2.2 World Encounter Envelope v0.1 already proves the essential authority law

Current protocol:

```text
p0.exchange/0.1
```

Current proven law:

> A source frame may send bounded testimony across a declared boundary; the destination must decide locally what that testimony is allowed to become. Crossing never carries sovereignty.

PHASELIFT extends the use of that law from:

> may this testimony be inspected here?

into:

> may a locally sovereign successor world be constituted from this attributable crossing?

The first PHASELIFT proof should prefer a profile/composition of existing Project 0 contracts over adding fields to `p0.exchange/0.1`.

### 2.3 Typed Continuity Braid already owns continuity across change

Current protocol:

```text
p0.continuity/0.1
```

The Braid already distinguishes continuity lanes, exposes breakage and reconstitution, preserves plural descendants, and refuses transitivity by default.

PHASELIFT therefore does not invent a new global identity/continuity model. It uses explicit continuity claims to answer the HOME question:

> Same what, across which change, by what bridge, witnessed how, and what specifically did not cross?

### 2.4 Forkability / merge obligation is already pressure-tested

Project 0 already has an approved pressure test proving:

```text
MERGEABILITY != MERGE OBLIGATION
```

Two lawful descendants may later support merge, coexistence, or refusal without replacing either parent or manufacturing authority.

PHASELIFT adopts that result. It does not add a `MERGEABLE` ontology kind or automatic reconciliation policy.

### 2.5 BEE already states the cross-boundary transplant discipline

BEE's four moves remain governing design pressure:

1. carry the smallest proven invariant;
2. leave donor authority behind;
3. require local proof;
4. refuse widening transplants.

This means PHASELIFT must not standardize a new portable receipt family merely because this design can imagine one. Shared forms graduate only after materially different recipient implementations demonstrate a stable common shape.

### 2.6 LOADOUT already owns bounded local constitution

LOADOUT's law remains:

```text
Knowledge may load.
Capability may bind.
Authority does not silently expand.
```

LOADOUT therefore owns the receiver-local act of reconstitution: resolving what is present here, applying local fences, binding only locally admitted capabilities, and producing a local receipt for the constituted world.

### 2.7 Boot the House is a direct predecessor, not a discarded architecture

The existing **Boot the House — Federated World Encounter Loop v0.1** already composes Full Measure, TranchNode, Project 0 World Encounter, and Corpus OS through repo-owned process adapters while preserving destination-local disposition and refusing a new central world-runtime.

PHASELIFT does not supersede that work. It extracts the more general continuation problem now visible across the newer stack:

```text
encounter testimony
  -> destination-local evaluation
  -> locally constituted successor
  -> attributable continuation
```

Boot the House remains a practical federation specimen. PHASELIFT adds an explicit receiver-local reconstitution/birth seam and makes continuation across carrier/world boundaries the primary proof target.

### 2.8 Reconstitution threshold is not Project 0 Snap-State

Project 0 already owns `p0.snap-state/0.1`, an experimental deterministic primitive for threshold crossings that alter active topology inside a predeclared structural envelope.

PHASELIFT's **reconstitution threshold** answers a different question:

> Given incoming crossing testimony and this receiver's local constitution, may a new locally sovereign world occurrence be constituted?

Therefore:

```text
RECONSTITUTION THRESHOLD != SNAP-STATE THRESHOLD
```

The first PHASELIFT threshold remains LOADOUT-local and must not reuse or silently overload Snap-State semantics.

## 3. Constitutional non-collapses

The following are normative for PHASELIFT:

```text
CROSSING != WORLD
TESTIMONY != EVENT
TESTIMONY != REPLAY
RECEIVE != ADMIT
ADMIT != BIND
HANDOFF != TRANSFER OF AUTHORITY
CONTINUITY != SAMENESS
HOME != SNAPSHOT
RETURN != ROLLBACK
LOGICAL ADDRESS != EXACT BODY
CURRENT BODY != HISTORICAL PRODUCER
SOURCE AUTHORITY != SUCCESSOR AUTHORITY
SOURCE OPEN EDGE != LOCAL EXECUTABLE EDGE
FORK != FAILURE
ENCOUNTER != MERGE
MERGE != COLLAPSE
MERGEABLE != MERGE OBLIGATION
LATER KNOWLEDGE != EARLIER KNOWLEDGE
PROTECTED != PROMOTED
PROTECTED != TRUE
PROTECTED != RELEVANT
POSSIBILITY != OCCURRENCE
THRESHOLD != WORLD
RECONSTITUTION THRESHOLD != SNAP-STATE THRESHOLD
BIRTH != DESERIALIZATION
LOCALITY != AUTHORITY
DISTANCE != DISTRUST
NESTING != AUTHORITY
SHARED GRAMMAR != SHARED WORLD
```

The Project 0 frozen nine-kind ontology is unchanged by this design.

## 4. Core model

PHASELIFT uses four grammatical positions and one explicit transition event:

```text
WORLD
  -> TESTIMONY
  -> CROSSING
  -> THRESHOLD
  => WORLD'
```

The first three positions preserve or exteriorize what already occurred. THRESHOLD is receiver-local evaluation of whether the crossing can participate in a new locally sovereign world. The heavy arrow `=>` marks constitution of a new attributable occurrence.

### 4.1 Fourfold role recurrence

Let `Q` advance one grammatical position. After a complete turn:

```text
Q^4(W_n) ~role W_n
Q^4(W_n) !=history W_n
```

The role returns to WORLD, but historical occurrence advances.

This is cyclic in grammar-space and open in history-space. The design uses this as an engineering compression only; it does not claim that four is metaphysically privileged.

### 4.2 Ternary-to-quaternary transition

Before a receiver is involved:

```text
W_n -> T_n -> H_n
```

where:

- `W_n` is a locally constituted source world;
- `T_n` is attributable testimony produced there;
- `H_n` is portable crossing testimony.

A receiving constitution `L_(n+1)` introduces a candidate fourth relation:

```text
Theta_(n+1) = (H_n, L_(n+1), local evaluation)
```

This threshold is not yet a world.

The transition completes only when local constitution succeeds and a new occurrence identity exists:

```text
Theta_(n+1) => W_(n+1)
```

The useful systems analogue is a rank change: the candidate successor is no longer merely reducible to source testimony plus a hypothetical receiver; it now has its own occurrence identity, local authority, local body bindings, and ability to produce new attributable testimony.

This is an analogy for independence, not literal vector-space rank.

## 5. Source-side testimony and crossing

PHASELIFT does not require a new universal `crossing/v0` schema in the first implementation slice.

The source side should compose existing Project 0 objects without inventing unsupported fields inside `p0.exchange/0.1`.

The minimal shape is:

1. create or identify one exact Project 0 source object/reference that represents the bounded testimony offered for crossing;
2. attach/cite any Project 0 `p0.continuity/0.1` claims through existing Project 0 relationships/provenance mechanisms rather than new World Encounter top-level fields;
3. let owner-local receipts/evidence/projections remain owner-local objects referenced through the offered source object's existing provenance/relationship surface when needed;
4. represent possible continuations as Project 0 proposals or owner-local proposal references, not destination executable edges;
5. offer the exact established source reference through one `p0.exchange/0.1` World Encounter envelope.

This design does **not** assume that World Encounter v0.1 already supports arbitrary new top-level arrays for continuity, open edges, protection, or foreign receipts. If the specimen cannot be expressed through the existing established-source-reference boundary without semantic weakening, implementation stops and a separately versioned Project 0 design is required.

### 5.1 Opaque owner-local references

Transport must understand only the minimum necessary address/integrity/provenance metadata for foreign objects.

Conceptually:

```text
owner
kind-or-schema address
object identity
integrity/address
provenance/disclosure references where required
```

Transport must not deserialize a foreign object's domain meaning merely to move it.

Examples:

```text
ALEX claim receipt
3rdi projection receipt
Dogram calculation receipt
Human Witness signature
National Treasure formation trace
```

Project 0 may relate or carry references to these objects. It does not become their interpreter.

### 5.2 Open edges

A source world may testify that a continuation was open from its position.

That testimony is not a destination task and not destination authority.

Represent the source object as a proposal or owner-local typed reference. On receipt, the destination may create a **new local proposal** corresponding to it.

Required law:

```text
source open edge != receiver local edge
```

No global scheduler is introduced.

## 6. HOME as a continuity requirement, not a snapshot

HOME is not a serialized copy of the source world.

HOME is the minimum relational structure whose loss would break the declared continuity purpose.

PHASELIFT should express HOME primarily through Project 0 Typed Continuity Braid lanes plus receiver-local requirements.

A receiver may declare requirements such as:

```text
identity: preserved or transformed
protocol: preserved or reconstituted
purpose-meaning: preserved or transformed
representation-story: unconstrained
historical producer refs: must remain attributable
unresolved evidence: must remain unresolved unless a new local receipt resolves it
```

The authority lane is never treated as portable warrant. Existing continuity law already requires external admission.

A receiver-local HOME check yields:

```text
PASS
DEGRADED
REFUSE
```

`DEGRADED` means a successor can be constituted while a declared continuity requirement is unavailable or weakened, and that loss is explicitly receipted.

```text
DEGRADED != BROKEN
DEGRADED != PASS
```

## 7. PROTECTED as a receiver-local administrative disposition

The design conversation identified a useful state:

> Preserve this exact attributable object even though its present use, interpretation, or destination is unresolved.

This design retains the concept but narrows its ownership after self-review.

`PROTECTED` is **not a new Project 0 node kind** and is **not standardized as a portable Project 0 status in v0**.

The source may testify that it treated an object as protected or may offer a proposal requesting protection. The receiver decides locally whether to adopt a protected hold.

In the first proof, LOADOUT may expose a receiver-local administrative disposition:

```text
PROTECTED
```

with the semantics:

```text
preserve exact attributable reference
no promotion implied
no truth implied
no relevance implied
no execution implied
no authority implied
```

This remains distinct from `UNRESOLVED`:

```text
UNRESOLVED = a known determination is not yet justified
PROTECTED  = preserve the object even though its future question/use may not yet exist
```

If at least two materially different recipient systems later need the same disposition without semantic weakening, Project 0 may consider a portable representation in a separate design.

## 8. Receiver-local threshold

Only a receiver can evaluate whether a crossing is liftable under its constitution.

The threshold object is therefore **LOADOUT-owned in the first implementation**, not a new Project 0 ontology or receipt family and not an instance of Project 0 Snap-State.

Conceptual receiver-local form:

```text
loadout.reconstitution-threshold/v0
  sourceEncounterRef
  receivingConstitutionRef
  continuityRequirements
  resolvedRefs
  missingRefs
  proposedBindings
  refusedBindings
  locallyProtectedRefs
  localProposalRefs
  authorityDecisions
  homeCheck
  disposition
```

This schema name is design-level and may be adjusted during implementation planning to fit LOADOUT's existing naming conventions.

### 8.1 Threshold dispositions

Receiver-local liftability has four required outcomes:

```text
LIFT
DEGRADED
HOLD
REFUSE
```

#### LIFT

All required local conditions are satisfied. A successor world may be constituted.

#### DEGRADED

A successor world may be constituted, but one or more continuity requirements are explicitly weakened/unavailable.

#### HOLD

The crossing is retained but no successor world is constituted now. HOLD is a valid non-terminal state.

#### REFUSE

Local law forbids the proposed constitution. The source crossing remains unchanged and attributable.

Malformed representation, protocol incompatibility, and operational failure must remain distinct from constitutional REFUSE.

## 9. Reconstitution lifecycle

### 9.1 RECEIVE

The receiver verifies the incoming Project 0 envelope according to its protocol before inspecting any gated object.

```text
RECEIVED != TRUSTED
RECEIVED != BOUND
RECEIVED != CONTINUED
```

### 9.2 INSPECT

After destination-local encounter admission permits inspection, the receiver reads only the references required for the declared reconstitution purpose.

### 9.3 RESOLVE

Continuing logical addresses are resolved locally.

If a historical receipt was produced by:

```text
ALEX@abc123
```

and the receiver currently resolves logical address ALEX to:

```text
ALEX@987xyz
```

then:

```text
historical producer remains ALEX@abc123
current body may be ALEX@987xyz
```

Required law:

> **Continuity may rebind. Attribution may not be retrojected.**

### 9.4 REAUTHORIZE

Source authority references remain source provenance only.

The receiver computes new authority from local law:

```text
A_successor = AUTHORIZE_local(requested effects, local constitution, source evidence)
```

Source authority is never intersected, unioned, copied, or inherited as a warrant.

### 9.5 HOME CHECK

The receiver evaluates declared continuity requirements and records PASS, DEGRADED, or REFUSE.

A receiver may still choose HOLD after a PASS or DEGRADED-capable evaluation; HOLD expresses "do not constitute now," not a continuity classification.

### 9.6 PROTECTED HOLD

Receiver-local PROTECTED dispositions are established only through local admission. Source protection testimony may motivate the local decision but does not command it.

### 9.7 OPEN-EDGE REHYDRATION

A source continuation proposal may become a new receiver-local proposal:

```text
source proposal -> receiver local proposal
```

The local proposal receives its own occurrence/identity and does not impersonate the source object.

### 9.8 CONSTITUTE

Only after all prior gates may LOADOUT produce a successor world:

```text
W_successor = RECONSTITUTE(source encounter, local constitution)
```

The successor is a new occurrence, not a restored copy of the source world.

## 10. World-birth receipt

The first implementation needs an explicit receiver-local receipt recording the moment a new world occurrence is constituted.

Conceptual form:

```text
loadout.world-birth/v0
  worldId
  sourceEncounterRef
  thresholdRef
  localConstitutionRef
  resolvedBodies
  localAuthorizations
  refusedBindings
  homeCheck
  protectedRefs
  localProposalRefs
  occurredAt
  digest
```

This receipt remains LOADOUT-owned in the first proof.

Do **not** add it to Project 0's canonical receipt family merely because a common shape is plausible. BEE requires multiple independent recipient proofs before a portable receipt is standardized.

Required distinction:

```text
possibility of world != occurrence of world
```

A HOLD or REFUSE outcome does not receive a world-birth receipt.

## 11. Fork, encounter, and merge

PHASELIFT adopts Project 0's existing forkability/merge-obligation result rather than creating a new merge primitive.

### 11.1 Fork

One source crossing may be received independently by multiple worlds:

```text
H0 -> W_A
H0 -> W_B
```

Each successor has a distinct occurrence identity and local authority even if its initial outputs are identical.

### 11.2 No retrospective knowledge

If branch A discovers `e_A`, branch B does not gain that observation until an actual later encounter makes it available.

3rdi remains the owner of observer-local availability/cut distinctions.

A later world may know both histories. It may not rewrite either earlier observer as having known the other branch.

### 11.3 Encounter before merge

Two branches may encounter one another without merging.

Encounter may expose:

```text
common ancestry
differences
compatible relations
contradictions
unknowns
protected local holds
authority differences
```

The existence of an encounter creates no merge obligation.

### 11.4 Merge as a new descendant

If a local policy chooses to produce a merged continuation, it is a **new child occurrence** attributable to both parents.

It does not overwrite, delete, or retroactively unify the parents.

Conflicting parent claims remain explicit tension/discordance evidence according to the owning systems. Local selection for a declared purpose does not delete the alternate history.

### 11.5 Authority on merged descendants

Parent authority is not additive.

A merged descendant computes authority from its own local constitution exactly as any other successor world does.

## 12. Worlds within worlds

A world may contain bounded child worlds.

Nesting does not imply authority inheritance in either direction.

```text
parent contains child
!=
parent owns child authority
!=
child inherits parent authority
```

A child crossing into a parent on the same machine should use the same semantic seam as a crossing between machines. Local process proximity is not a bypass.

Likewise, remote distance is not itself evidence of untrustworthiness.

The grammar is recursive:

```text
RECEIVE -> HOLD -> CONSTITUTE -> WORK -> TESTIFY -> POUR
```

A successfully constituted successor may itself become a receiver and source of later crossings.

## 13. Protocol and repository ownership

### Project 0 owns

- `p0.exchange/0.1` portable encounter testimony;
- `p0.continuity/0.1` typed continuity claims;
- canonical addressing/integrity for those Project 0 records;
- portable laws preventing authority transport and destructive continuity collapse;
- shared conformance fixtures only after the shape is actually shared.

### LOADOUT owns

- local RECEIVE orchestration after Project 0 encounter validation;
- local constitution and body resolution;
- fences and bindings;
- receiver-local threshold disposition;
- receiver-local PROTECTED hold;
- receiver-local open-edge/proposal rehydration;
- RECONSTITUTE;
- world-birth receipt in the first proof.

### ALEX owns

- source/evidence/derivation formation history;
- claim-to-source provenance;
- research receipts carried opaquely through Project 0 where appropriate.

### 3rdi owns

- observer-local occurrence/availability/focus/relevance distinctions;
- projection and cut receipts;
- hostile checks against retroactive knowledge.

### Dogram owns

- deterministic pressure calculations over frozen PHASELIFT specimens;
- no semantic promotion.

### Free Graph owns

- attributable road/ancestry memory where used;
- no execution or merge authority.

### Human Witness owns

- human assent/signature where required by a local world.

### National Treasure owns

- formation history, symbolic pressure, and the conversation-derived PHASELIFT clue;
- no runtime authority.

### Product worlds such as Full Measure / Corpus OS own

- their native user-facing or operational world semantics;
- local disposition and consequence;
- adapters into the shared crossing floor without donating sovereignty to it.

### No one owns

```text
THE COLLECTIVE
```

## 14. No runtime-import centralization

PHASELIFT must not create cross-repo runtime imports that collapse sovereignty.

Preferred shape:

```text
native owner object
  <-> owner-local adapter/process seam
  <-> Project 0 portable contract
  <-> receiver-local adapter
  <-> receiver native object
```

No downstream organ should need to import another organ's runtime merely to participate in a crossing.

Transport mechanism is explicitly non-normative. Local stdio is acceptable for the first proof. HTTP/MCP/WebSocket/IPC/package transport may appear later without changing the semantic law.

## 15. Canonicalization and integrity

Project 0 encounter and continuity objects continue to use Project 0's existing canonicalization/addressing rules.

Receiver-local threshold and world-birth receipts use deterministic serialization and digests according to LOADOUT's local conventions.

Important law:

```text
hash = identity/tamper evidence
hash != semantic validation
```

The source crossing must not change because receiver B chooses LIFT while receiver C chooses REFUSE.

```text
Theta_B = evaluate(H, L_B)
Theta_C = evaluate(H, L_C)
```

Same crossing. Different local relation.

The source object therefore does not contain its own destiny.

## 16. First executable slice — `PHASELIFT-RECONSTITUTE-001`

The first proof is intentionally small.

### Source world A

Use one deterministic Project 0 source object and World Encounter fixture carrying/offering:

- one exact source reference;
- source provenance/disclosure;
- one Project 0 continuity claim reachable from the source object's existing provenance/relationship graph;
- one owner-local receipt reference reachable through the same bounded source formation;
- one source proposal representing an open continuation;
- one source testimony/proposal that an object is worth preserving without promotion.

No executable source authority crosses.

### Receiver world B

LOADOUT receives the encounter through a local adapter/process seam.

Receiver B has:

- a different local constitution;
- a current body resolution that differs from at least one historical producer body;
- one additional available effectful capability that is **not authorized** for this reconstitution.

### Required results

1. Project 0 encounter validation/admission completes without mutating the source envelope.
2. Historical producer identity remains unchanged.
3. Current logical body may resolve to a different exact body.
4. Source authority remains non-operative provenance.
5. The extra available capability remains unbound/unusable unless locally authorized.
6. HOME continuity requirements evaluate explicitly.
7. The source preservation request may become receiver-local PROTECTED only through local decision.
8. The source open-edge proposal becomes a distinct receiver-local proposal, not an executable imported edge.
9. LOADOUT emits a threshold result.
10. On LIFT, LOADOUT emits a new world-birth receipt and distinct successor world occurrence ID.
11. The successor can produce at least one new local receipt/testimony that did not exist in the source world.

Success condition:

> **Different world, inspectably continuous history.**

## 17. Threshold hostile matrix — `THRESHOLD-001`

Present the same immutable Project 0 encounter to four receiver constitutions.

```text
L1: enough evidence + locally allowed bindings
L2: one required continuity invariant unavailable, but degraded continuation permitted
L3: receiver chooses to retain without constituting
L4: requested effect is constitutionally forbidden
```

Required dispositions:

```text
L1 -> LIFT
L2 -> DEGRADED
L3 -> HOLD
L4 -> REFUSE
```

The exact source Project 0 encounter identity must remain identical across all four evaluations.

Only LIFT and DEGRADED may produce world-birth receipts.

## 18. Fork/encounter specimen — `PHASELIFT-FORK-001`

From one source encounter create two independently constituted successors.

Branch A:

- discovers one relation unknown to B;
- locally protects one object;
- uses body version A1.

Branch B:

- discovers a different relation unknown to A;
- locally protects a different object;
- uses body version B1.

Later encounter requirements:

- common source ancestry remains attributable;
- neither earlier branch receives retroactive knowledge;
- both local protected holds remain attributable to their respective worlds;
- contradictory findings become explicit tension/discordance rather than silent winner selection;
- coexistence and refusal-to-merge remain lawful outcomes;
- if a merged descendant is locally constituted, it has a new world ID and computes authority locally.

Use the existing Project 0 continuity grammar and forkability pressure test. Add a new Project 0 primitive only if the specimen exposes a real representational gap.

## 19. Dogram pressure surface

No new Dogram operator is required for the first proof.

Existing operators can pressure frozen PHASELIFT fixtures:

### `delta@1`

Compare immutable source testimony with received/referenced testimony and expose the first illegal mutation.

### `rectangle@1`

Pressure the source-authority/local-authority interaction. Source authority claims must never bypass the destination gate.

### `ablate@1`

Remove one parent, receipt, continuity root, or locally required invariant and measure the resulting reachability/continuity delta.

### `reach@1`

Verify that an incoming source proposal has no path to local effects until a distinct local proposal/binding is admitted.

Dogram reports calculations only. It does not promote PHASELIFT semantics.

## 20. 3rdi pressure surface

PHASELIFT must preserve 3rdi's four non-collapsible coordinates where referenced:

```text
occurrence
availability
attention role / focus
relevance / known-at relation
```

A transport layer must not flatten those into a single timestamp or current-state field.

Canonical hostile question:

> Can a later merged world observe both branches without making either earlier branch appear to have known the other?

Required answer: yes.

## 21. Compatibility and migration

### Project 0

The preferred first implementation requires **no change to the frozen nine-kind ontology**.

The preferred first implementation also attempts to use `p0.exchange/0.1` and `p0.continuity/0.1` unchanged.

If the executable specimen reveals that existing contracts cannot carry the minimum required testimony without semantic weakening, implementation must stop and produce a separate versioned Project 0 design rather than silently widening `0.1`.

Project 0 Snap-State is unchanged and remains semantically separate.

### LOADOUT

New receiver-local threshold/reconstitution records may be additive under a new versioned local schema. Historical LOADOUT receipts are not rewritten.

### Boot the House / Full Measure / Corpus OS

No existing Boot the House contract is rewritten by PHASELIFT. A later adapter may demonstrate that an existing World Encounter outcome can feed a LOADOUT-style reconstitution threshold, but that is a new specimen rather than retroactive reinterpretation of the earlier project.

### Other organs

No ALEX, 3rdi, Dogram, Free Graph, Human Witness, or National Treasure schema change is required for the first proof. Their artifacts enter only through existing owner-local references/adapters.

## 22. Non-goals

The first PHASELIFT implementation explicitly rejects:

- a new central `world-runtime` repository;
- a new `crossing` repository before Project 0 is proven insufficient;
- a global daemon or registry;
- automatic discovery/routing;
- network authentication infrastructure;
- one master ontology;
- one shared runtime package imported by all organs;
- automatic merge/reconciliation;
- portable authority;
- global scheduler semantics for open edges;
- automatic promotion of PROTECTED material;
- automatic inference of continuity across lanes;
- branch deletion after merge;
- semantic translation of foreign owner-local receipts;
- overloading Project 0 Snap-State as reconstitution;
- claiming that the fourfold design model is metaphysical truth;
- EAR/audio-listening functionality in this slice.

EAR may later be an excellent client of PHASELIFT because exact audio, listening projections, transcriptions, musical analyses, and witness receipts need the same carrier/projection/authority separations. It is deliberately not part of this implementation gate.

## 23. Acceptance criteria for the architecture

The design is ready for implementation planning when the human reviewer accepts these claims:

1. Project 0, not a new crossing repo, owns portable shared crossing/continuity semantics.
2. LOADOUT owns receiver-local reconstitution and world birth in the first proof.
3. Crossing testimony carries provenance and continuity evidence but never destination authority.
4. Existing `p0.exchange/0.1` is reused as an established-source-reference boundary, not silently widened with imagined top-level fields.
5. HOME is relational continuity, not world snapshot restoration.
6. PROTECTED remains receiver-local until repeated cross-project need justifies standardization.
7. Open continuations cross as testimony/proposals, not executable edges.
8. Threshold is a receiver-local relation between source crossing and local constitution and is not Project 0 Snap-State.
9. A new world gets an explicit occurrence birthday.
10. Forks remain independent histories; later encounter does not retroactively share knowledge.
11. Merge is optional and, when chosen, creates a new descendant rather than rewriting parents.
12. Nested worlds use the same crossing law; locality does not bypass authority.
13. Boot the House remains a valid predecessor specimen rather than being overwritten by PHASELIFT terminology.
14. The first proof is narrow enough to execute with existing Project 0 + LOADOUT floors before wider federation work.

## 24. Self-review result

The architectural self-review found and corrected three scope leaks before this human-review version:

1. **No new `crossing` repo.** Project 0 already owns portable crossing semantics.
2. **No imagined World Encounter fields.** The first proof must work through the existing established-source-reference boundary or stop for a versioned Project 0 design.
3. **No threshold name collision.** PHASELIFT reconstitution threshold remains receiver-local and distinct from Project 0 Snap-State.

No `TODO`, `TBD`, placeholder behavior, ontology expansion, or implementation authorization remains in this spec.

## 25. Design seal

```text
THE SAPLING THROUGH THE FLOOR,
BUT NOT OVER THE TABLE.

CARRY THE ROAD.
DO NOT CARRY THE THRONE.

THREE CAN CARRY A WORLD TO THE EDGE.
THE FOURTH IS BORN WHEN THE EDGE BECOMES A PLACE TO STAND.
```

PHASELIFT is therefore defined, for this project slice, as:

```text
LOCAL SOVEREIGNTY
+ PORTABLE TESTIMONY
+ TYPED CONTINUITY
+ RECEIVER-LOCAL THRESHOLD
+ RECONSTITUTABLE CONTINUATION
+ OPEN FUTURE
```

The next step after human spec approval is a written implementation plan. No code or runtime mutation is authorized by this design commit alone.
