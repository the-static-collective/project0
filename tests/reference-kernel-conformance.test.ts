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

test("P0-I20: unfinished fixture families remain explicitly unsupported", () => {
  const results = run();
  for (const fixtureId of [
    "sealed-plurality-round-trip",
    "repair-scar-round-trip",
    "monument-build-beside",
  ]) {
    const result = results.find((item) => item.fixtureId === fixtureId);
    assert.ok(result, `missing ${fixtureId}`);
    assert.equal(result.status, "unsupported");
    assert.deepEqual(result.reasonCodes, ["UNSUPPORTED_CHECK"]);
  }
});

test("P0-I18: rendered report exposes status, invariant, fixture, and reason evidence", () => {
  assert.equal(typeof kernel.renderConformance, "function", "renderConformance must be exported");
  const rendered = kernel.renderConformance(run());
  assert.match(rendered, /PASS\s+P0-I4/);
  assert.match(rendered, /stable-node-identity/);
  assert.match(rendered, /UNSUPPORTED\s+P0-I5/);
  assert.match(rendered, /repair-scar-round-trip/);
  assert.match(rendered, /AUTHORITY_SCOPE_MISMATCH/);
});

test("P0-I20: unsupported is visible but only actual conformance failure makes the CLI fail", () => {
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
