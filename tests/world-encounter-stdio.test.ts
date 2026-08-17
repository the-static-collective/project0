import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

import { addressEncounterRecord } from "../src/world-encounter/index";

const REQUEST_SCHEMA = "project0/world-encounter-stdio/v0.1";
const RESPONSE_SCHEMA = "project0/world-encounter-stdio-response/v0.1";

const envelope = {
  protocolVersion: "p0.exchange/0.1" as const,
  originNodeRef: "project0",
  originFrameRef: "frame-project0-main",
  originVersionRef: "95807375f73e075884727693db3711a4246e6a8d",
  offered: {
    objectRef: "boot-the-house-source-witness",
    mediaType: "application/json",
    sourceReceiptRefs: ["receipt-b", "receipt-a", "receipt-a"],
    disclosureClass: "public",
  },
  sourceProvenanceRefs: ["project0-pr-41", "project0-pr-38"],
  sourceAuthorityRefs: ["source-authority-b", "source-authority-a"],
  sourceEpistemicKind: "witness" as const,
  sourceVerificationState: "verified" as const,
  capabilityUsed: "offer_public_witness",
  limitations: ["not-destination-authority", "boot-the-house-v0.1"],
};

async function runAdapter(input: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const child = spawn(process.execPath, [".build/scripts/world-encounter-stdio.js"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  });
  child.stdin.end(input);

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => { stdout += chunk; });
  child.stderr.on("data", (chunk: string) => { stderr += chunk; });

  const code = await new Promise<number | null>((resolve) => child.on("close", resolve));
  return { code, stdout, stderr };
}

function addressRequest(body: unknown = envelope) {
  return {
    schema: REQUEST_SCHEMA,
    operation: "address",
    recordType: "exchange_envelope",
    body,
  };
}

function verifyRequest(expectedRef: string, body: unknown = envelope) {
  return {
    schema: REQUEST_SCHEMA,
    operation: "verify",
    recordType: "exchange_envelope",
    expectedRef,
    body,
  };
}

test("stdio adapter addresses an exchange envelope with canonical Project0 normalization", async () => {
  const result = await runAdapter(`${JSON.stringify(addressRequest())}\n`);
  assert.equal(result.code, 0, result.stderr);
  const response = JSON.parse(result.stdout) as any;
  assert.equal(response.schema, RESPONSE_SCHEMA);
  assert.equal(response.ok, true);
  assert.equal(response.operation, "address");
  assert.match(response.record.ref, /^enc-[0-9a-f]{64}$/);
  assert.equal(response.record.recordType, "exchange_envelope");
  assert.deepEqual(response.record.body.offered.sourceReceiptRefs, ["receipt-a", "receipt-b"]);
  assert.deepEqual(response.record.body.sourceAuthorityRefs, ["source-authority-a", "source-authority-b"]);
  assert.equal("authority" in response, false);
});

test("stdio adapter replay is stable across set-like input order", async () => {
  const reordered = structuredClone(envelope);
  reordered.offered.sourceReceiptRefs = ["receipt-a", "receipt-b"];
  reordered.sourceProvenanceRefs = [...reordered.sourceProvenanceRefs].reverse();
  reordered.sourceAuthorityRefs = [...reordered.sourceAuthorityRefs].reverse();
  reordered.limitations = [...reordered.limitations].reverse();

  const first = await runAdapter(`${JSON.stringify(addressRequest(envelope))}\n`);
  const second = await runAdapter(`${JSON.stringify(addressRequest(reordered))}\n`);
  assert.equal(first.code, 0, first.stderr);
  assert.equal(second.code, 0, second.stderr);
  assert.equal(JSON.parse(first.stdout).record.ref, JSON.parse(second.stdout).record.ref);
});

test("stdio adapter verifies the exact canonical encounter ref", async () => {
  const expected = addressEncounterRecord("exchange_envelope", envelope).ref;
  const result = await runAdapter(`${JSON.stringify(verifyRequest(expected))}\n`);
  assert.equal(result.code, 0, result.stderr);
  const response = JSON.parse(result.stdout) as any;
  assert.equal(response.ok, true);
  assert.equal(response.operation, "verify");
  assert.equal(response.record.ref, expected);
});

test("stdio adapter reports tampered encounter identity as Project0 validation failure", async () => {
  const result = await runAdapter(`${JSON.stringify(verifyRequest(`enc-${"0".repeat(64)}`))}\n`);
  assert.equal(result.code, 1);
  const response = JSON.parse(result.stdout) as any;
  assert.deepEqual(response, {
    schema: RESPONSE_SCHEMA,
    ok: false,
    error: { code: "ENCOUNTER_ADDRESS_MISMATCH" },
  });
});

test("stdio adapter preserves disclosure validation before any destination invocation", async () => {
  const invalid = structuredClone(envelope) as any;
  invalid.offered.disclosureClass = "";
  const result = await runAdapter(`${JSON.stringify(addressRequest(invalid))}\n`);
  assert.equal(result.code, 1);
  const response = JSON.parse(result.stdout) as any;
  assert.equal(response.ok, false);
  assert.equal(response.error.code, "ENCOUNTER_INVALID_STRING");
});

test("stdio adapter preserves Project0 protocol-version rejection", async () => {
  const unsupported = { ...structuredClone(envelope), protocolVersion: "p0.exchange/9.9" };
  const result = await runAdapter(`${JSON.stringify(addressRequest(unsupported))}\n`);
  assert.equal(result.code, 1);
  const response = JSON.parse(result.stdout) as any;
  assert.equal(response.ok, false);
  assert.equal(response.error.code, "ENCOUNTER_PROTOCOL_UNSUPPORTED");
});

test("stdio adapter fails closed on unsupported wrapper schema and unknown wrapper fields", async () => {
  const unsupported = { ...addressRequest(), schema: "project0/world-encounter-stdio/v9" };
  const unsupportedResult = await runAdapter(`${JSON.stringify(unsupported)}\n`);
  assert.equal(unsupportedResult.code, 1);
  assert.equal(JSON.parse(unsupportedResult.stdout).error.code, "ADAPTER_UNSUPPORTED_SCHEMA_VERSION");

  const unknown = { ...addressRequest(), surprise: true };
  const unknownResult = await runAdapter(`${JSON.stringify(unknown)}\n`);
  assert.equal(unknownResult.code, 1);
  assert.equal(JSON.parse(unknownResult.stdout).error.code, "ADAPTER_UNKNOWN_FIELD");
});

test("stdio adapter bounds raw input before retaining an unbounded request body", async () => {
  const oversized = { ...addressRequest(), padding: "x".repeat(1_100_000) };
  const result = await runAdapter(`${JSON.stringify(oversized)}\n`);
  assert.equal(result.code, 1);
  const response = JSON.parse(result.stdout) as any;
  assert.deepEqual(response, {
    schema: RESPONSE_SCHEMA,
    ok: false,
    error: { code: "ADAPTER_INPUT_TOO_LARGE" },
  });
});
