import assert from "node:assert/strict";
import test from "node:test";

const kernel = require("../src/reference-kernel/index.js") as Record<string, any>;

function run(): any[] {
  assert.equal(typeof kernel.runConformance, "function", "runConformance must be exported");
  return kernel.runConformance();
}

test("P0-I18/P0-I19: conformance report is deterministic and fully structured", () => {
  const first = run();
  const second = run();
  assert.deepEqual(second, first);
  assert.ok(first.length >= 8);
  for (const result of first) {
    assert.equal(typeof result.fixtureId, "string");
    assert.ok(Array.isArray(result.invariantIds));
    assert.ok(result.invariantIds.length > 0);
    assert.ok(["pass", "fail", "unsupported"].includes(result.status));
    assert.ok(Array.isArray(result.reasonCodes));
    assert.ok(Array.isArray(result.evidenceRefs));
  }
});

test("P0-I4/P0-I7/P0-I14: passing fixtures are backed by executable kernel evidence", () => {
  const results = run();
  const required = [
    "stable-node-identity",
    "receipt-round-trip",
    "authority-valid-use",
    "authority-scope-refusal",
    "authority-exhaustion",
    "admission-orthogonality",
  ];
  for (const fixtureId of required) {
    const result = results.find((item) => item.fixtureId === fixtureId);
    assert.ok(result, `missing ${fixtureId}`);
    assert.equal(result.status, "pass", `${fixtureId} must pass`);
    assert.ok(result.evidenceRefs.length > 0, `${fixtureId} must cite evidence`);
  }
  assert.deepEqual(
    results.find((item) => item.fixtureId === "authority-scope-refusal")?.reasonCodes,
    ["AUTHORITY_SCOPE_MISMATCH"],
  );
  assert.deepEqual(
    results.find((item) => item.fixtureId === "authority-exhaustion")?.reasonCodes,
    ["AUTHORITY_EXHAUSTED"],
  );
});

test("P0-I1/P0-I3/P0-I5/P0-I14: plurality, repair scar, and build-beside are executable", () => {
  const results = run();
  const required: Record<string, number> = {
    "sealed-plurality-round-trip": 5,
    "repair-scar-round-trip": 2,
    "monument-build-beside": 3,
  };

  for (const [fixtureId, minimumEvidence] of Object.entries(required)) {
    const result = results.find((item) => item.fixtureId === fixtureId);
    assert.ok(result, `missing ${fixtureId}`);
    assert.equal(result.status, "pass", `${fixtureId} must be executable`);
    assert.deepEqual(result.reasonCodes, []);
    assert.ok(result.evidenceRefs.length >= minimumEvidence, `${fixtureId} must cite canonical evidence`);
    assert.equal(new Set(result.evidenceRefs).size, result.evidenceRefs.length, `${fixtureId} evidence refs must be distinct`);
  }
});

test("P0-I18: rendered report exposes status, invariant, fixture, and reason evidence", () => {
  assert.equal(typeof kernel.renderConformance, "function", "renderConformance must be exported");
  const rendered = kernel.renderConformance(run());
  assert.match(rendered, /PASS\s+P0-I4/);
  assert.match(rendered, /stable-node-identity/);
  assert.match(rendered, /PASS\s+P0-I5,P0-I14\s+repair-scar-round-trip/);
  assert.match(rendered, /PASS\s+P0-I1,P0-I3\s+monument-build-beside/);
  assert.doesNotMatch(rendered, /UNSUPPORTED/);
  assert.match(rendered, /AUTHORITY_SCOPE_MISMATCH/);
});

test("P0-I20: only actual conformance failure makes the CLI fail", () => {
  assert.equal(typeof kernel.conformanceExitCode, "function", "conformanceExitCode must be exported");
  const results = run();
  assert.equal(kernel.conformanceExitCode(results), 0);
  assert.equal(kernel.conformanceExitCode([
    ...results,
    {
      fixtureId: "synthetic-failure",
      invariantIds: ["P0-I18"],
      status: "fail",
      reasonCodes: ["SYNTHETIC_FAILURE"],
      evidenceRefs: [],
    },
  ]), 1);
});
