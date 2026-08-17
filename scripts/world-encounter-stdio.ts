import {
  EncounterValidationError,
  addressEncounterRecord,
  evaluateEncounter,
  verifyEncounterRecord,
  type DestinationEncounterContextV01,
  type EncounterDispositionV01,
  type EncounterEvaluationOptionsV01,
  type EncounterRecordType,
  type ExchangeEnvelopeV01,
} from "../src/world-encounter/index";

type AddressRequest = {
  schema: "project0.world-encounter-process/v0.1";
  operation: "address";
  recordType: EncounterRecordType;
  body: ExchangeEnvelopeV01 | EncounterDispositionV01;
};

type VerifyRequest = {
  schema: "project0.world-encounter-process/v0.1";
  operation: "verify";
  recordType: EncounterRecordType;
  expectedRef: string;
  body: ExchangeEnvelopeV01 | EncounterDispositionV01;
};

type EvaluateRequest = {
  schema: "project0.world-encounter-process/v0.1";
  operation: "evaluate";
  envelope: ExchangeEnvelopeV01;
  context: DestinationEncounterContextV01;
  options: EncounterEvaluationOptionsV01;
};

type ProcessRequest = AddressRequest | VerifyRequest | EvaluateRequest;

type JsonRecord = Record<string, unknown>;

function errorResult(code: string, message: string) {
  return {
    schema: "project0.world-encounter-process-result/v0.1" as const,
    status: "error" as const,
    code,
    message,
  };
}

function okResult(addressed: {
  ref: string;
  digestHex: string;
  recordType: EncounterRecordType;
  body: ExchangeEnvelopeV01 | EncounterDispositionV01;
}) {
  return {
    schema: "project0.world-encounter-process-result/v0.1" as const,
    status: "ok" as const,
    addressed: {
      ref: addressed.ref,
      digestHex: addressed.digestHex,
      recordType: addressed.recordType,
      body: addressed.body,
    },
  };
}

function parseRequest(input: string): ProcessRequest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw Object.assign(new Error("stdin must contain one JSON request"), { code: "INVALID_JSON" });
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw Object.assign(new Error("process request must be a JSON object"), { code: "INVALID_PROCESS_REQUEST" });
  }

  const record = parsed as JsonRecord;
  if (record.schema !== "project0.world-encounter-process/v0.1") {
    throw Object.assign(new Error(`unsupported process schema ${String(record.schema)}`), {
      code: "UNSUPPORTED_PROCESS_SCHEMA",
    });
  }
  if (record.operation !== "address" && record.operation !== "verify" && record.operation !== "evaluate") {
    throw Object.assign(new Error(`unsupported process operation ${String(record.operation)}`), {
      code: "UNSUPPORTED_PROCESS_OPERATION",
    });
  }

  return parsed as ProcessRequest;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function execute(request: ProcessRequest) {
  if (request.operation === "address") {
    const addressed = request.recordType === "exchange_envelope"
      ? addressEncounterRecord("exchange_envelope", request.body as ExchangeEnvelopeV01)
      : addressEncounterRecord("encounter_disposition", request.body as EncounterDispositionV01);
    return okResult(addressed);
  }

  if (request.operation === "verify") {
    const addressed = request.recordType === "exchange_envelope"
      ? verifyEncounterRecord("exchange_envelope", request.expectedRef, request.body as ExchangeEnvelopeV01)
      : verifyEncounterRecord("encounter_disposition", request.expectedRef, request.body as EncounterDispositionV01);
    return okResult(addressed);
  }

  return okResult(evaluateEncounter(request.envelope, request.context, request.options));
}

async function main(): Promise<void> {
  const request = parseRequest(await readStdin());
  process.stdout.write(`${JSON.stringify(execute(request))}\n`);
}

main().catch((error: unknown) => {
  const code = error instanceof EncounterValidationError
    ? error.code
    : typeof error === "object" && error !== null && "code" in error && typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "PROCESS_FAILURE";
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(`${JSON.stringify(errorResult(code, message))}\n`);
  process.exitCode = 1;
});
