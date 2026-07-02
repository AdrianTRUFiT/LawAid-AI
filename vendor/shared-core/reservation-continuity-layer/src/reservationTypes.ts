export type ReservationState =
  | "QUOTE_ONLY"
  | "RESERVED"
  | "LOCKED"
  | "RELEASE_REQUESTED"
  | "MUTUALLY_RELEASED"
  | "REFUSED_RELEASE"
  | "EXPIRED"
  | "CLOSED";

export type MarketWindowType =
  | "prebook_bonus"
  | "standard_window"
  | "scarcity_window"
  | "last_minute_window";

export type PricingAdjustmentType =
  | "PREBOOK_BONUS"
  | "STANDARD_PRICE"
  | "SCARCITY_PREMIUM"
  | "LAST_MINUTE_PREMIUM"
  | "RELIABILITY_PREMIUM"
  | "RISK_ABSORPTION_PREMIUM";

export type ReleaseDecision =
  | "APPROVED_MUTUAL_RELEASE"
  | "REFUSED_ONE_SIDED_RELEASE"
  | "REFUSED_LOCKED_COMMITMENT"
  | "RELEASE_NOT_REQUIRED";

export interface ReservationWindow {
  windowId: string;
  marketWindowType: MarketWindowType;
  startsAt: string;
  endsAt: string;
  scarcityLevel: number;
  demandLevel: number;
  routeReliabilityScore: number;
  pricingAdjustments: PricingAdjustmentType[];
}

export interface PriceWindowSnapshot {
  snapshotId: string;
  baseAmount: number;
  finalAmount: number;
  currency: string;
  marketWindowType: MarketWindowType;
  prebookDiscountApplied: boolean;
  scarcityPremiumApplied: boolean;
  lastMinutePremiumApplied: boolean;
  reliabilityPremiumApplied: boolean;
  rationale: string[];
  createdAt: string;
}

export interface ReservationQuote {
  quoteId: string;
  routeId: string;
  flowUnitId: string;
  originNodeId: string;
  destinationNodeId: string;
  offeredAt: string;
  expiresAt: string;
  priceSnapshot: PriceWindowSnapshot;
  quoteStatus: "open" | "expired" | "converted";
}

export interface ReservationCommitment {
  reservationId: string;
  quoteId: string;
  routeId: string;
  flowUnitId: string;
  ownerId: string;
  providerId: string;
  committedAt: string;
  lockedAt?: string;
  priceSnapshot: PriceWindowSnapshot;
  reservationState: ReservationState;
  irreversibleByDefault: boolean;
  mutualReleaseOnly: boolean;
}

export interface ReleaseRequest {
  requestId: string;
  reservationId: string;
  requestedBy: string;
  reason: string;
  counterpartApproved: boolean;
  createdAt: string;
}

export interface MutualReleaseDecisionRecord {
  decisionId: string;
  reservationId: string;
  releaseDecision: ReleaseDecision;
  reason: string;
  decidedAt: string;
}

export interface ContinuityProtectionRecord {
  recordId: string;
  reservationId: string;
  protectedPriceAmount: number;
  currency: string;
  routeId: string;
  lockState: "protected" | "released";
  downstreamMarketChangeIgnored: boolean;
  createdAt: string;
}

export interface ReservationLayerResult {
  reservationCommitment: ReservationCommitment | null;
  continuityProtection: ContinuityProtectionRecord | null;
  releaseDecision: MutualReleaseDecisionRecord | null;
  trusted: boolean;
  reason: string;
}