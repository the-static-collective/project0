import assert from "node:assert/strict";
import test from "node:test";

import { createNavCrossingReceipt } from "../src/nav-crossing/index";
import {
  lawfulNavigationAfter,
  lawfulNavigationBefore,
  lawfulNavigationCrossing,
  lawfulNavigationSourceEvidence,
} from "../fixtures/nav/lawful-navigation-project0-corpus-os";

test("pins the real cross-repository evidence used to explain and witness the crossing", () => {
  assert.equal(
    lawfulNavigationSourceEvidence.authorityKitCommit,
    "b99dd1bf3e9af4c30a4f0e365237357086b7fdf6",
  );
  assert.equal(
    lawfulNavigationSourceEvidence.corpusOsCommit,
    "f54c808c3c91a599f47189a1e873c8adcaff7143",
  );
  assert.equal(
    lawfulNavigationSourceEvidence.latentReachabilityBlob,
    "e31f97d27a16c15a79ea3062dfdad2214413cc81",
  );
  assert.equal(lawfulNavigationSourceEvidence.authorityKitRegistryVersion, 1);
  assert.equal(lawfulNavigationSourceEvidence.authorityKitRegistryUpdated, "2026-08-09");
});

test("witnesses Project0 to Corpus OS as changed field without manufacturing authority", () => {
  const result = createNavCrossingReceipt(
    lawfulNavigationBefore,
    lawfulNavigationCrossing,
    lawfulNavigationAfter,
  );
  const byDimension = new Map(
    result.receipt.body.observations.map((observation) => [observation.dimension, observation]),
  );

  assert.equal(result.receipt.body.crossingStatus, "materially_changed");
  assert.equal(byDimension.get("frame")?.disposition, "changed");
  assert.equal(byDimension.get("constitution")?.disposition, "changed");
  assert.equal(byDimension.get("authority")?.disposition, "preserved");
  assert.deepEqual(byDimension.get("authority")?.beforeRefs, []);
  assert.deepEqual(byDimension.get("authority")?.afterRefs, []);
  assert.equal(byDimension.get("decoder")?.disposition, "preserved");
  assert.equal(byDimension.get("evidence")?.disposition, "changed");
  assert.equal(byDimension.get("participant")?.disposition, "preserved");
  assert.equal(byDimension.get("particularity:current-project")?.disposition, "changed");
  assert.equal(byDimension.get("particularity:nearby-door")?.disposition, "preserved");
  assert.equal(byDimension.get("particularity:prospective-reachability")?.disposition, "new_after");

  assert.equal(
    byDimension.get("evidence")?.afterRefs.includes(lawfulNavigationSourceEvidence.latentReachabilityRef),
    true,
  );
  assert.equal(
    byDimension.get("evidence")?.beforeRefs.includes(lawfulNavigationSourceEvidence.latentReachabilityRef),
    false,
  );

  for (const evidenceRef of lawfulNavigationCrossing.evidenceRefs) {
    assert.equal(lawfulNavigationBefore.authorityRefs.includes(evidenceRef), false);
    assert.equal(lawfulNavigationAfter.authorityRefs.includes(evidenceRef), false);
  }

  assert.match(result.receipt.ref, /^nav-[0-9a-f]{64}$/);
  assert.equal(result.receipt.ref.startsWith("rect-"), false);
});

test("replays the same lawful navigation declaration deterministically", () => {
  const first = createNavCrossingReceipt(
    lawfulNavigationBefore,
    lawfulNavigationCrossing,
    lawfulNavigationAfter,
  );
  const second = createNavCrossingReceipt(
    lawfulNavigationBefore,
    lawfulNavigationCrossing,
    lawfulNavigationAfter,
  );

  assert.equal(first.before.ref, second.before.ref);
  assert.equal(first.crossing.ref, second.crossing.ref);
  assert.equal(first.after.ref, second.after.ref);
  assert.equal(first.receipt.ref, second.receipt.ref);
  assert.deepEqual(first.receipt.canonicalBytes, second.receipt.canonicalBytes);
});
