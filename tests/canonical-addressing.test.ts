import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  computeArtifactAddress,
  computeSemanticAddress,
  parseSemanticAddress,
} from "../src/canonical-addressing/index";

const fixtureDirectory = join(process.cwd(), "fixtures", "canonical-addressing");

type Fixture = {
  name: string;
  type: "Node" | "Edge" | "Receipt" | "Request" | "Artifact";
  expectedStatus: "accepted" | "rejected";
  malformedTextualAddress?: boolean;
  input_address?: string;
  input?: unknown;
  rawInputHex?: string;
  preimageHex?: string;
  digestHex?: string;
  textualAddress?: string;
};

for (const filename of readdirSync(fixtureDirectory).filter((name) => name.endsWith(".json"))) {
  const fixture = JSON.parse(readFileSync(join(fixtureDirectory, filename), "utf8")) as Fixture;

  test(`fixture: ${fixture.name}`, () => {
    if (fixture.malformedTextualAddress) {
      assert.throws(() => parseSemanticAddress(fixture.type as Exclude<Fixture["type"], "Artifact">, fixture.input_address!));
      return;
    }

    if (fixture.expectedStatus === "rejected") {
      // JSON fixtures can only exercise transport-representable rejection cases.
      assert.throws(() => computeSemanticAddress(fixture.type as Exclude<Fixture["type"], "Artifact">, fixture.input));
      return;
    }

    if (fixture.type === "Artifact") {
      const result = computeArtifactAddress(Buffer.from(fixture.rawInputHex!, "hex"));
      assert.equal(result.digestHex, fixture.digestHex);
      assert.equal(result.textualId, fixture.textualAddress);
      return;
    }

    const result = computeSemanticAddress(fixture.type, fixture.input);
    assert.equal(result.canonicalBytes.toString("hex"), fixture.preimageHex);
    assert.equal(result.digestHex, fixture.digestHex);
    assert.equal(result.textualId, fixture.textualAddress);
    assert.equal(parseSemanticAddress(fixture.type, result.textualId).toString("hex"), fixture.digestHex);
  });
}

const validNode = {
  kind: "claim",
  body: { value: "hello" },
  createdAt: "2026-08-03T00:00:00.000Z",
  createdBy: "tester",
  provenance: [],
  disclosure: "public",
};

for (const [name, body, message] of [
  ["undefined", { nested: undefined }, "undefined"],
  ["NaN", { value: Number.NaN }, "NaN"],
  ["infinity", { value: Infinity }, "Infinity"],
  ["sparse array", { values: [1, , 3] }, "Sparse arrays"],
  ["bigint", { value: BigInt(1) }, "bigint"],
  ["function", { value: () => undefined }, "function"],
  ["symbol", { value: Symbol("x") }, "symbol"],
  ["custom prototype", Object.create({ inherited: true }), "plain objects"],
] as const) {
  test(`rejects runtime-only ${name}`, () => {
    assert.throws(
      () => computeSemanticAddress("Node", { ...validNode, body }),
      new RegExp(message),
    );
  });
}

test("rejects cycles and accessor properties without evaluating them", () => {
  const cycle: { self?: unknown } = {};
  cycle.self = cycle;
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body: cycle }), /Cyclic/);

  let executed = false;
  const accessor = {} as { value?: string };
  Object.defineProperty(accessor, "value", {
    enumerable: true,
    get() {
      executed = true;
      throw new Error("must not execute");
    },
  });
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body: accessor }), /Accessor properties are not allowed/);
  assert.equal(executed, false, "Getter was executed");
});

test("Own data properties are distinguished from inherited and prototype properties", () => {
  const proto = { inherited: true };
  const body = Object.create(proto);
  body.own = true;
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body }), /Only plain objects are allowed/);
});

test("Deeply nested objects are handled predictably", () => {
  let deep: any = "val";
  for (let i = 0; i < 150; i++) {
    deep = { a: deep };
  }
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body: deep }), /Maximum depth exceeded/);
});

test("Oversized objects and arrays expose any currently unbounded behavior", () => {
  const largeArray = new Array(1000).fill(1);
  computeSemanticAddress("Node", { ...validNode, body: largeArray });
});

test("Unsafe integers", () => {
  const body = { unsafe: Number.MAX_SAFE_INTEGER + 10 };
  computeSemanticAddress("Node", { ...validNode, body });
});

test("Domain-separated preimages", () => {
  const body = {
    kind: "claim",
    type: "supersedes",
    from: "node-...",
    to: "node-...",
    createdAt: "2026-08-03T00:00:00.000Z",
    createdBy: "tester",
    assertedBy: "tester",
    scopeId: "scope-1",
    basis: null,
    disclosure: "public",
    provenance: [],
    body: { value: 1 },
  };
  const nodeAddr = computeSemanticAddress("Node", body);
  const edgeAddr = computeSemanticAddress("Edge", body);
  assert.notEqual(nodeAddr.canonicalBytes.toString("hex"), edgeAddr.canonicalBytes.toString("hex"));
  assert.notEqual(nodeAddr.digestHex, edgeAddr.digestHex);
});

test("Invalid timestamp timezone, precision, type, and impossible calendar values are rejected.", () => {
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, createdAt: 12345 }), /Timestamp must be a string/);
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, createdAt: "2026-08-03" }), /Invalid timestamp format/);
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, createdAt: "2026-08-03T00:00:00.000+05:00" }), /Invalid timestamp format/);
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, createdAt: "invalid" }), /Invalid timestamp format/);
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, createdAt: "2026-02-30T00:00:00.000Z" }), /Invalid timestamp value/);
});
