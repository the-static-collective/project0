import assert from "node:assert/strict";
import test from "node:test";

import {
  addressContinuityClaim,
  checkLaneComposition,
  claimEstablishesLane,
} from "../src/continuity-profile";
import {
  branchA,
  branchARef,
  branchB,
  branchBRef,
  coexistenceCandidate,
  mergeCandidate,
  refusalCandidate,
} from "../fixtures/continuity-profile/forkability";

const parents = [
  { ref: branchARef, claim: branchA },
  { ref: branchBRef, claim: branchB },
];

test("encounter leaves merge coexistence and refusal as separate lawful continuations", () => {
  for (const candidate of [mergeCandidate, coexistenceCandidate, refusalCandidate]) {
    assert.deepEqual(
      checkLaneComposition({
        proposedClaim: candidate,
        lane: "purpose-meaning",
        parents,
      }),
      { status: "conforming", reasonCodes: [] },
    );
  }

  const refs = [mergeCandidate, coexistenceCandidate, refusalCandidate]
    .map(addressContinuityClaim);
  assert.equal(new Set(refs).size, 3);
});

test("a mergeable descendant does not acquire authority or replace either parent", () => {
  assert.equal(claimEstablishesLane(mergeCandidate, "authority"), false);
  assert.deepEqual(
    [...mergeCandidate.parentContinuityRefs].sort(),
    [branchARef, branchBRef].sort(),
  );
  assert.notEqual(addressContinuityClaim(mergeCandidate), branchARef);
  assert.notEqual(addressContinuityClaim(mergeCandidate), branchBRef);
});
