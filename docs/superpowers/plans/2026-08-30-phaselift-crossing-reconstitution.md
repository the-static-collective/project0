# PHASELIFT Crossing/Reconstitution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove `CROSSING-001 / RECONSTITUTE-001`: one Project 0 World Encounter + Continuity specimen crosses into LOADOUT, is evaluated under receiver-local law, and produces a new attributable world occurrence without importing source authority or rewriting historical producers.

**Architecture:** Project 0 remains the portable testimony/continuity owner. It contributes one deterministic fixture using only `p0.exchange/0.1` and `p0.continuity/0.1`; no Project 0 source contract changes are expected. LOADOUT vendors that exact fixture with provenance, parses only the boundary shape it needs, evaluates a receiver-local `loadout.reconstitution-threshold/v0`, and emits a `loadout.world-birth/v0` receipt only for `LIFT` or `DEGRADED`. Existing LOADOUT `compile_loadout(...)` performs local capability/fence/authorization binding; source authority references remain historical evidence only.

**Tech Stack:** Project 0: TypeScript 7, Node test runner, existing canonical addressing + World Encounter + Typed Continuity Braid. LOADOUT: Python 3.11+, standard library production code, pytest, existing `loadout.compile/v0` and SHA-256 canonical JSON helper.

**Spec:** `docs/superpowers/specs/2026-08-30-phaselift-crossing-reconstitution-design.md`

## Global Constraints

- Do not create a new `crossing` repository or second universal crossing ontology.
- Do not add new top-level fields to `p0.exchange/0.1` in this slice.
- Project 0 frozen nine-kind ontology remains unchanged.
- `RECONSTITUTION THRESHOLD != SNAP-STATE THRESHOLD`; no reuse of `p0.snap-state/0.1` semantics.
- Source authority references are provenance only; they never become LOADOUT `effect_authorizations`.
- `source open edge != receiver local edge`; any local continuation proposal receives a new LOADOUT-local identity.
- `PROTECTED` remains receiver-local administrative state; no Project 0 node/status promotion.
- `CURRENT BODY != HISTORICAL PRODUCER`; historical producer refs must survive rebinding unchanged.
- `HOLD` and `REFUSE` never emit a world-birth receipt.
- Malformed input/protocol failure remains distinct from constitutional `REFUSE`.
- Production LOADOUT code remains Python-standard-library-only.
- No daemon, network plane, scheduler, registry, master graph, or automatic merge policy enters this proof.

---

## File Structure

### Project 0

- Create `fixtures/phaselift/CROSSING-001-source.json` — unaddressed deterministic source specimen composed only from existing Project 0 contracts plus a clearly non-normative fixture wrapper.
- Create `tests/phaselift-crossing-source.test.ts` — verifies the envelope, continuity claim, canonical refs, and destination-local authority separation without modifying `src/`.
- Modify no Project 0 `src/**` file unless the fixture demonstrates a real gap. If a `src/**` change becomes necessary, stop and return to design because the approved spec requires a versioned Project 0 boundary decision.

### LOADOUT

- Create `fixtures/phaselift/project0-CROSSING-001.json` — byte-for-byte vendored Project 0 fixture after Task 1 commits.
- Create `fixtures/phaselift/project0-CROSSING-001.provenance.json` — source repo/commit/path/SHA-256 pin.
- Create `src/loadout/adapters/project0.py` — minimal boundary parser; no Project 0 semantic reimplementation.
- Create `src/loadout/reconstitution.py` — threshold evaluation, local proposal rehydration, and world-birth/reconstitution logic.
- Create `schemas/reconstitution-threshold-v0.schema.json` — documentary machine shape matching runtime output.
- Create `schemas/world-birth-v0.schema.json` — documentary machine shape matching runtime output.
- Create `tests/test_project0_phaselift_adapter.py` — adapter/provenance/authority non-transfer tests.
- Create `tests/test_reconstitution.py` — LIFT/DEGRADED/HOLD/REFUSE, HOME, protected hold, rebinding, world-birth tests.
- Create `tests/test_phaselift_crossing_001.py` — full hostile matrix + fork specimen.
- Modify `src/loadout/cli.py` and `tests/test_cli.py` — add one `reconstitute` machine command for the executable specimen.
- Create `evals/CROSSING-001.md` — exact proof and refusal surface.
- Modify `README.md` — expose the new command and proof without claiming a universal runtime.

---

### Task 1: Freeze the Project 0 source crossing without changing Project 0 law

**Repository:** `the-static-collective/project0`

**Files:**
- Create: `fixtures/phaselift/CROSSING-001-source.json`
- Create: `tests/phaselift-crossing-source.test.ts`
- Verify unchanged: `src/world-encounter/**`, `src/continuity-profile/**`

**Interfaces:**
- Consumes: `addressEncounterRecord("exchange_envelope", envelope)`, `evaluateEncounter(envelope, context, options)`, `addressContinuityClaim(claim)`, `verifyContinuityClaim(ref, claim)`.
- Produces: one committed JSON fixture whose top-level fixture wrapper is `phaselift.source-fixture/v0`; LOADOUT will vendor the exact bytes and pin this task's commit SHA.

- [ ] **Step 1: Write the failing Project 0 specimen test**

