import assert from "node:assert/strict";
import test from "node:test";

import {
  addressContinuityClaim,
  checkContinuityClosure,
  type ContinuityConformanceResult,
} from "../src/continuity-profile";
import {
  exactOneRootClaim,
  inventedRootClaim,
  multiRootClaim,
  omittedRootClaim,
  pluralRealizationOne,
  pluralRealizationTwo,
} from "../fixtures/continuity-profile/specimens";

function result(
  claim: Parameters<typeof checkContinuityClosure>[0]["claim"],
  requiredMaterialRoots: string[],
  allowedMaterialRoots: string[],
): ContinuityConformanceResult {
  return checkContinuityClosure({ claim, requiredMaterialRoots, allowedMaterialRoots });
}

test("exact one-root continuity conforms against independent context", () => {
  assert.deepEqual(
    result(exactOneRootClaim, ["root:a"], ["root:a"]),
    { status: "conforming", reasonCodes: [] },
  );
});

test("multi-root continuity conforms when every material root closes", () => {
  assert.deepEqual(
    result(multiRootClaim, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
});

test("omitted required material root refuses", () => {
  assert.deepEqual(
    result(omittedRootClaim, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "refused", reasonCodes: ["MISSING_MATERIAL_ROOT"] },
  );
});

test("invented material root refuses", () => {
  assert.deepEqual(
    result(inventedRootClaim, ["root:a"], ["root:a"]),
    { status: "refused", reasonCodes: ["UNDECLARED_ROOT"] },
  );
});

test("reason ordering is deterministic and input arrays are not mutated", () => {
  const required = ["root:b", "root:a"];
  const allowed = ["root:a"];
  const requiredBefore = [...required];
  const allowedBefore = [...allowed];

  assert.deepEqual(
    result(inventedRootClaim, required, allowed),
    {
      status: "refused",
      reasonCodes: ["MISSING_MATERIAL_ROOT", "UNDECLARED_ROOT"],
    },
  );
  assert.deepEqual(required, requiredBefore);
  assert.deepEqual(allowed, allowedBefore);
});

test("plural lawful realizations from the same roots and purpose remain distinct", () => {
  assert.deepEqual(
    result(pluralRealizationOne, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
  assert.deepEqual(
    result(pluralRealizationTwo, ["root:a", "root:b"], ["root:a", "root:b"]),
    { status: "conforming", reasonCodes: [] },
  );
  assert.equal(pluralRealizationOne.purpose, pluralRealizationTwo.purpose);
  assert.deepEqual(pluralRealizationOne.ancestorRoots, pluralRealizationTwo.ancestorRoots);
  assert.notEqual(addressContinuityClaim(pluralRealizationOne), addressContinuityClaim(pluralRealizationTwo));
});
