import {
  ProductBundleDiscountRule,
  ProductBundleLineItem,
  ProductBundlePricingRecord,
  ProductBundlePricingValidationResult
} from "./productBundlePricingContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function lineItemTotal(item: ProductBundleLineItem) {
  return item.quantity * item.unitPrice;
}

function subtotal(lineItems: ProductBundleLineItem[]) {
  return lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

function activeDiscountEstimate(rules: ProductBundleDiscountRule[], baseSubtotal: number) {
  return rules
    .filter((rule) => rule.active)
    .reduce((sum, rule) => {
      if (rule.discountType === "percent") return sum + baseSubtotal * (rule.value / 100);
      if (rule.discountType === "fixed_amount") return sum + rule.value;
      if (rule.discountType === "trial_credit") return sum + rule.value;
      return sum;
    }, 0);
}

export function validateProductBundlePricing(
  record: ProductBundlePricingRecord
): ProductBundlePricingValidationResult {
  const blockedReasons: string[] = [];

  if (!record.bundleName) blockedReasons.push("BUNDLE_NAME_REQUIRED");
  if (!record.summary) blockedReasons.push("BUNDLE_SUMMARY_REQUIRED");
  if (!record.currency) blockedReasons.push("CURRENCY_REQUIRED");
  if (!record.cadence) blockedReasons.push("PRICING_CADENCE_REQUIRED");
  if (record.lineItems.length === 0) blockedReasons.push("LINE_ITEM_REQUIRED");
  if (record.relatedModules.length === 0) blockedReasons.push("RELATED_MODULE_REQUIRED");
  if (record.constraints.length === 0) blockedReasons.push("CONSTRAINTS_REQUIRED");

  for (const item of record.lineItems) {
    if (!item.lineItemId) blockedReasons.push("LINE_ITEM_ID_REQUIRED");
    if (!item.label) blockedReasons.push("LINE_ITEM_LABEL_REQUIRED");
    if (!item.moduleOrProduct) blockedReasons.push("LINE_ITEM_MODULE_OR_PRODUCT_REQUIRED");
    if (item.quantity <= 0) blockedReasons.push("LINE_ITEM_QUANTITY_MUST_BE_POSITIVE");
    if (item.unitPrice < 0) blockedReasons.push("LINE_ITEM_UNIT_PRICE_CANNOT_BE_NEGATIVE");
  }

  for (const rule of record.discountRules) {
    if (!rule.discountRuleId) blockedReasons.push("DISCOUNT_RULE_ID_REQUIRED");
    if (!rule.label) blockedReasons.push("DISCOUNT_RULE_LABEL_REQUIRED");
    if (rule.value < 0) blockedReasons.push("DISCOUNT_VALUE_CANNOT_BE_NEGATIVE");
    if (rule.discountType === "percent" && rule.value > 100) blockedReasons.push("PERCENT_DISCOUNT_CANNOT_EXCEED_100");
  }

  if (record.status === "RETIRED") blockedReasons.push("RETIRED_PRICING_NOT_VALID_FOR_REVIEW");
  if (record.status === "SUPERSEDED") blockedReasons.push("SUPERSEDED_PRICING_NOT_VALID_FOR_REVIEW");

  const baseSubtotal = subtotal(record.lineItems);
  const discountEstimate = Math.min(activeDiscountEstimate(record.discountRules, baseSubtotal), baseSubtotal);
  const estimatedTotal = Math.max(baseSubtotal - discountEstimate, 0);
  const valid = blockedReasons.length === 0;

  return {
    validationId: id("pricing-validation"),
    pricingRecordId: record.pricingRecordId,
    checkedAt: new Date().toISOString(),
    valid,
    subtotal: baseSubtotal,
    discountEstimate,
    estimatedTotal,
    blockedReasons: Array.from(new Set(blockedReasons)),
    nextAllowedStatus: valid ? "READY_FOR_REVIEW" : "REVIEW_HELD",
    authorityBoundary: {
      ...record.authorityBoundary,
      validationIsNotOfferApproval: true,
      validationIsNotCheckout: true,
      validationIsNotCommitment: true
    }
  };
}