Create `tests/phaselift-crossing-source.test.ts` with this shape:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  addressEncounterRecord,
  evaluateEncounter,
} from "../src/world-encounter/index";
import {
  addressContinuityClaim,
  verifyContinuityClaim,
} from "../src/continuity-profile/index";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/phaselift/CROSSING-001-source.json", import.meta.url), "utf8"),
);

test("CROSSING-001 source uses existing Project 0 contracts only", () => {
  assert.equal(fixture.schema, "phaselift.source-fixture/v0");
  const addressedEnvelope = addressEncounterRecord("exchange_envelope", fixture.envelope);
  const continuityRef = addressContinuityClaim(fixture.continuityClaim);

  assert.match(addressedEnvelope.ref, /^enc-[0-9a-f]{64}$/);
  assert.match(continuityRef, /^cty-[0-9a-f]{64}$/);
  assert.equal(verifyContinuityClaim(continuityRef, fixture.continuityClaim), true);
  assert.deepEqual(fixture.envelope.sourceAuthorityRefs, ["authority:source-repo-write"]);
  assert.equal(fixture.continuityClaim.occurrenceClaim, "continuation-only");
});

test("LOADOUT-shaped destination may inspect without inheriting source authority", () => {
  const result = evaluateEncounter(
    fixture.envelope,
    fixture.destinationContext,
    fixture.encounterOptions,
  );

  assert.equal(result.body.status, "admitted");
  assert.equal(result.body.inspectedObject, true);
  assert.deepEqual(result.body.destinationAuthorityRefs, ["authority:loadout-local-read"]);
  assert.equal(result.body.destinationAuthorityRefs.includes("authority:source-repo-write"), false);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm run build --silent && node --test .build/tests/phaselift-crossing-source.test.js
```

Expected: FAIL because `fixtures/phaselift/CROSSING-001-source.json` does not exist.

- [ ] **Step 3: Add the minimum fixture**

Create `fixtures/phaselift/CROSSING-001-source.json` with exactly this logical payload:

```json
{
  "schema": "phaselift.source-fixture/v0",
  "envelope": {
    "protocolVersion": "p0.exchange/0.1",
    "originNodeRef": "project0-phaselift-source",
    "originFrameRef": "world:A",
    "originVersionRef": "fixture-version:A1",
    "offered": {
      "objectRef": "testimony:CROSSING-001",
      "mediaType": "application/json",
      "sourceReceiptRefs": ["receipt:dogram:A1", "receipt:alex:A1"],
      "disclosureClass": "public"
    },
    "sourceProvenanceRefs": ["producer:dogram:A1", "producer:alex:A1"],
    "sourceAuthorityRefs": ["authority:source-repo-write"],
    "sourceEpistemicKind": "witness",
    "sourceVerificationState": "verified",
    "capabilityUsed": "offer_public_witness",
    "limitations": [
      "source-authority-not-portable",
      "source-open-proposal-not-executable",
      "fixture-only"
    ]
  },
  "continuityClaim": {
    "schema": "p0.continuity/0.1",
    "purpose": "CROSSING-001 successor-world continuity",
    "subjectRef": "task:CROSSING-001",
    "ancestorRoots": ["receipt:dogram:A1", "receipt:alex:A1"],
    "environment": {
      "runtimeRef": "world:A",
      "policyRefs": ["policy:source-local"],
      "contextRefs": ["context:crossing-001"]
    },
    "lanes": [
      {
        "lane": "identity",
        "mode": "preserved",
        "dimensions": [
          {
            "dimension": "logical-task-address",
            "evidenceRefs": ["task:CROSSING-001"]
          }
        ],
        "transformationRefs": [],
        "residualRefs": [],
        "uncertainty": [],
        "doesNotEstablish": ["authority"]
      },
      {
        "lane": "protocol",
        "mode": "transformed",
        "dimensions": [
          {
            "dimension": "receiver-may-reconstitute-under-local-law",
            "evidenceRefs": ["receipt:dogram:A1"]
          }
        ],
        "transformationRefs": ["proposal:reconstitute"],
        "residualRefs": [],
        "uncertainty": [],
        "doesNotEstablish": ["authority"]
      },
      {
        "lane": "purpose-meaning",
        "mode": "preserved",
        "dimensions": [
          {
            "dimension": "bounded-purpose",
            "evidenceRefs": ["task:CROSSING-001"]
          }
        ],
        "transformationRefs": [],
        "residualRefs": [],
        "uncertainty": [],
        "doesNotEstablish": ["authority"]
      },
      {
        "lane": "authority",
        "mode": "unresolved",
        "dimensions": [
          {
            "dimension": "source-authority-is-historical-only",
            "evidenceRefs": ["authority:source-repo-write"]
          }
        ],
        "transformationRefs": [],
        "residualRefs": ["authority:source-repo-write"],
        "uncertainty": ["receiver must authorize locally"],
        "doesNotEstablish": ["identity", "protocol", "purpose-meaning"]
      }
    ],
    "outputRefs": ["testimony:CROSSING-001"],
    "parentContinuityRefs": [],
    "occurrenceClaim": "continuation-only"
  },
  "sourceHints": {
    "protectedRefs": ["artifact:odd-small-1"],
    "openProposals": [
      {
        "sourceProposalRef": "proposal:inspect-next",
        "kind": "runnable-specimen"
      }
    ]
  },
  "destinationContext": {
    "destinationNodeRef": "loadout-phaselift-fixture",
    "destinationFrameRef": "world:B-candidate",
    "manifest": {
      "nodeRef": "loadout-phaselift-fixture",
      "protocolVersion": "p0.exchange/0.1",
      "accepts": ["witness"],
      "emits": ["witness"],
      "capabilities": ["receive_public_witness"],
      "requiredScopes": ["public"],
      "mustNever": ["accept_source_authority_as_local"]
    },
    "grantedScopes": ["public"],
    "destinationAuthorityRefs": ["authority:loadout-local-read"]
  },
  "encounterOptions": {
    "requiredCapability": "receive_public_witness",
    "requiredScope": "public",
    "localDetermination": "admit",
    "evidenceRefs": ["policy:loadout-local"]
  }
}
```

The wrapper fields `sourceHints`, `destinationContext`, and `encounterOptions` are fixture scaffolding, not new `p0.exchange/0.1` fields.

- [ ] **Step 4: Run Project 0 verification**

Run:

```bash
npm run verify:all
```

Expected: PASS with no changed file under `src/`.

- [ ] **Step 5: Commit the Project 0 fixture**

```bash
git add fixtures/phaselift/CROSSING-001-source.json tests/phaselift-crossing-source.test.ts
git commit -m "test: freeze PHASELIFT source crossing"
```

Record this exact commit SHA; Task 2 pins it in LOADOUT.

---

### Task 2: Add the LOADOUT Project 0 boundary adapter and provenance pin

**Repository:** `the-static-collective/LOADOUT`

**Files:**
- Create: `fixtures/phaselift/project0-CROSSING-001.json`
- Create: `fixtures/phaselift/project0-CROSSING-001.provenance.json`
- Create: `src/loadout/adapters/project0.py`
- Create: `tests/test_project0_phaselift_adapter.py`

**Interfaces:**
- Consumes: exact Task 1 fixture bytes; provenance object with `source_repo`, `source_commit`, `source_path`, `source_sha256`.
- Produces: `parse_project0_handoff(bundle: dict, provenance: dict) -> dict` returning `schema == "loadout.project0-handoff/v0"`.

- [ ] **Step 1: Vendor the exact Project 0 fixture bytes**

Copy the Task 1 file byte-for-byte into:

```text
fixtures/phaselift/project0-CROSSING-001.json
```

Compute its SHA-256 and create `fixtures/phaselift/project0-CROSSING-001.provenance.json`:

```json
{
  "source_repo": "the-static-collective/project0",
  "source_commit": "<Task-1-exact-commit-sha>",
  "source_path": "fixtures/phaselift/CROSSING-001-source.json",
  "source_sha256": "sha256:<64-lowercase-hex>"
}
```

Replace the angle-bracket values with the actual Task 1 commit and digest before committing; they are execution-time evidence, not design placeholders.

- [ ] **Step 2: Write the failing adapter tests**

Create `tests/test_project0_phaselift_adapter.py`:

```python
import hashlib
import json
from pathlib import Path

from loadout.adapters.project0 import parse_project0_handoff

ROOT = Path(__file__).parents[1]


def fixture_bytes():
    return (ROOT / "fixtures/phaselift/project0-CROSSING-001.json").read_bytes()


def fixture_bundle():
    return json.loads(fixture_bytes())


def provenance():
    return json.loads((ROOT / "fixtures/phaselift/project0-CROSSING-001.provenance.json").read_text())


def test_project0_fixture_pin_matches_exact_bytes():
    digest = "sha256:" + hashlib.sha256(fixture_bytes()).hexdigest()
    assert digest == provenance()["source_sha256"]


def test_adapter_preserves_source_authority_as_history_only():
    handoff = parse_project0_handoff(fixture_bundle(), provenance())
    assert handoff["schema"] == "loadout.project0-handoff/v0"
    assert handoff["source_authority_refs"] == ["authority:source-repo-write"]
    assert "effect_authorizations" not in handoff
    assert handoff["historical_producer_refs"] == ["producer:alex:A1", "producer:dogram:A1"]
    assert handoff["protected_requests"] == ["artifact:odd-small-1"]
    assert handoff["source_open_proposals"][0]["sourceProposalRef"] == "proposal:inspect-next"
```

- [ ] **Step 3: Run the adapter test to verify RED**

Run:

```bash
pytest -q tests/test_project0_phaselift_adapter.py
```

Expected: FAIL because `loadout.adapters.project0` does not exist.

- [ ] **Step 4: Implement the minimal parser**

Create `src/loadout/adapters/project0.py`:

```python
from __future__ import annotations

from loadout.canonical import sha256_json


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def parse_project0_handoff(bundle: dict, provenance: dict) -> dict:
    _require(isinstance(bundle, dict), "project0 fixture must be an object")
    _require(bundle.get("schema") == "phaselift.source-fixture/v0", "unsupported source fixture")

    envelope = bundle.get("envelope")
    continuity = bundle.get("continuityClaim")
    hints = bundle.get("sourceHints", {})
    _require(isinstance(envelope, dict), "project0 envelope required")
    _require(envelope.get("protocolVersion") == "p0.exchange/0.1", "unsupported encounter protocol")
    _require(isinstance(continuity, dict), "continuity claim required")
    _require(continuity.get("schema") == "p0.continuity/0.1", "unsupported continuity protocol")

    source_authority_refs = sorted(envelope.get("sourceAuthorityRefs", []))
    producer_refs = sorted(
        ref for ref in envelope.get("sourceProvenanceRefs", [])
        if isinstance(ref, str) and ref.startswith("producer:")
    )

    return {
        "schema": "loadout.project0-handoff/v0",
        "source_fixture": {
            "repo": provenance["source_repo"],
            "commit": provenance["source_commit"],
            "path": provenance["source_path"],
            "sha256": provenance["source_sha256"],
        },
        "source_encounter": envelope,
        "continuity_claim": continuity,
        "source_authority_refs": source_authority_refs,
        "historical_producer_refs": producer_refs,
        "protected_requests": sorted(hints.get("protectedRefs", [])),
        "source_open_proposals": list(hints.get("openProposals", [])),
        "handoff_digest": sha256_json({
            "source_fixture": provenance,
            "source_encounter": envelope,
            "continuity_claim": continuity,
            "protected_requests": sorted(hints.get("protectedRefs", [])),
            "source_open_proposals": list(hints.get("openProposals", [])),
        }),
    }
```

This adapter intentionally does not reimplement Project 0 canonical addressing. Exact Project 0 conformance was proven in Task 1; LOADOUT pins the specimen bytes and consumes only the declared boundary fields.

- [ ] **Step 5: Run adapter tests and full LOADOUT suite**

Run:

```bash
pytest -q tests/test_project0_phaselift_adapter.py
pytest -q
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add fixtures/phaselift src/loadout/adapters/project0.py tests/test_project0_phaselift_adapter.py
git commit -m "feat: receive pinned Project0 PHASELIFT handoff"
```

---

### Task 3: Implement receiver-local threshold, HOME evaluation, PROTECTED hold, and proposal rehydration

**Repository:** `the-static-collective/LOADOUT`

**Files:**
- Create: `src/loadout/reconstitution.py`
- Create: `schemas/reconstitution-threshold-v0.schema.json`
- Create: `tests/test_reconstitution.py`

**Interfaces:**
- Consumes: `handoff` from `parse_project0_handoff(...)` and one local `request` dict.
- Produces: `evaluate_reconstitution_threshold(handoff: dict, request: dict) -> dict` with `schema == "loadout.reconstitution-threshold/v0"`, `disposition in {LIFT, DEGRADED, HOLD, REFUSE}`, and `home_check in {PASS, DEGRADED, REFUSE}`.
- Produces: receiver-local proposal records with `schema == "loadout.local-proposal/v0"`, each carrying `source_proposal_ref` without reusing it as the local ID.

- [ ] **Step 1: Write threshold tests first**

Add to `tests/test_reconstitution.py`:

```python
from loadout.reconstitution import evaluate_reconstitution_threshold


def base_request():
    return {
        "threshold_id": "threshold:B1",
        "receiving_constitution_ref": "constitution:loadout:B1",
        "continuity_requirements": {
            "identity": ["preserved", "transformed"],
            "protocol": ["preserved", "transformed", "reconstituted"],
            "purpose-meaning": ["preserved", "transformed"],
        },
        "missing_evidence_refs": [],
        "fatal_missing_refs": [],
        "protect_refs": ["artifact:odd-small-1"],
        "adopt_source_proposals": ["proposal:inspect-next"],
        "hold": False,
        "refuse_reason": None,
    }


def test_threshold_lifts_when_home_requirements_are_satisfied(handoff):
    result = evaluate_reconstitution_threshold(handoff, base_request())
    assert result["disposition"] == "LIFT"
    assert result["home_check"] == "PASS"
    assert result["locally_protected_refs"] == ["artifact:odd-small-1"]
    assert result["local_proposals"][0]["source_proposal_ref"] == "proposal:inspect-next"
    assert result["local_proposals"][0]["proposal_id"] != "proposal:inspect-next"


def test_threshold_degrades_when_nonfatal_evidence_is_missing(handoff):
    request = base_request()
    request["missing_evidence_refs"] = ["receipt:dogram:A1"]
    result = evaluate_reconstitution_threshold(handoff, request)
    assert result["disposition"] == "DEGRADED"
    assert result["home_check"] == "DEGRADED"


def test_threshold_holds_without_faking_world_birth(handoff):
    request = base_request()
    request["hold"] = True
    result = evaluate_reconstitution_threshold(handoff, request)
    assert result["disposition"] == "HOLD"


def test_threshold_refuses_failed_required_lane(handoff):
    request = base_request()
    request["continuity_requirements"]["protocol"] = ["preserved"]
    result = evaluate_reconstitution_threshold(handoff, request)
    assert result["disposition"] == "REFUSE"
    assert result["home_check"] == "REFUSE"
```

Use a pytest fixture in the same file that loads the vendored Project 0 bundle/provenance and calls `parse_project0_handoff(...)`.

- [ ] **Step 2: Run the threshold tests to verify RED**

```bash
pytest -q tests/test_reconstitution.py
```

Expected: FAIL because `loadout.reconstitution` does not exist.

- [ ] **Step 3: Implement threshold evaluation**

Create `src/loadout/reconstitution.py` with these exact public functions:

```python
from __future__ import annotations

import copy

from loadout.canonical import sha256_json
from loadout.compile import compile_loadout


LIFTABLE = {"LIFT", "DEGRADED"}


def _lane_modes(continuity_claim: dict) -> dict[str, str]:
    return {
        lane["lane"]: lane["mode"]
        for lane in continuity_claim.get("lanes", [])
        if isinstance(lane, dict) and isinstance(lane.get("lane"), str)
    }


def _local_proposals(handoff: dict, request: dict) -> list[dict]:
    adopted = set(request.get("adopt_source_proposals", []))
    records = []
    for source in handoff.get("source_open_proposals", []):
        source_ref = source.get("sourceProposalRef")
        if source_ref not in adopted:
            continue
        body = {
            "schema": "loadout.local-proposal/v0",
            "source_proposal_ref": source_ref,
            "kind": source.get("kind"),
            "threshold_id": request["threshold_id"],
        }
        body["proposal_id"] = "proposal-local:" + sha256_json(body).removeprefix("sha256:")
        records.append(body)
    return sorted(records, key=lambda item: item["proposal_id"])


def evaluate_reconstitution_threshold(handoff: dict, request: dict) -> dict:
    modes = _lane_modes(handoff["continuity_claim"])
    requirements = request.get("continuity_requirements", {})

    failed_lanes = sorted(
        lane for lane, allowed in requirements.items()
        if modes.get(lane) not in set(allowed)
    )
    missing = sorted(set(request.get("missing_evidence_refs", [])))
    fatal_missing = sorted(set(request.get("fatal_missing_refs", [])) & set(missing))

    if request.get("refuse_reason"):
        home_check = "REFUSE"
        disposition = "REFUSE"
        reason_code = request["refuse_reason"]
    elif failed_lanes or fatal_missing:
        home_check = "REFUSE"
        disposition = "REFUSE"
        reason_code = "HOME_REQUIREMENT_REFUSED"
    elif missing:
        home_check = "DEGRADED"
        disposition = "HOLD" if request.get("hold") else "DEGRADED"
        reason_code = "HOME_EVIDENCE_DEGRADED"
    else:
        home_check = "PASS"
        disposition = "HOLD" if request.get("hold") else "LIFT"
        reason_code = "RECONSTITUTION_HELD" if disposition == "HOLD" else "RECONSTITUTION_LIFTABLE"

    protected = sorted(
        set(request.get("protect_refs", []))
        & set(handoff.get("protected_requests", []))
    )

    record = {
        "schema": "loadout.reconstitution-threshold/v0",
        "threshold_id": request["threshold_id"],
        "source_handoff_digest": handoff["handoff_digest"],
        "receiving_constitution_ref": request["receiving_constitution_ref"],
        "continuity_requirements": copy.deepcopy(requirements),
        "failed_lanes": failed_lanes,
        "missing_evidence_refs": missing,
        "source_authority_refs": copy.deepcopy(handoff.get("source_authority_refs", [])),
        "authority_decision": "REAUTHORIZE_LOCALLY",
        "locally_protected_refs": protected,
        "local_proposals": _local_proposals(handoff, request),
        "home_check": home_check,
        "disposition": disposition,
        "reason_code": reason_code,
    }
    record["threshold_digest"] = sha256_json(record)
    return record
```

The source authority refs are carried only so the receipt can show what was refused as portable warrant; they are never consumed as effect authorization.

- [ ] **Step 4: Add the documentary JSON Schema**

Create `schemas/reconstitution-threshold-v0.schema.json` requiring at minimum:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "schema",
    "threshold_id",
    "source_handoff_digest",
    "receiving_constitution_ref",
    "home_check",
    "disposition",
    "threshold_digest"
  ],
  "properties": {
    "schema": {"const": "loadout.reconstitution-threshold/v0"},
    "home_check": {"enum": ["PASS", "DEGRADED", "REFUSE"]},
    "disposition": {"enum": ["LIFT", "DEGRADED", "HOLD", "REFUSE"]},
    "authority_decision": {"const": "REAUTHORIZE_LOCALLY"}
  },
  "additionalProperties": true
}
```

- [ ] **Step 5: Run focused + full tests**

```bash
pytest -q tests/test_reconstitution.py
pytest -q
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/loadout/reconstitution.py schemas/reconstitution-threshold-v0.schema.json tests/test_reconstitution.py
git commit -m "feat: add receiver-local PHASELIFT threshold"
```

---

### Task 4: Reconstitute a new LOADOUT world and emit its birthday without retrojection

**Repository:** `the-static-collective/LOADOUT`

**Files:**
- Modify: `src/loadout/reconstitution.py`
- Create: `schemas/world-birth-v0.schema.json`
- Modify: `tests/test_reconstitution.py`

**Interfaces:**
- Consumes: a `LIFT` or `DEGRADED` threshold, one normal `compile_loadout(...)` spec, explicit `world_id`, `occurred_at`, and receiver-local `resolved_bodies`.
- Produces: `reconstitute_world(...) -> {"compile": ..., "birth_receipt": ...}`.
- Public signature:

```python
def reconstitute_world(
    handoff: dict,
    threshold: dict,
    compile_spec: dict,
    *,
    world_id: str,
    occurred_at: str,
    resolved_bodies: list[dict],
) -> dict:
    ...
```

- [ ] **Step 1: Add failing world-birth tests**

Append:

```python
import pytest
from loadout.reconstitution import reconstitute_world


def local_compile_spec():
    return {
        "compile_id": "compile:B1",
        "parent_compile_id": None,
        "issued_at": "2026-08-30T06:00:00+00:00",
        "expires_at": "2026-08-30T07:00:00+00:00",
        "world_cut_ref": "world:B1",
        "context_pack_ref": "context:B1",
        "compile_trace": {
            "id": "trace:B1",
            "source_world_ref": "world:A",
            "operation": "reconstitute-from-crossing",
            "preserved_invariants": ["required-capability:repo.read"],
            "declared_loss": [],
            "producer": "loadout.kernel/v0",
            "freshness": "2026-08-30T06:00:00+00:00"
        },
        "capabilities": [
            {
                "capability": "repo.read",
                "operation": "inspect",
                "reachable_effects": [],
                "parameters": {}
            },
            {
                "capability": "repo.write",
                "operation": "intervene",
                "reachable_effects": ["repo.branch.write"],
                "parameters": {}
            }
        ],
        "effect_fence": ["repo.branch.write"],
        "effect_fence_ref": "fence:B1",
        "effect_authorizations": {},
        "owner_evidence_digest": "sha256:" + "b" * 64,
        "egress_policy_ref": "egress:B1"
    }


def test_world_birth_reauthorizes_locally_and_preserves_historical_producers(handoff):
    threshold = evaluate_reconstitution_threshold(handoff, base_request())
    result = reconstitute_world(
        handoff,
        threshold,
        local_compile_spec(),
        world_id="world:B1",
        occurred_at="2026-08-30T06:00:01+00:00",
        resolved_bodies=[
            {"logical_ref": "Dogram", "resolved_body": "dogram:B1"},
            {"logical_ref": "ALEX", "resolved_body": "alex:B1"}
        ],
    )

    compile_record = result["compile"]
    receipt = result["birth_receipt"]
    write = next(item for item in compile_record["effective_effects"] if item["effect"] == "repo.branch.write")

    assert write["status"] == "refused"
    assert receipt["historical_producer_refs"] == ["producer:alex:A1", "producer:dogram:A1"]
    assert receipt["resolved_bodies"][0]["resolved_body"] in {"alex:B1", "dogram:B1"}
    assert "authority:source-repo-write" not in receipt["local_authorization_refs"]
    assert receipt["world_id"] == "world:B1"


def test_hold_and_refuse_cannot_emit_world_birth(handoff):
    for request_patch in ({"hold": True}, {"refuse_reason": "LOCAL_POLICY_REFUSAL"}):
        request = base_request()
        request.update(request_patch)
        threshold = evaluate_reconstitution_threshold(handoff, request)
        with pytest.raises(ValueError, match="threshold is not liftable"):
            reconstitute_world(
                handoff,
                threshold,
                local_compile_spec(),
                world_id="world:forbidden",
                occurred_at="2026-08-30T06:00:01+00:00",
                resolved_bodies=[],
            )
```

- [ ] **Step 2: Run the focused test to verify RED**

```bash
pytest -q tests/test_reconstitution.py
```

Expected: FAIL because `reconstitute_world` is absent.

- [ ] **Step 3: Implement world birth**

Append to `src/loadout/reconstitution.py`:

```python
def reconstitute_world(
    handoff: dict,
    threshold: dict,
    compile_spec: dict,
    *,
    world_id: str,
    occurred_at: str,
    resolved_bodies: list[dict],
) -> dict:
    if threshold.get("disposition") not in LIFTABLE:
        raise ValueError("threshold is not liftable")
    if threshold.get("source_handoff_digest") != handoff.get("handoff_digest"):
        raise ValueError("threshold source mismatch")

    compile_record = compile_loadout(copy.deepcopy(compile_spec))
    local_authorization_refs = sorted({
        item["authorization_source_ref"]
        for item in compile_record.get("effective_effects", [])
        if item.get("status") == "allowed" and item.get("authorization_source_ref")
    })
    refused_bindings = sorted(
        item["capability"]
        for item in compile_record.get("capability_bindings", [])
        if item.get("status") != "available"
    )

    receipt = {
        "schema": "loadout.world-birth/v0",
        "world_id": world_id,
        "source_handoff_digest": handoff["handoff_digest"],
        "threshold_digest": threshold["threshold_digest"],
        "local_constitution_ref": threshold["receiving_constitution_ref"],
        "compile_digest": compile_record["compile_digest"],
        "historical_producer_refs": sorted(handoff.get("historical_producer_refs", [])),
        "resolved_bodies": sorted(copy.deepcopy(resolved_bodies), key=lambda item: item["logical_ref"]),
        "local_authorization_refs": local_authorization_refs,
        "refused_bindings": refused_bindings,
        "home_check": threshold["home_check"],
        "protected_refs": copy.deepcopy(threshold["locally_protected_refs"]),
        "local_proposal_refs": sorted(item["proposal_id"] for item in threshold["local_proposals"]),
        "occurred_at": occurred_at,
    }
    receipt["birth_digest"] = sha256_json(receipt)
    return {"compile": compile_record, "birth_receipt": receipt}
```

- [ ] **Step 4: Add `world-birth-v0` schema**

Create `schemas/world-birth-v0.schema.json` with required fields and the exact schema const:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "schema",
    "world_id",
    "source_handoff_digest",
    "threshold_digest",
    "local_constitution_ref",
    "compile_digest",
    "historical_producer_refs",
    "resolved_bodies",
    "local_authorization_refs",
    "home_check",
    "occurred_at",
    "birth_digest"
  ],
  "properties": {
    "schema": {"const": "loadout.world-birth/v0"},
    "home_check": {"enum": ["PASS", "DEGRADED"]}
  },
  "additionalProperties": true
}
```

- [ ] **Step 5: Run focused + full tests**

```bash
pytest -q tests/test_reconstitution.py
pytest -q
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/loadout/reconstitution.py schemas/world-birth-v0.schema.json tests/test_reconstitution.py
git commit -m "feat: emit attributable world birth receipts"
```

---

### Task 5: Prove the four threshold outcomes and fork without source mutation

**Repository:** `the-static-collective/LOADOUT`

**Files:**
- Create: `tests/test_phaselift_crossing_001.py`
- Create: `evals/CROSSING-001.md`

**Interfaces:**
- Consumes: Task 2 handoff + Task 3 threshold + Task 4 reconstitution.
- Produces: deterministic proof that one immutable source handoff can yield `LIFT`, `DEGRADED`, `HOLD`, and `REFUSE`; only two outcomes may create worlds; two lawful LIFT receivers fork into distinct worlds sharing attributable ancestry.

- [ ] **Step 1: Write the hostile matrix**

Create `tests/test_phaselift_crossing_001.py` with four local requests:

```python
import copy
import json
from pathlib import Path

