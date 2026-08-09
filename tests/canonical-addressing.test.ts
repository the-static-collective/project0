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
  expectedErrorCode?: string;
  malformedTextualAddress?: boolean;
  input_address?: string;
  input?: unknown;
  constructOp?: "depth_chain";
  depth?: number;
  rawInputHex?: string;
  preimageHex?: string;
  digestHex?: string;
  textualAddress?: string;
};

function constructDepthNode(wrapperCount: number): unknown {
  let body: unknown = "leaf";
  for (let i = 0; i < wrapperCount; i++) body = { next: body };
  return {
    kind: "claim",
    body,
    createdAt: "2026-08-01T22:17:39Z",
    createdBy: "u1",
    provenance: [],
    disclosure: "public",
  };
}

for (const filename of readdirSync(fixtureDirectory).filter((name) => name.endsWith(".json"))) {
  const fixture = JSON.parse(readFileSync(join(fixtureDirectory, filename), "utf8")) as Fixture;

  test(`fixture: ${fixture.name}`, () => {
    if (fixture.malformedTextualAddress) {
      assert.throws(() => parseSemanticAddress(fixture.type as Exclude<Fixture["type"], "Artifact">, fixture.input_address!));
      return;
    }

    const input = fixture.constructOp === "depth_chain"
      ? constructDepthNode(fixture.depth!)
      : fixture.input;

    if (fixture.expectedStatus === "rejected") {
      const action = () => computeSemanticAddress(
        fixture.type as Exclude<Fixture["type"], "Artifact">,
        input,
      );
      const canAssertStableCode = fixture.input !== undefined || fixture.constructOp === "depth_chain";
      if (fixture.expectedErrorCode && canAssertStableCode) {
        assert.throws(action, new RegExp(fixture.expectedErrorCode));
      } else {
        assert.throws(action);
      }
      return;
    }

    if (fixture.type === "Artifact") {
      const result = computeArtifactAddress(Buffer.from(fixture.rawInputHex!, "hex"));
      assert.equal(result.digestHex, fixture.digestHex);
      assert.equal(result.textualId, fixture.textualAddress);
      return;
    }

    const result = computeSemanticAddress(fixture.type, input);
    if (fixture.preimageHex !== undefined) assert.equal(result.canonicalBytes.toString("hex"), fixture.preimageHex);
    if (fixture.digestHex !== undefined) assert.equal(result.digestHex, fixture.digestHex);
    if (fixture.textualAddress !== undefined) assert.equal(result.textualId, fixture.textualAddress);
    assert.equal(parseSemanticAddress(fixture.type, result.textualId).toString("hex"), result.digestHex);
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
  ["undefined", { nested: undefined }, "UNDEFINED_VALUE"],
  ["NaN", { value: Number.NaN }, "NON_FINITE_NUMBER"],
  ["infinity", { value: Infinity }, "NON_FINITE_NUMBER"],
  ["sparse array", { values: [1, , 3] }, "SPARSE_ARRAY"],
  ["bigint", { value: BigInt(1) }, "UNSUPPORTED_TYPE"],
  ["function", { value: () => undefined }, "UNSUPPORTED_TYPE"],
  ["symbol", { value: Symbol("x") }, "UNSUPPORTED_TYPE"],
  ["custom prototype", Object.create({ inherited: true }), "CUSTOM_PROTOTYPE"],
  ["unsafe integer positive", { value: 9007199254740992 }, "UNSAFE_INTEGER"],
  ["unsafe integer negative", { value: -9007199254740992 }, "UNSAFE_INTEGER"],
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
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body: cycle }), /CYCLIC_VALUE/);

  const accessor = {} as { value?: string };
  Object.defineProperty(accessor, "value", {
    enumerable: true,
    get() {
      throw new Error("must not execute");
    },
  });
  assert.throws(() => computeSemanticAddress("Node", { ...validNode, body: accessor }), /ACCESSOR_PROPERTY/);
});
