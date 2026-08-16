import assert from "node:assert/strict";
import test from "node:test";

const kernel = require("../src/reference-kernel/index.js") as Record<string, any>;

const permittedAuthority = {
  status: "permitted",
  reasonCodes: [],
  grantRef: "rect-grant",
  remainingInvocations: 1,
};

const validProvenance = { status: "valid", reasonCodes: [] };

function admission(overrides: Record<string, unknown> = {}): any {
  assert.equal(typeof kernel.evaluatePipelineAdmission, "function", "evaluatePipelineAdmission must be exported");
  return kernel.evaluatePipelineAdmission({
    authority: permittedAuthority,
    provenance: validProvenance,
    disclosureAllowed: true,
    ...overrides,
  });
}

test("P0-I11/P0-I20: mechanically complete material admits without epistemic judgment", () => {
  assert.deepEqual(admission(), { status: "admitted", reasonCodes: [] });
});

test("P0-I6/P0-I7: authority refusal mechanically refuses pipeline admission", () => {
  assert.deepEqual(admission({
    authority: {
      status: "refused",
      reasonCodes: ["AUTHORITY_SCOPE_MISMATCH"],
      grantRef: "rect-grant",
    },
  }), {
    status: "refused",
    reasonCodes: ["AUTHORITY_SCOPE_MISMATCH"],
  });
});

test("P0-I2/P0-I20: missing provenance refuses while unresolved provenance stays indeterminate", () => {
  assert.deepEqual(admission({ provenance: { status: "invalid", reasonCodes: ["PROVENANCE_REQUIRED"] } }), {
    status: "refused",
    reasonCodes: ["PROVENANCE_REQUIRED"],
  });
  assert.deepEqual(admission({ provenance: { status: "invalid", reasonCodes: ["PROVENANCE_UNRESOLVED"] } }), {
    status: "indeterminate",
    reasonCodes: ["PROVENANCE_UNRESOLVED"],
  });
});

test("P0-I8/P0-I9/P0-I20: disclosure denial and unknown disclosure remain distinct", () => {
  assert.deepEqual(admission({ disclosureAllowed: false }), {
    status: "refused",
    reasonCodes: ["DISCLOSURE_NOT_PERMITTED"],
  });
  assert.deepEqual(admission({ disclosureAllowed: "indeterminate" }), {
    status: "indeterminate",
    reasonCodes: ["DISCLOSURE_INDETERMINATE"],
  });
});

test("P0-I11: disputed material can be mechanically refused without resolving the dispute", () => {
  assert.equal(typeof kernel.evaluateMaterial, "function", "evaluateMaterial must be exported");
  const result = kernel.evaluateMaterial({
    admissionInput: {
      authority: {
        status: "refused",
        reasonCodes: ["DISCLOSURE_NOT_PERMITTED"],
        grantRef: "rect-grant",
      },
      provenance: validProvenance,
      disclosureAllowed: false,
    },
    epistemicDisposition: "disputed",
  });
  assert.deepEqual(result, {
    admission: { status: "refused", reasonCodes: ["DISCLOSURE_NOT_PERMITTED"] },
    epistemicDisposition: "disputed",
  });
});

test("P0-I11/P0-I20: pipeline-admitted material may remain not_evaluated", () => {
  const result = kernel.evaluateMaterial({
    admissionInput: {
      authority: permittedAuthority,
      provenance: validProvenance,
      disclosureAllowed: true,
    },
    epistemicDisposition: "not_evaluated",
  });
  assert.deepEqual(result, {
    admission: { status: "admitted", reasonCodes: [] },
    epistemicDisposition: "not_evaluated",
  });
});

test("P0-I11: changing only epistemic disposition cannot change admission", () => {
  const dispositions = ["supported", "weak", "disputed", "rejected", "unknown", "not_evaluated"];
  const results = dispositions.map((epistemicDisposition) => kernel.evaluateMaterial({
    admissionInput: {
      authority: permittedAuthority,
      provenance: validProvenance,
      disclosureAllowed: true,
    },
    epistemicDisposition,
  }));
  for (const result of results) {
    assert.deepEqual(result.admission, { status: "admitted", reasonCodes: [] });
  }
  assert.deepEqual(results.map((item: any) => item.epistemicDisposition), dispositions);
});
