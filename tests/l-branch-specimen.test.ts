import assert from "node:assert/strict";
import test from "node:test";

import { L_BRANCH_SPECIMEN } from "../fixtures/l-branch/specimen";
import { runLBranch } from "../src/l-branch/index";

test("baseline specimen preserves lawful propagation and refusal topology", () => {
  const before = structuredClone(L_BRANCH_SPECIMEN.baseline);
  const result = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.baseline.declaration),
    structuredClone(L_BRANCH_SPECIMEN.baseline.candidates),
  );

  assert.deepEqual(result.terminal.body.finalOutputRefs, ["A", "B"]);
  assert.deepEqual(result.terminal.body.refusedAttemptRefs, ["C"]);
  assert.equal(result.steps.at(-1)?.body.refusalReasonCodes.C, "LBRANCH_AUTHORITY_REQUIRED");
  assert.equal(result.terminal.body.disposition, "damped");
  assert.deepEqual(L_BRANCH_SPECIMEN.baseline, before);
});

test("recognition specimen changes susceptibility without changing authority", () => {
  const control = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.recognition.controlDeclaration),
    structuredClone(L_BRANCH_SPECIMEN.recognition.candidates),
  );
  const recognized = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.recognition.declaration),
    structuredClone(L_BRANCH_SPECIMEN.recognition.candidates),
  );

  assert.deepEqual(control.declaration.body.authorityRefs, recognized.declaration.body.authorityRefs);
  assert.equal(control.terminal.body.finalOutputRefs.includes("B2"), false);
  assert.equal(recognized.terminal.body.finalOutputRefs.includes("B2"), true);
  assert.equal(
    recognized.steps.some((step) => step.body.influenceRefsConsulted.includes("recognition-R")),
    true,
  );
});

test("high-load specimen expands reach without widening sovereignty", () => {
  const low = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.highLoad.lowDeclaration),
    structuredClone(L_BRANCH_SPECIMEN.highLoad.candidates),
  );
  const high = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.highLoad.declaration),
    structuredClone(L_BRANCH_SPECIMEN.highLoad.candidates),
  );

  assert.deepEqual(low.declaration.body.authorityRefs, high.declaration.body.authorityRefs);
  assert.equal(low.terminal.body.finalOutputRefs.includes("D"), false);
  assert.equal(high.terminal.body.finalOutputRefs.includes("D"), true);
  assert.equal(low.terminal.body.disposition, "exhausted");
  assert.equal(high.terminal.body.disposition, "damped");
});

test("specimen replays byte-identically and remains immutable", () => {
  const baselineBefore = structuredClone(L_BRANCH_SPECIMEN.baseline);
  const left = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.baseline.declaration),
    structuredClone(L_BRANCH_SPECIMEN.baseline.candidates),
  );
  const right = runLBranch(
    structuredClone(L_BRANCH_SPECIMEN.baseline.declaration),
    structuredClone(L_BRANCH_SPECIMEN.baseline.candidates),
  );

  assert.equal(left.declaration.ref, right.declaration.ref);
  assert.deepEqual(left.steps.map((step) => step.ref), right.steps.map((step) => step.ref));
  assert.equal(left.terminal.ref, right.terminal.ref);
  assert.deepEqual(left.declaration.canonicalBytes, right.declaration.canonicalBytes);
  assert.deepEqual(left.terminal.canonicalBytes, right.terminal.canonicalBytes);
  assert.deepEqual(L_BRANCH_SPECIMEN.baseline, baselineBefore);
  assert.equal(Object.isFrozen(L_BRANCH_SPECIMEN), true);
  assert.equal(Object.isFrozen(L_BRANCH_SPECIMEN.baseline), true);
  assert.equal(Object.isFrozen(L_BRANCH_SPECIMEN.baseline.declaration), true);
  assert.equal(Object.isFrozen(L_BRANCH_SPECIMEN.baseline.candidates), true);
});
