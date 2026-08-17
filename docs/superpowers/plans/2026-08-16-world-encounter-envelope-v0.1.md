# World Encounter Envelope v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove one offline Project0 → Corpus OS encounter where bounded testimony crosses, destination authority remains local, source history remains unchanged, and NAV can witness the resulting bounded difference.

**Architecture:** Add one experimental `src/world-encounter/` module using the existing Project0 canonicalization path and no new canonical ontology/receipt kinds. Address envelope/disposition records under `Project0-WorldEncounter-v0.1|` as `enc-<sha256>`, evaluate disclosure and manifest constraints before inspection, and compose the resulting destination frame with existing NAV only after local evaluation.

**Tech Stack:** TypeScript 7, Node test runner, existing `canonicalizeDomainValue(...)`, existing NAV v0.1 module.

## Global Constraints

- Only protocol `p0.exchange/0.1` is accepted.
- Experimental domain prefix is exactly `Project0-WorldEncounter-v0.1|`; experimental refs are `enc-<64 lowercase hex>`.
- No new canonical node kind, relationship kind, or `ReceiptType`.
- No second serializer or hasher.
- Source authority references are provenance only and never populate destination authority.
- Disclosure/scope admission occurs before object inspection.
- `admitted`, `refused`, and `indeterminate` remain distinct.
- Source inputs are never mutated.
- No network, registry, discovery, model, database, UI, RPC, authentication, route search, automatic traversal, or master graph.

---

### Task 1: Freeze the encounter contract with RED acceptance tests

**Files:**
- Create: `tests/world-encounter.test.ts`
- Create: `tests/world-encounter-adversarial.test.ts`

**Interfaces:**
- Consumes: existing `createNavCrossingReceipt(...)` and canonical addressing.
- Produces expected public API names: `WORLD_ENCOUNTER_DOMAIN_PREFIX`, `addressEncounterRecord`, `evaluateEncounter`, `validateExchangeEnvelope`, `validateDestinationEncounterContext`, plus exported contract types.

- [ ] **Step 1: Write failing tests** for deterministic envelope identity, normalized set fields, admitted/refused/indeterminate evaluation, source-authority non-transfer, disclosure-before-inspection, manifest-is-not-grant, source immutability, protocol/tamper rejection, hostile accessor/prototype inputs, and NAV post-encounter composition.
- [ ] **Step 2: Run `npm run verify:all`.** Expected RED: TypeScript cannot resolve `../src/world-encounter/index` while all pre-existing gates remain otherwise unchanged.
- [ ] **Step 3: Commit the RED tests** with no production implementation.

### Task 2: Implement types, validation, and experimental addressing

**Files:**
- Create: `src/world-encounter/types.ts`
- Create: `src/world-encounter/validate.ts`
- Create: `src/world-encounter/address.ts`
- Create: `src/world-encounter/index.ts`

**Interfaces:**
- `addressEncounterRecord(recordType, body)` returns `{ ref, digestHex, canonicalBytes, recordType, body }`.
- `validateExchangeEnvelope(value)` and `validateDestinationEncounterContext(value)` fail closed with stable `ENCOUNTER_*` codes.
- Set-like arrays are sorted/deduplicated by code-unit order before addressing.

- [ ] **Step 1: Implement only enough types/validation/addressing to satisfy structural and identity tests.**
- [ ] **Step 2: Run focused tests, then `npm run verify:all`.** Expected remaining failures are evaluation-only.
- [ ] **Step 3: Commit the GREEN structural slice.**

### Task 3: Implement destination-local pure evaluation

**Files:**
- Create: `src/world-encounter/evaluate.ts`
- Modify: `src/world-encounter/index.ts`

**Interfaces:**
- `evaluateEncounter(envelope, context, options?)` returns an addressed `EncounterDispositionV01`.
- Evaluation order: structure → protocol → accepted class → declared capability → required scope/disclosure → optional caller-supplied local determination → disposition.
- `inspectedObject` is false for every pre-inspection refusal/indeterminate path.
- `destinationAuthorityRefs` come only from `DestinationEncounterContextV01`.

- [ ] **Step 1: Make admitted/refused/indeterminate tests GREEN with the smallest pure evaluator.**
- [ ] **Step 2: Prove source authority never transfers and manifest capability claims never act as grants.**
- [ ] **Step 3: Prove all source/context inputs remain unchanged.**
- [ ] **Step 4: Run `npm run verify:all` and commit.**

### Task 4: Add the pinned Project0 → Corpus OS encounter specimen and NAV composition

**Files:**
- Create: `fixtures/world-encounter/project0-to-corpus-os.ts`
- Create: `tests/world-encounter-nav.test.ts`
- Modify: `src/world-encounter/index.ts` only if a tiny composition helper is required; prefer direct existing NAV use from the fixture/test.

**Interfaces:**
- Fixture pins the already-landed Project0/CORPUS evidence lineage from NAV specimen #38 rather than importing downstream runtime code.
- One admitted case adds bounded evidence/particularity only; destination authority remains independently declared.
- One refused case preserves destination frame and carries refusal evidence only in the fixture/test witness, not by mutating source state.
- One indeterminate case remains distinct.

- [ ] **Step 1: Write the fixture-driven NAV test RED before any composition helper.**
- [ ] **Step 2: Implement the minimum fixture/composition needed.**
- [ ] **Step 3: Run `npm run verify:all`. Expected PASS.**
- [ ] **Step 4: Commit.**

### Task 5: Reconcile docs, roadmap, and exact-head evidence

**Files:**
- Modify: `ROADMAP.md`
- Modify: `docs/superpowers/specs/2026-08-16-world-encounter-envelope-v0.1-design.md` only if implementation reveals a factual mismatch.
- Create: `docs/world-encounter-v0.1.md`

- [ ] **Step 1: Document only the executable claim actually proven.** State that this is one offline fixed-pair Floor 1.2 specimen, not a universal world protocol.
- [ ] **Step 2: Mark only the applicable Floor 1.2 roadmap item as evidenced; leave real adapters, migration rules, and contrasting adapters open.
- [ ] **Step 3: Run final `npm run verify:all` and inspect changed-file scope.**
- [ ] **Step 4: Run Riqor owner-style review for authority leakage, inspection-before-permission, ontology creep, and versioning ambiguity. Correct findings test-first.
- [ ] **Step 5: Open/update the implementation PR for issue #39 and bind all readiness claims to the exact current head SHA. Do not merge without fresh explicit per-PR landing authorization.

## Self-review

- Spec coverage: envelope identity, authority boundary, disclosure-first evaluation, three dispositions, source immutability, hostile inputs, and NAV composition all have explicit tasks.
- No placeholders/TODOs are used as implementation instructions.
- Type and function names are consistent across tasks.
- The plan intentionally does not solve remote transport, semantic translation, authority delegation, discovery, or master navigation.