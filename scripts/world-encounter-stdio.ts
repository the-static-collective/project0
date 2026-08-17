import {
  EncounterValidationError,
  addressEncounterRecord,
  verifyEncounterRecord,
  type AddressedEncounterRecord,
  type ExchangeEnvelopeV01,
} from "../src/world-encounter/index";

const REQUEST_SCHEMA = "project0/world-encounter-stdio/v0.1";
const RESPONSE_SCHEMA = "project0/world-encounter-stdio-response/v0.1";
const MAX_INPUT_BYTES = 1_048_576;

type Operation = "address" | "verify";

type AdapterResponse =
  | {
      schema: typeof RESPONSE_SCHEMA;
      ok: true;
      operation: Operation;
      record: {
        ref: string;
        digestHex: string;
        recordType: "exchange_envelope";
        body: ExchangeEnvelopeV01;
      };
    }
  | {
      schema: typeof RESPONSE_SCHEMA;
      ok: false;
      error: { code: string };
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(code: string): never {
  const response: AdapterResponse = {
    schema: RESPONSE_SCHEMA,
    ok: false,
    error: { code },
  };
  process.stdout.write(`${JSON.stringify(response)}\n`);
  process.exit(1);
}

function assertExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
): void {
  const allowed = new Set(required);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail("ADAPTER_UNKNOWN_FIELD");
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) fail("ADAPTER_MISSING_FIELD");
  }
}

async function readStdin(): Promise<string> {
  let input = "";
  let inputBytes = 0;
  let tooLarge = false;
  process.stdin.setEncoding("utf8");

  for await (const chunk of process.stdin) {
    inputBytes += Buffer.byteLength(chunk, "utf8");
    if (inputBytes > MAX_INPUT_BYTES) {
      tooLarge = true;
      continue;
    }
    input += chunk;
  }

  if (tooLarge) fail("ADAPTER_INPUT_TOO_LARGE");
  return input;
}

function success(
  operation: Operation,
  addressed: AddressedEncounterRecord<ExchangeEnvelopeV01>,
): void {
  const response: AdapterResponse = {
    schema: RESPONSE_SCHEMA,
    ok: true,
    operation,
    record: {
      ref: addressed.ref,
      digestHex: addressed.digestHex,
      recordType: "exchange_envelope",
      body: addressed.body,
    },
  };
  process.stdout.write(`${JSON.stringify(response)}\n`);
}

async function main(): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readStdin());
  } catch {
    fail("ADAPTER_MALFORMED_JSON");
  }

  if (!isRecord(parsed)) fail("ADAPTER_INVALID_REQUEST");
  if (parsed.schema !== REQUEST_SCHEMA) fail("ADAPTER_UNSUPPORTED_SCHEMA_VERSION");
  if (parsed.operation !== "address" && parsed.operation !== "verify") {
    fail("ADAPTER_UNSUPPORTED_OPERATION");
  }
  if (parsed.recordType !== "exchange_envelope") {
    fail("ADAPTER_UNSUPPORTED_RECORD_TYPE");
  }

  const operation = parsed.operation;
  if (operation === "address") {
    assertExactKeys(parsed, ["schema", "operation", "recordType", "body"]);
    try {
      const addressed = addressEncounterRecord(
        "exchange_envelope",
        parsed.body as ExchangeEnvelopeV01,
      );
      success("address", addressed);
      return;
    } catch (error: unknown) {
      if (error instanceof EncounterValidationError) fail(error.code);
      fail("ADAPTER_INVALID_REQUEST");
    }
  }

  assertExactKeys(parsed, ["schema", "operation", "recordType", "expectedRef", "body"]);
  if (typeof parsed.expectedRef !== "string") fail("ADAPTER_INVALID_REQUEST");
  try {
    const addressed = verifyEncounterRecord(
      "exchange_envelope",
      parsed.expectedRef,
      parsed.body as ExchangeEnvelopeV01,
    );
    success("verify", addressed);
  } catch (error: unknown) {
    if (error instanceof EncounterValidationError) fail(error.code);
    fail("ADAPTER_INVALID_REQUEST");
  }
}

await main();
