export type ProductBundlePricingStatus =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "REVIEW_HELD"
  | "APPROVED_FOR_OFFERING"
  | "ACTIVE"
  | "RETIRED"
  | "SUPERSEDED";

export type ProductBundleKind =
  | "single_product"
  | "subscription_bundle"
  | "service_bundle"
  | "implementation_bundle"
  | "partner_bundle"
  | "trial_to_paid"
  | "enterprise_offer"
  | "other";

export type ProductBundlePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type PricingCadence =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "annual"
  | "usage_based"
  | "hybrid";

export type PricingCurrency =
  | "USD"
  | "CAD"
  | "EUR"
  | "GBP"
  | "OTHER";

export type ProductBundlePricingAuthorityBoundary = {
  pricingRecordIsNotTransactionTruth: true;
  pricingRecordIsNotPaymentCommitment: true;
  pricingRecordIsNotCheckoutApproval: true;
  pricingRecordIsNotActivationState: true;
  pricingRecordIsNotRevenueRecognition: true;
  offerVisibilityDoesNotCreateEntitlement: true;
  fundTrackerVerificationRequiredForCommitment: true;
};

export type ProductBundleLineItem = {
  lineItemId: string;
  label: string;
  description: string;
  moduleOrProduct: string;
  quantity: number;
  unitPrice: number;
  required: boolean;
  notes?: string[];
};

export type ProductBundleDiscountRule = {
  discountRuleId: string;
  label: string;
  discountType: "percent" | "fixed_amount" | "trial_credit" | "none";
  value: number;
  conditions: string[];
  expiresAt?: string;
  active: boolean;
};

export type ProductBundlePricingRecord = {
  pricingRecordId: string;
  bundleName: string;
  bundleKind: ProductBundleKind;
  status: ProductBundlePricingStatus;
  priority: ProductBundlePriority;
  summary: string;
  currency: PricingCurrency;
  cadence: PricingCadence;
  lineItems: ProductBundleLineItem[];
  discountRules: ProductBundleDiscountRule[];
  relatedModules: string[];
  dependencies: string[];
  constraints: string[];
  futureTrigger?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: ProductBundlePricingAuthorityBoundary;
};

export type ProductBundlePricingValidationResult = {
  validationId: string;
  pricingRecordId: string;
  checkedAt: string;
  valid: boolean;
  subtotal: number;
  discountEstimate: number;
  estimatedTotal: number;
  blockedReasons: string[];
  nextAllowedStatus:
    | "READY_FOR_REVIEW"
    | "REVIEW_HELD"
    | "NO_STATUS_CHANGE";
  authorityBoundary: ProductBundlePricingAuthorityBoundary & {
    validationIsNotOfferApproval: true;
    validationIsNotCheckout: true;
    validationIsNotCommitment: true;
  };
};

export type ProductBundleOfferingGuardResult = {
  offeringGuardId: string;
  pricingRecordId: string;
  checkedAt: string;
  allowed: boolean;
  reason:
    | "APPROVED_PRICING_CAN_SURFACE_AS_OFFER"
    | "DRAFT_PRICING_CANNOT_SURFACE"
    | "REVIEW_HELD_PRICING_CANNOT_SURFACE"
    | "RETIRED_PRICING_CANNOT_SURFACE"
    | "SUPERSEDED_PRICING_CANNOT_SURFACE"
    | "PRICING_NOT_APPROVED_FOR_OFFERING";
  requiredCorrections: string[];
  authorityBoundary: ProductBundlePricingAuthorityBoundary & {
    offeringGuardIsNotCheckout: true;
    offeringGuardIsNotPaymentCommitment: true;
    offeringGuardIsNotActivation: true;
  };
};

export type ProductBundlePricingLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "PRICING_RECORD_REGISTERED"
    | "PRICING_RECORD_VALIDATED"
    | "OFFERING_GUARD_CHECKED";
  pricingRecordId: string;
  status: ProductBundlePricingStatus;
  ledgerPath: string;
  notes: string[];
};