from loadout.adapters.project0 import parse_project0_handoff
from loadout.reconstitution import evaluate_reconstitution_threshold, reconstitute_world

ROOT = Path(__file__).parents[1]


def load_handoff():
    bundle = json.loads((ROOT / "fixtures/phaselift/project0-CROSSING-001.json").read_text())
    provenance = json.loads((ROOT / "fixtures/phaselift/project0-CROSSING-001.provenance.json").read_text())
    return parse_project0_handoff(bundle, provenance)


def request(threshold_id):
    return {
        "threshold_id": threshold_id,
        "receiving_constitution_ref": "constitution:" + threshold_id,
        "continuity_requirements": {
            "identity": ["preserved", "transformed"],
            "protocol": ["preserved", "transformed", "reconstituted"],
            "purpose-meaning": ["preserved", "transformed"]
        },
        "missing_evidence_refs": [],
        "fatal_missing_refs": [],
        "protect_refs": ["artifact:odd-small-1"],
        "adopt_source_proposals": ["proposal:inspect-next"],
        "hold": False,
        "refuse_reason": None
    }


def test_same_crossing_has_four_receiver_local_outcomes_without_mutation():
    handoff = load_handoff()
    before = copy.deepcopy(handoff)

    lift = request("B-lift")
    degraded = request("B-degraded")
    degraded["missing_evidence_refs"] = ["receipt:dogram:A1"]
    hold = request("B-hold")
    hold["hold"] = True
    refuse = request("B-refuse")
    refuse["refuse_reason"] = "LOCAL_POLICY_REFUSAL"

    results = [evaluate_reconstitution_threshold(handoff, item) for item in [lift, degraded, hold, refuse]]
    assert [item["disposition"] for item in results] == ["LIFT", "DEGRADED", "HOLD", "REFUSE"]
    assert handoff == before
    assert len({item["source_handoff_digest"] for item in results}) == 1
