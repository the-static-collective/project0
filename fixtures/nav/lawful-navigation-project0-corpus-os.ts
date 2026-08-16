import type {
  CrossingDeclaration,
  FrameSnapshot,
} from "../../src/nav-crossing/types";

const thresholdLawRef =
  "gitbook:HILTtUulCBDqDzXXk6RQ:patterns/field-traversal-and-illumination#threshold-probing-is-not-traversal";

const authorityKitRelationRef =
  "github:the-static-collective/jubilee-authority-kit@b99dd1bf3e9af4c30a4f0e365237357086b7fdf6:registry/projects.json#corpus-os-CONFORMS_TO-project0";

const project0Ref =
  "github:the-static-collective/project0@0961e44f7fabc5807acea2b267009230f1e846c3";

const corpusOsRef =
  "github:the-static-collective/corpus-os@f54c808c3c91a599f47189a1e873c8adcaff7143";

const latentReachabilityRef =
  "github:the-static-collective/corpus-os@f54c808c3c91a599f47189a1e873c8adcaff7143:runtime/latent-reachability.ts#blob-e31f97d27a16c15a79ea3062dfdad2214413cc81";

export const lawfulNavigationSourceEvidence = Object.freeze({
  thresholdLawRef,
  authorityKitRelationRef,
  authorityKitCommit: "b99dd1bf3e9af4c30a4f0e365237357086b7fdf6",
  authorityKitRegistryVersion: 1,
  authorityKitRegistryUpdated: "2026-08-09",
  project0Commit: "0961e44f7fabc5807acea2b267009230f1e846c3",
  corpusOsCommit: "f54c808c3c91a599f47189a1e873c8adcaff7143",
  latentReachabilityBlob: "e31f97d27a16c15a79ea3062dfdad2214413cc81",
  latentReachabilityRef,
});

export const lawfulNavigationBefore: FrameSnapshot = {
  frameRef: `field:project0@${lawfulNavigationSourceEvidence.project0Commit}`,
  constitutionRef: null,
  authorityRefs: [],
  decoderRef: "decoder:read-only-cross-repo-specimen-v0.1",
  evidenceRefs: [thresholdLawRef, authorityKitRelationRef],
  participantRef: "participant:lawful-navigation-specimen-v0.1",
  particularityAnchors: {
    "current-project": project0Ref,
    "nearby-door": corpusOsRef,
  },
};

export const lawfulNavigationCrossing: CrossingDeclaration = {
  crossingRef: "crossing:project0-to-corpus-os:2026-08-16",
  kind: "room_crossing",
  declaredPurpose: "inspect one evidenced neighboring embodiment without expanding authority",
  evidenceRefs: [thresholdLawRef, authorityKitRelationRef],
};

export const lawfulNavigationAfter: FrameSnapshot = {
  frameRef: `field:corpus-os@${lawfulNavigationSourceEvidence.corpusOsCommit}`,
  constitutionRef: null,
  authorityRefs: [],
  decoderRef: "decoder:read-only-cross-repo-specimen-v0.1",
  evidenceRefs: [thresholdLawRef, authorityKitRelationRef, latentReachabilityRef],
  participantRef: "participant:lawful-navigation-specimen-v0.1",
  particularityAnchors: {
    "current-project": corpusOsRef,
    "nearby-door": corpusOsRef,
    "prospective-reachability": latentReachabilityRef,
  },
};
