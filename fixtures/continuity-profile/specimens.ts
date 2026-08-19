import type { ContinuityClaimV0 } from "../../src/continuity-profile";

function claim(overrides: Partial<ContinuityClaimV0> = {}): ContinuityClaimV0 {
  return {
    schema: "p0.continuity/0.1",
    purpose: "portable continuity closure specimen",
    subjectRef: "subject:current",
    ancestorRoots: ["root:a"],
    environment: {
      decoderRef: "decoder:v1",
      runtimeRef: "runtime:v1",
      policyRefs: [],
      contextRefs: [],
    },
    lanes: [{
      lane: "text-schema",
      mode: "preserved",
      dimensions: [{
        dimension: "schema",
        evidenceRefs: ["evidence:schema-a"],
      }],
      transformationRefs: [],
      residualRefs: [],
      uncertainty: [],
      doesNotEstablish: ["identity", "authority"],
    }],
    outputRefs: ["output:current"],
    parentContinuityRefs: [],
    occurrenceClaim: "continuation-only",
    ...overrides,
  };
}

export const exactOneRootClaim = claim();

export const multiRootClaim = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:multi"],
});

export const omittedRootClaim = claim({
  ancestorRoots: ["root:a"],
  outputRefs: ["output:omitted"],
});

export const inventedRootClaim = claim({
  ancestorRoots: ["root:a", "root:invented"],
  outputRefs: ["output:invented"],
});

export const pluralRealizationOne = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:realization-one"],
});

export const pluralRealizationTwo = claim({
  ancestorRoots: ["root:a", "root:b"],
  outputRefs: ["output:realization-two"],
});
