import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("project status declares the bounded room neighborhood without authority transfer", async () => {
  const input = await readFile(new URL("../PROJECT_STATUS.json", import.meta.url), "utf8");
  const status = JSON.parse(input) as Record<string, unknown>;

  assert.deepEqual(status.dependsOn, [
    {
      repository: "the-static-collective/tranchnode",
      relation: "fixture-pinned-continuity-donor",
      evidence: "fixtures/continuity-profile/triangle-donors.ts",
    },
    {
      repository: "the-static-collective/corpus-os",
      relation: "fixture-pinned-continuity-donor",
      evidence: "fixtures/continuity-profile/triangle-donors.ts",
    },
  ]);

  assert.equal(Object.hasOwn(status, "humanHeld"), false);
  assert.deepEqual(status.touchpoints, [
    {
      id: "project-status",
      kind: "read",
      access: "safe-read",
      interface: "PROJECT_STATUS.json",
    },
    {
      id: "continuity-profile",
      kind: "read",
      access: "safe-read",
      interface: "src/continuity-profile/index.ts",
    },
    {
      id: "world-encounter-stdio",
      kind: "executable",
      access: "safe-read-execute",
      interface: "npm run world-encounter:stdio",
    },
  ]);

  assert.deepEqual(status.reentry, {
    readme: "README.md",
    status: "PROJECT_STATUS.json",
    docs: "docs/",
  });
});
