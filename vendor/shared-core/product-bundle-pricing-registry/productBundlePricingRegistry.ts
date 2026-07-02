import {
  ProductBundleDiscountRule,
  ProductBundleKind,
  ProductBundleLineItem,
  ProductBundlePricingAuthorityBoundary,
  ProductBundlePricingRecord,
  ProductBundlePricingStatus,
  ProductBundlePriority,
  PricingCadence,
  PricingCurrency
} from "./productBundlePricingContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultProductBundlePricingBoundary(): ProductBundlePricingAuthorityBoundary {
  return {
    pricingRecordIsNotTransactionTruth: true,
    pricingRecordIsNotPaymentCommitment: true,
    pricingRecordIsNotCheckoutApproval: true,
    pricingRecordIsNotActivationState: true,
    pricingRecordIsNotRevenueRecognition: true,
    offerVisibilityDoesNotCreateEntitlement: true,
    fundTrackerVerificationRequiredForCommitment: true
  };
}

export function createProductBundlePricingRecord(input: {
  bundleName: string;
  bundleKind: ProductBundleKind;
  status?: ProductBundlePricingStatus;
  priority?: ProductBundlePriority;
  summary: string;
  currency: PricingCurrency;
  cadence: PricingCadence;
  lineItems?: ProductBundleLineItem[];
  discountRules?: ProductBundleDiscountRule[];
  relatedModules?: string[];
  dependencies?: string[];
  constraints?: string[];
  futureTrigger?: string;
}): ProductBundlePricingRecord {
  const now = new Date().toISOString();

  return {
    pricingRecordId: id("product-bundle-pricing"),
    bundleName: input.bundleName.trim(),
    bundleKind: input.bundleKind,
    status: input.status || "DRAFT",
    priority: input.priority || "MEDIUM",
    summary: input.summary.trim(),
    currency: input.currency,
    cadence: input.cadence,
    lineItems: input.lineItems || [],
    discountRules: input.discountRules || [],
    relatedModules: input.relatedModules || [],
    dependencies: input.dependencies || [],
    constraints: input.constraints || [],
    futureTrigger: input.futureTrigger,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultProductBundlePricingBoundary()
  };
}

export function updateProductBundlePricingStatus(
  record: ProductBundlePricingRecord,
  status: ProductBundlePricingStatus
): ProductBundlePricingRecord {
  return {
    ...record,
    status,
    updatedAt: new Date().toISOString()
  };
}