```

Then add a fork test using the same source handoff and two different local compiles/world IDs. Reuse the `local_compile_spec()` helper by moving it into a small local helper in this test rather than importing from another test module. Required assertions:

```python
assert birth_a["world_id"] != birth_b["world_id"]
assert birth_a["source_handoff_digest"] == birth_b["source_handoff_digest"]
assert birth_a["historical_producer_refs"] == birth_b["historical_producer_refs"]
assert birth_a["resolved_bodies"] != birth_b["resolved_bodies"]
assert "authority:source-repo-write" not in birth_a["local_authorization_refs"]
assert "authority:source-repo-write" not in birth_b["local_authorization_refs"]
```

- [ ] **Step 2: Run the hostile proof**

```bash
pytest -q tests/test_phaselift_crossing_001.py
```

Expected: PASS.

- [ ] **Step 3: Write the bounded eval receipt**

Create `evals/CROSSING-001.md` documenting:

```text
PROVEN:
- same Project0 source fixture reaches four receiver-local dispositions
- source handoff digest is unchanged across all four
- HOLD/REFUSE produce no world-birth receipt
- two LIFT receivers create distinct world IDs
- historical producer refs remain source-pinned
- current resolved bodies may differ
- source authority is not present in local authorization refs
- source proposal is rehydrated under a new local proposal ID
- protected object may be locally held without promotion

