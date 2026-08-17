import { addressEncounterRecord, type AddressedEncounterRecord } from "./address";
import type {
  DestinationEncounterContextV01,
  EncounterDispositionV01,
  EncounterEvaluationOptionsV01,
  EncounterReasonCode,
  EncounterStatusV01,
  ExchangeEnvelopeV01,
} from "./types";
import {
  EncounterValidationError,
  validateDestinationEncounterContext,
  validateExchangeEnvelope,
} from "./validate";

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function assertEvaluationOptions(value: EncounterEvaluationOptionsV01): void {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new EncounterValidationError("ENCOUNTER_INVALID_REPRESENTATION");
  }
  if (typeof value.requiredCapability !== "string" || value.requiredCapability.length === 0) {
    throw new EncounterValidationError("ENCOUNTER_INVALID_STRING");
  }
  if (typeof value.requiredScope !== "string" || value.requiredScope.length === 0) {
    throw new EncounterValidationError("ENCOUNTER_INVALID_STRING");
  }
  if (
    value.localDetermination !== "admit" &&
    value.localDetermination !== "refuse" &&
    value.localDetermination !== "indeterminate"
  ) {
    throw new EncounterValidationError("ENCOUNTER_INVALID_REPRESENTATION");
  }
  if (!Array.isArray(value.evidenceRefs) || value.evidenceRefs.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new EncounterValidationError("ENCOUNTER_INVALID_STRING_ARRAY");
  }
}

function disposition(
  envelopeRef: string,
  context: DestinationEncounterContextV01,
  status: EncounterStatusV01,
  reasonCode: EncounterReasonCode,
  inspectedObject: boolean,
  evidenceRefs: readonly string[],
): AddressedEncounterRecord<EncounterDispositionV01> {
  return addressEncounterRecord("encounter_disposition", {
    envelopeRef,
    destinationFrameRef: context.destinationFrameRef,
    status,
    reasonCode,
    inspectedObject,
    destinationAuthorityRefs: sortedUnique(context.destinationAuthorityRefs),
    evidenceRefs: sortedUnique(evidenceRefs),
  });
}

export function evaluateEncounter(
  envelopeInput: ExchangeEnvelopeV01,
  contextInput: DestinationEncounterContextV01,
  options: EncounterEvaluationOptionsV01,
): AddressedEncounterRecord<EncounterDispositionV01> {
  validateExchangeEnvelope(envelopeInput);
  validateDestinationEncounterContext(contextInput);
  assertEvaluationOptions(options);

  if (contextInput.manifest.nodeRef !== contextInput.destinationNodeRef) {
    throw new EncounterValidationError("ENCOUNTER_SOURCE_INVALID");
  }

  const sourceAuthority = new Set(envelopeInput.sourceAuthorityRefs);
  if (contextInput.destinationAuthorityRefs.some((ref) => sourceAuthority.has(ref))) {
    throw new EncounterValidationError("ENCOUNTER_SOURCE_AUTHORITY_TRANSFER");
  }

  const envelope = addressEncounterRecord("exchange_envelope", envelopeInput);

  if (!contextInput.manifest.accepts.includes(envelope.body.sourceEpistemicKind)) {
    return disposition(
      envelope.ref,
      contextInput,
      "refused",
      "ENCOUNTER_TYPE_NOT_ACCEPTED",
      false,
      options.evidenceRefs,
    );
  }

  if (!contextInput.manifest.capabilities.includes(options.requiredCapability)) {
    return disposition(
      envelope.ref,
      contextInput,
      "refused",
      "ENCOUNTER_CAPABILITY_UNDECLARED",
      false,
      options.evidenceRefs,
    );
  }

  const scopeRequired = contextInput.manifest.requiredScopes.includes(options.requiredScope)
    || envelope.body.offered.disclosureClass === options.requiredScope;
  if (scopeRequired && !contextInput.grantedScopes.includes(options.requiredScope)) {
    return disposition(
      envelope.ref,
      contextInput,
      "refused",
      "ENCOUNTER_SCOPE_REQUIRED",
      false,
      options.evidenceRefs,
    );
  }

  if (options.localDetermination === "indeterminate") {
    return disposition(
      envelope.ref,
      contextInput,
      "indeterminate",
      "ENCOUNTER_INDETERMINATE",
      false,
      options.evidenceRefs,
    );
  }

  if (options.localDetermination === "refuse") {
    return disposition(
      envelope.ref,
      contextInput,
      "refused",
      "ENCOUNTER_DISCLOSURE_REFUSED",
      false,
      options.evidenceRefs,
    );
  }

  return disposition(
    envelope.ref,
    contextInput,
    "admitted",
    "ENCOUNTER_ADMITTED",
    true,
    options.evidenceRefs,
  );
}
