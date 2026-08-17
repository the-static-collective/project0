import { canonicalizeDomainValue } from "../canonical-addressing/index";
import type {
  EncounterDispositionV01,
  EncounterRecordType,
  ExchangeEnvelopeV01,
} from "./types";
import {
  EncounterValidationError,
  validateEncounterDisposition,
  validateExchangeEnvelope,
} from "./validate";

export const WORLD_ENCOUNTER_DOMAIN_PREFIX = "Project0-WorldEncounter-v0.1|";

export type AddressedEncounterRecord<T> = {
  ref: string;
  digestHex: string;
  canonicalBytes: Buffer;
  recordType: EncounterRecordType;
  body: T;
};

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeEnvelope(value: ExchangeEnvelopeV01): ExchangeEnvelopeV01 {
  return {
    protocolVersion: value.protocolVersion,
    originNodeRef: value.originNodeRef,
    originFrameRef: value.originFrameRef,
    originVersionRef: value.originVersionRef,
    offered: {
      objectRef: value.offered.objectRef,
      mediaType: value.offered.mediaType,
      sourceReceiptRefs: sortedUnique(value.offered.sourceReceiptRefs),
      disclosureClass: value.offered.disclosureClass,
    },
    sourceProvenanceRefs: sortedUnique(value.sourceProvenanceRefs),
    sourceAuthorityRefs: sortedUnique(value.sourceAuthorityRefs),
    sourceEpistemicKind: value.sourceEpistemicKind,
    sourceVerificationState: value.sourceVerificationState,
    capabilityUsed: value.capabilityUsed,
    limitations: sortedUnique(value.limitations),
  };
}

function normalizeDisposition(value: EncounterDispositionV01): EncounterDispositionV01 {
  return {
    envelopeRef: value.envelopeRef,
    destinationFrameRef: value.destinationFrameRef,
    status: value.status,
    reasonCode: value.reasonCode,
    inspectedObject: value.inspectedObject,
    destinationAuthorityRefs: sortedUnique(value.destinationAuthorityRefs),
    evidenceRefs: sortedUnique(value.evidenceRefs),
  };
}

export function addressEncounterRecord(
  recordType: "exchange_envelope",
  body: ExchangeEnvelopeV01,
): AddressedEncounterRecord<ExchangeEnvelopeV01>;
export function addressEncounterRecord(
  recordType: "encounter_disposition",
  body: EncounterDispositionV01,
): AddressedEncounterRecord<EncounterDispositionV01>;
export function addressEncounterRecord(
  recordType: EncounterRecordType,
  body: ExchangeEnvelopeV01 | EncounterDispositionV01,
): AddressedEncounterRecord<ExchangeEnvelopeV01 | EncounterDispositionV01> {
  let normalized: ExchangeEnvelopeV01 | EncounterDispositionV01;
  if (recordType === "exchange_envelope") {
    validateExchangeEnvelope(body);
    normalized = normalizeEnvelope(body);
  } else if (recordType === "encounter_disposition") {
    validateEncounterDisposition(body);
    normalized = normalizeDisposition(body);
  } else {
    throw new EncounterValidationError("ENCOUNTER_INVALID_RECORD_TYPE");
  }

  const addressed = canonicalizeDomainValue(WORLD_ENCOUNTER_DOMAIN_PREFIX, {
    recordType,
    body: normalized,
  });

  return {
    ref: `enc-${addressed.digestHex}`,
    digestHex: addressed.digestHex,
    canonicalBytes: addressed.canonicalBytes,
    recordType,
    body: normalized,
  };
}
