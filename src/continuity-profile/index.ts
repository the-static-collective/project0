export {
  CONTINUITY_LANES,
  CONTINUITY_MODES,
} from "./types";
export {
  ContinuityValidationError,
  validateContinuityClaim,
} from "./validate";
export {
  addressContinuityClaim,
  normalizeContinuityClaim,
  verifyContinuityClaim,
} from "./address";

export type {
  ContinuityClaimV0,
  ContinuityDimension,
  ContinuityEnvironment,
  ContinuityLaneClaim,
  ContinuityLaneKind,
  ContinuityMode,
} from "./types";
