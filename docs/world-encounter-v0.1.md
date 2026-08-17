# World Encounter Envelope v0.1

## Status

Experimental Floor 1.2 reference specimen.

This module proves one bounded offline encounter profile. It is not a universal world protocol, network transport, authority-transfer mechanism, ontology translator, route planner, or master graph.

## Proven claim

> A source frame may send bounded testimony across a declared boundary; the destination must decide locally what that testimony is allowed to become. Crossing never carries sovereignty.

The current fixture proves this only for one pinned Project0 → Corpus OS encounter.

## Contract

Protocol: `p0.exchange/0.1`

Experimental addressing domain: `Project0-WorldEncounter-v0.1|`

Experimental references: `enc-<64 lowercase hex>`

World Encounter records reuse Project0's existing canonicalization and SHA-256 path. They do not become canonical `node-`, `edge-`, `rect-`, or NAV identities.

An exchange envelope carries an already-established source reference plus source provenance, disclosure, epistemic kind, verification state, capability description, limitations, and source-authority references. Those authority references remain provenance about the source frame. Transport never copies them into destination authority.

The destination supplies its own manifest, granted scopes, and authority references. Evaluation is pure and ordered:

```text
validate representation
  ↓
validate protocol and manifest
  ↓
check accepted epistemic class
  ↓
check declared destination capability
  ↓
enforce manifest scopes + envelope disclosure + local required scope
  ↓
only then permit inspection
  ↓
admitted | refused | indeterminate
```

A manifest is capability metadata, not a grant. Receiving, parsing, verifying, or content-addressing an envelope does not canonize its object.

## Pinned specimen

The first fixture reuses the already-landed NAV Project0 → Corpus OS frame lineage. The offered object is an exact Project0 source reference pinned to commit `0961e44f7fabc5807acea2b267009230f1e846c3` and the `src/nav-crossing/index.ts` blob used by the existing lawful-navigation specimen.

The source envelope carries no executable authority. Corpus OS supplies destination-local acceptance and scope declarations.

Three outcomes are executable:

- **admitted** — the offered source reference may become inspectable destination evidence; destination authority remains unchanged; NAV observes bounded evidence/particularity change;
- **refused** — missing scope/disclosure fails before object inspection;
- **indeterminate** — a missing local determination remains indeterminate rather than being coerced into refusal or admission.

All outcomes leave the source envelope and pinned source history unchanged.

## Security and meaning boundaries

The implementation fails closed when:

- the protocol version is unsupported;
- unknown top-level envelope fields appear;
- source and destination authority references overlap by transport;
- a destination tries to accept a source epistemic class it did not declare;
- a required destination capability is undeclared;
- any manifest-required, envelope-disclosure, or locally required scope is not granted;
- hostile accessors, sparse arrays, cycles, custom prototypes, or other non-canonical values appear;
- an existing `enc-...` reference is paired with a different body;
- an externally supplied encounter disposition contradicts itself.

A valid addressed disposition is semantically constrained:

- `admitted` ↔ `ENCOUNTER_ADMITTED` ↔ `inspectedObject: true`;
- `indeterminate` ↔ `ENCOUNTER_INDETERMINATE` ↔ `inspectedObject: false`;
- `refused` ↔ a bounded refusal reason ↔ `inspectedObject: false`.

## TDD evidence

The implementation was developed through explicit repository-level RED → GREEN cycles in GitHub Actions. Every run below executes `npm run verify:all`, covering TypeScript checking, Node tests, independent canonical-addressing fixture verification, and the Floor 1.1 conformance gate.

### Core contract

- RED — head `fb66fe387533e57d0c87dad076a1d8d3193fc7c9`, run #73 (`31992280079`): failed because `src/world-encounter/index` did not exist.
- GREEN — head `a0d27a0cab834c53bc6ae1551339a5798592434a`, run #81 (`31992409249`): full gate passed after the minimal contract/evaluator existed.

### Pinned Project0 → Corpus OS encounter

- RED — head `d5a3442a7083e451f44fc3987796ec66f3d3f9f1`, run #82 (`31992459985`): failed because the required pinned encounter fixture did not exist.
- GREEN — head `7a493a829db48dc034b982b95a1f537ebfe6d77d`, run #83 (`31992496830`): full gate passed with the admitted/refused/indeterminate NAV specimen.

### Exact identity / hostile input

- Clean RED — head `3f20c6a6b8c1ba128a859dfe7891ff9a294ad886`, run #85 (`31992561827`): failed only because exact `enc-...` verification was absent.
- GREEN — head `4d917b51cd9198819281cacc759f41cee8e11823`, run #86 (`31992598261`): full gate passed with exact-address verification and adversarial coverage.

## Riqor owner-review corrections

Owner-style review found three boundary defects after the initial implementation. Each received a regression test before its fix.

1. **Disclosure weakening:** a caller-selected `requiredScope` could be weaker than the envelope's own disclosure class.
   - RED — `3ea1ac5985d5051c01eaf0eb5583730066094438`, run #87 (`31992710841`): 141/142 tests passed; the private-envelope regression was the sole failure.
   - GREEN — `8e73591dba0a2e835c92bc98809e95b59ea1702b`, run #88 (`31992746844`): full gate passed after all manifest, envelope, and local scopes became independent requirements.

2. **Hostile evaluation options:** envelope/context validation was descriptor-safe, but evaluation options could still execute accessors.
   - RED — `732d82d683ea9010327d221b469dab1a4103bca7`, run #89 (`31992779052`): 142/143 tests passed; the accessor regression was the sole failure.
   - GREEN — `a69357579ee52ab5b40d95a1907d6a29231b2a84`, run #90 (`31992817909`): the full `npm run verify:all` step passed after applying the canonical representation guard to options.

3. **Contradictory disposition witness:** an externally supplied disposition could receive an `enc-...` identity even when status, reason, and inspection state contradicted one another.
   - RED — `bfb9d351d010fe6891a5e849b12b668dee3e30fe`, run #91 (`31992859028`): 143/144 tests passed; contradictory disposition admission was the sole failure.
   - GREEN — `6ae39233a6c948187ec5257e0f43b52b7cdcc5b2`, run #92 (`31992944632`): the full `npm run verify:all` step passed after disposition consistency became a validation invariant.

## What remains open

This proof intentionally leaves most of Floor 1.2 unfinished:

- extension namespaces;
- compatibility and migration rules beyond rejecting unsupported `0.1` variants;
- a real TranchNode adapter;
- a materially different downstream adapter;
- relationship-preserving import/export round trips;
- network transport, discovery, authentication, or remote inboxes;
- semantic translation or ontology mapping;
- portable destination authority;
- route search or automatic traversal.

The next meaningful graduation test is not “add more fields.” It is whether a real downstream organ can independently implement the same boundary while preserving its own ontology and authority.