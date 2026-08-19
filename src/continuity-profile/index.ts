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
export {
  checkContinuityClosure,
  checkLaneComposition,
  claimEstablishesLane,
} from "./conformance";
export {
  deriveStillAlive,
  deriveWhyCurrent,
} from "./inspect";

export type {
  ContinuityClaimV0,
  ContinuityDimension,
  ContinuityEnvironment,
  ContinuityLaneClaim,
  ContinuityLaneKind,
  ContinuityMode,
  StillAliveProjection,
  WhyCurrentProjection,
} from "./types";
export type {
  ContinuityConformanceReason,
  ContinuityConformanceResult,
} from "./conformance";
