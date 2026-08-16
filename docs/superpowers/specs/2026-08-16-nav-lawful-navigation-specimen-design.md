# NAV v0.1 Lawful Navigation Specimen Design

## Purpose

Prove one real cross-repository crossing with the already-landed NAV v0.1 primitive:

`Project0 → Corpus OS`

The route is selected because the pinned Authority Kit registry records `corpus-os CONFORMS_TO project0`. The crossing then reveals Corpus OS Latent Reachability as a newly visible downstream particularity.

The specimen proves only:

`evidenced nearby door → deliberate crossing → bounded changed-field witness`

It does not prove route optimality, traversal authority, execution permission, global reachability, or a universal world graph.

## Source evidence

- Front Room threshold law: live GitBook `Field Traversal & Illumination`, especially `Threshold probing is not traversal`; metadata probing may inspect destination/relation/reachability/provenance/relevance before deliberate crossing.
- Authority Kit registry: `the-static-collective/jubilee-authority-kit` commit `b99dd1bf3e9af4c30a4f0e365237357086b7fdf6`, `registry/projects.json` version 1 / updated 2026-08-09, containing Corpus OS `CONFORMS_TO project0`.
- Corpus OS destination: commit `f54c808c3c91a599f47189a1e873c8adcaff7143`; `runtime/latent-reachability.ts` blob `e31f97d27a16c15a79ea3062dfdad2214413cc81`.
- Pollen Scout / Founder Node PR #2 is corroborating design lineage only. It remains draft and is not a fixture dependency.

## Fixture architecture

Add one fixture-only TypeScript module under `fixtures/nav/`. It exports:

- immutable source-evidence metadata;
- one `FrameSnapshot` before declaration;
- one `CrossingDeclaration`;
- one `FrameSnapshot` after declaration.

No runtime module imports external repositories. All external evidence is represented by pinned string refs. Tests are offline.

## Before frame

The before field is Project0 at the NAV-v0.1 merge line.

- `frameRef`: Project0 field identity for commit `0961e44f7fabc5807acea2b267009230f1e846c3`;
- `constitutionRef`: pinned Project0 commit ref;
- `authorityRefs`: empty;
- stable fixture-local decoder and participant refs;
- `evidenceRefs`: Front Room threshold-law ref + pinned Authority Kit relation ref;
- particularity anchors:
  - `current-project` → pinned Project0 ref;
  - `nearby-door` → pinned Corpus OS ref.

The presence of `nearby-door` means only that the destination has been identified at the boundary. It does not mean destination content has been loaded.

## Crossing declaration

- kind: `room_crossing`;
- declared purpose: inspect one evidenced neighboring embodiment without expanding authority;
- crossing evidence: threshold-law ref + Authority Kit relation ref.

Crossing evidence stays evidence. It never enters `authorityRefs`.

## After frame

The after field is Corpus OS at commit `f54c808...`.

- frame/constitution change to Corpus OS;
- `authorityRefs` remains empty;
- decoder and participant remain unchanged;
- evidence retains the threshold/relationship refs and adds the pinned Latent Reachability source ref;
- particularity anchors:
  - `current-project` changes Project0 → Corpus OS;
  - `nearby-door` remains Corpus OS, because the selected destination is still the same particular;
  - `prospective-reachability` appears only after crossing and points at the pinned Latent Reachability source.

## Required observations

Existing NAV v0.1 must produce:

- `frame`: changed;
- `constitution`: changed;
- `authority`: preserved, with empty before/after refs;
- `decoder`: preserved;
- `evidence`: changed;
- `participant`: preserved;
- `particularity:current-project`: changed;
- `particularity:nearby-door`: preserved;
- `particularity:prospective-reachability`: new_after;
- crossing status: `materially_changed`.

The addressed crossing receipt must remain in the experimental `nav-...` domain and be byte/digest deterministic for repeated construction from the same declarations.

## TDD strategy

RED first: add a test importing the not-yet-existing fixture module and asserting the exact observations above. Repository `npm run verify:all` must fail before the fixture exists.

GREEN: add only the fixture module. No `src/nav-crossing/*`, canonical-addressing, ontology, reference-kernel, or receipt-contract file may change. Full `npm run verify:all` must pass.

## Compatibility / authority boundary

This is fixture coverage only. It does not add a NAV comparison dimension, canonical ontology kind, relationship kind, receipt kind, routing algorithm, authority grant, external network dependency, or cross-repository runtime import.

`CONFORMS_TO` explains why the door is relevant; it does not authorize crossing. Latent Reachability is what becomes newly visible after crossing; it does not authorize navigation or future execution.

## Follow-on

After the executable fixture lands, the GitBook-synced Front Room may publish a human-readable evidence specimen that points back to this exact fixture and NAV receipt lineage. That document remains a projection of the executable proof, not a second implementation.