NOT PROVEN:
- network transport
- universal remote inbox
- cross-host authentication
- automatic merge
- ALEX/3rdi/Dogram live adapters
- portable PROTECTED status
- universal world-birth receipt
```

Include the exact Project 0 fixture commit and LOADOUT branch head used for the run.

- [ ] **Step 4: Run the entire LOADOUT suite**

```bash
pytest -q
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/test_phaselift_crossing_001.py evals/CROSSING-001.md
git commit -m "test: prove CROSSING-001 reconstitution matrix"
```

---

### Task 6: Add a machine-facing `loadout reconstitute` command and close the proof surface

**Repository:** `the-static-collective/LOADOUT`

**Files:**
- Modify: `src/loadout/cli.py`
- Modify: `tests/test_cli.py`
- Modify: `README.md`

**Interfaces:**
- Consumes four JSON paths: Project 0 fixture, provenance sidecar, local threshold request, local compile spec; plus explicit `--world-id`, `--occurred-at`, and `--resolved-bodies` path.
- Produces one JSON object containing `threshold`; if disposition is `LIFT` or `DEGRADED`, also `compile` and `birth_receipt`. For `HOLD`/`REFUSE`, no birth receipt key is emitted.

- [ ] **Step 1: Write the CLI RED test**

Append to `tests/test_cli.py` a fixture-driven test that writes a request, compile spec, and resolved bodies to `tmp_path`, points the command at the vendored Project 0 fixture/provenance, and calls:

```python
assert main([
    "reconstitute",
    str(project0_fixture),
    str(project0_provenance),
    str(request_file),
    str(compile_file),
    "--world-id", "world:B-cli",
    "--occurred-at", "2026-08-30T06:00:01+00:00",
    "--resolved-bodies", str(resolved_bodies_file),
]) == 0
```

Assert:

```python
output = json.loads(capsys.readouterr().out)
assert output["threshold"]["disposition"] == "LIFT"
assert output["birth_receipt"]["world_id"] == "world:B-cli"
assert output["birth_receipt"]["source_handoff_digest"] == output["threshold"]["source_handoff_digest"]
```

- [ ] **Step 2: Run the focused CLI test to verify RED**

```bash
pytest -q tests/test_cli.py
```

Expected: FAIL because `reconstitute` is not a registered command.

- [ ] **Step 3: Add the CLI command**

Modify imports in `src/loadout/cli.py`:

```python
from loadout.adapters.project0 import parse_project0_handoff
from loadout.reconstitution import evaluate_reconstitution_threshold, reconstitute_world
```

Register:

```python
reconstitute = commands.add_parser("reconstitute", help="Evaluate and locally constitute one PHASELIFT crossing")
reconstitute.add_argument("project0_fixture")
reconstitute.add_argument("project0_provenance")
reconstitute.add_argument("request")
reconstitute.add_argument("compile_spec")
reconstitute.add_argument("--world-id", required=True)
reconstitute.add_argument("--occurred-at", required=True)
reconstitute.add_argument("--resolved-bodies", required=True)
```

Handle it in `main(...)`:

```python
elif args.command == "reconstitute":
    handoff = parse_project0_handoff(_read(args.project0_fixture), _read(args.project0_provenance))
    threshold = evaluate_reconstitution_threshold(handoff, _read(args.request))
    output = {"threshold": threshold}
    if threshold["disposition"] in {"LIFT", "DEGRADED"}:
        output.update(reconstitute_world(
            handoff,
            threshold,
            _read(args.compile_spec),
            world_id=args.world_id,
            occurred_at=args.occurred_at,
            resolved_bodies=_read(args.resolved_bodies),
        ))
    _emit(output)
