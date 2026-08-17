import type { FrameSnapshot } from "../../src/nav-crossing/types";
import type { AddressedEncounterRecord } from "../../src/world-encounter/address";
import type {
  DestinationEncounterContextV01,
  EncounterDispositionV01,
  EncounterEvaluationOptionsV01,
  ExchangeEnvelopeV01,
} from "../../src/world-encounter/types";
import {
  lawfulNavigationAfter,
  lawfulNavigationBefore,
  lawfulNavigationCrossing,
  lawfulNavigationSourceEvidence,
} from "../nav/lawful-navigation-project0-corpus-os";

const offeredSourceRef =
  "github:the-static-collective/project0@0961e44f7fabc5807acea2b267009230f1e846c3:src/nav-crossing/index.ts#blob-28d0b7771b4e06f549f1b51d203b45c461126287";

export const project0EncounterEnvelope: ExchangeEnvelopeV01 = {
  protocolVersion: "p0.exchange/0.1",
  originNodeRef: "project0",
  originFrameRef: lawfulNavigationBefore.frameRef,
  originVersionRef: lawfulNavigationSourceEvidence.project0Commit,
  offered: {
    objectRef: offeredSourceRef,
    mediaType: "text/typescript",
    sourceReceiptRefs: [],
    disclosureClass: "public",
  },
  sourceProvenanceRefs: [
    `github:the-static-collective/project0@${lawfulNavigationSourceEvidence.project0Commit}`,
    offeredSourceRef,
  ],
  sourceAuthorityRefs: [],
  sourceEpistemicKind: "source",
  sourceVerificationState: "verified",
  capabilityUsed: "offer_public_source_ref",
  limitations: [
    "fixture-only",
    "source-ref-is-not-destination-authority",
    "no-network-transport",
  ],
};

export const corpusEncounterContext: DestinationEncounterContextV01 = {
  destinationNodeRef: "corpus-os",
  destinationFrameRef: lawfulNavigationAfter.frameRef,
  manifest: {
    nodeRef: "corpus-os",
    protocolVersion: "p0.exchange/0.1",
    accepts: ["source"],
    emits: [],
    capabilities: ["receive_public_source_ref"],
    requiredScopes: ["public"],
    mustNever: ["accept_source_authority_as_local"],
  },
  grantedScopes: ["public"],
  destinationAuthorityRefs: [],
};

export const encounterRefusedContext: DestinationEncounterContextV01 = {
  ...structuredClone(corpusEncounterContext),
  grantedScopes: [],
};

export const encounterAdmittedOptions: EncounterEvaluationOptionsV01 = {
  requiredCapability: "receive_public_source_ref",
  requiredScope: "public",
  localDetermination: "admit",
  evidenceRefs: [lawfulNavigationSourceEvidence.authorityKitRelationRef],
};

export const encounterIndeterminateOptions: EncounterEvaluationOptionsV01 = {
  ...encounterAdmittedOptions,
  localDetermination: "indeterminate",
  evidenceRefs: ["encounter-local-policy-undetermined"],
};

export const worldEncounterBefore = lawfulNavigationBefore;
export const worldEncounterCrossing = lawfulNavigationCrossing;

export function buildAdmittedEncounterAfter(
  result: AddressedEncounterRecord<EncounterDispositionV01>,
): FrameSnapshot {
  if (result.body.status !== "admitted") {
    throw new Error("ENCOUNTER_FIXTURE_REQUIRES_ADMITTED_DISPOSITION");
  }

  return {
    ...structuredClone(lawfulNavigationAfter),
    authorityRefs: [...lawfulNavigationAfter.authorityRefs],
    evidenceRefs: [
      ...lawfulNavigationAfter.evidenceRefs,
      result.body.envelopeRef,
      result.ref,
    ],
    particularityAnchors: {
      ...lawfulNavigationAfter.particularityAnchors,
      "encounter:offered-source": project0EncounterEnvelope.offered.objectRef,
      "encounter:disposition": result.ref,
    },
  };
}