```

- [ ] **Step 4: Update README machine-facing commands and boundary claim**

Add `loadout reconstitute` to the command list and one short subsection stating:

```text
Project0 crossing testimony may be received and inspected.
LOADOUT alone evaluates the local reconstitution threshold.
Source authority never becomes local authorization by transport.
LIFT/DEGRADED may emit a new world-birth receipt.
HOLD/REFUSE do not constitute a world.
```

Do not claim a network protocol, daemon, or universal PHASELIFT runtime.

- [ ] **Step 5: Run all verification**

LOADOUT:

```bash
pytest -q
loadout --help
```

Project 0 from the Task 1 branch/head:

```bash
npm run verify:all
```

Expected: both suites PASS.

- [ ] **Step 6: Final two-repo evidence check**

Confirm manually from the emitted CLI JSON:

```text
source producer: producer:dogram:A1
current Dogram body: dogram:B1 (or other local body)
source authority ref: authority:source-repo-write
local authorization refs: does not contain source authority ref
source proposal ref: proposal:inspect-next
local proposal id: proposal-local:<digest>
source handoff digest: identical across threshold and world-birth receipt
```

- [ ] **Step 7: Commit**

```bash
git add src/loadout/cli.py tests/test_cli.py README.md
git commit -m "feat: expose PHASELIFT reconstitution command"
```

---

## Self-Review Results

### Spec coverage

- Existing Project 0 crossing/continuity floor reused: Task 1.
- No new universal schema/repository: all tasks.
- HOME as continuity requirements: Task 3.
- Receiver-local PROTECTED: Task 3.
- Four threshold dispositions: Tasks 3 and 5.
- Local reauthorization and no source-authority transfer: Tasks 4 and 5.
- Rebind without retrojection: Task 4.
- World-birth receipt: Task 4.
- Fork with distinct occurrence identity: Task 5.
- Open-edge/local-proposal non-collapse: Tasks 3 and 5.
- Executable process seam: Task 6.
- Network/merge/live-organ integrations remain outside first proof: Task 5 eval non-goals.

### Deliberate deferrals

The approved design includes encounter/merge semantics at the architectural level, but the first implementation does not add a new merge engine because Project 0 already proves `MERGEABILITY != MERGE OBLIGATION`. After `CROSSING-001` lands, the next independent plan should consume two real world-birth receipts and pressure Project 0's existing continuity/fork grammar without inventing automatic reconciliation.

The EAR/listening organ is also intentionally separate. It needs its own design and evidence floor; PHASELIFT does not depend on it.

### Type/name consistency

The plan uses these names consistently across tasks:

```text
phaselift.source-fixture/v0
loadout.project0-handoff/v0
loadout.reconstitution-threshold/v0
loadout.local-proposal/v0
loadout.world-birth/v0
parse_project0_handoff(...)
evaluate_reconstitution_threshold(...)
reconstitute_world(...)
```

No Project 0 production type is renamed or duplicated inside LOADOUT.
