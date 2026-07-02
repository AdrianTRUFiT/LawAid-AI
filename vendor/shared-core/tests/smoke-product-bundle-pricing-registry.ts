import fs from "fs";
import {
  checkProductBundleOfferingGuard,
  createProductBundlePricingRecord,
  getProductBundlePricingLedgerPath,
  recordProductBundleOfferingGuard,
  recordProductBundlePricingRegistered,
  recordProductBundlePricingValidated,
  updateProductBundlePricingStatus,
  validateProductBundlePricing
} from "../product-bundle-pricing-registry";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const pricingRecord = createProductBundlePricingRecord({
  bundleName: "LawAidAI Launch Candidate Bundle",
  bundleKind: "trial_to_paid",
  status: "DRAFT",
  priority: "HIGH",
  summary: "Commercial pricing option for LawAidAI local launch candidate conversion path.",
  currency: "USD",
  cadence: "monthly",
  lineItems: [
    {
      lineItemId: "lawaidai-core-access",
      label: "LawAidAI Core Access",
      description: "Client-side management workspace access.",
      moduleOrProduct: "LawAidAI",
      quantity: 1,
      unitPrice: 97,
      required: true
    },
    {
      lineItemId: "export-readiness",
      label: "Export Readiness",
      description: "Governed export readiness and output confirmation capability.",
      moduleOrProduct: "LawAidAI Export Readiness",
      quantity: 1,
      unitPrice: 49,
      required: true
    }
  ],
  discountRules: [
    {
      discountRuleId: "launch-trial-credit",
      label: "Launch Trial Credit",
      discountType: "trial_credit",
      value: 49,
      conditions: ["First paid month after trial"],
      active: true
    }
  ],
  relatedModules: ["LawAidAI", "FundTrackerAI", "FinTechionAI"],
  dependencies: ["FundTrackerAI commitment verification"],
  constraints: [
    "Pricing visibility does not create entitlement.",
    "Checkout does not create activation without FundTrackerAI verification.",
    "Revenue is not recognized from pricing record alone."
  ]
});

recordProductBundlePricingRegistered(pricingRecord);

assert(pricingRecord.authorityBoundary.pricingRecordIsNotTransactionTruth === true, "Pricing record is not transaction truth");
assert(pricingRecord.authorityBoundary.pricingRecordIsNotPaymentCommitment === true, "Pricing record is not payment commitment");
assert(pricingRecord.authorityBoundary.pricingRecordIsNotCheckoutApproval === true, "Pricing record is not checkout approval");
assert(pricingRecord.authorityBoundary.pricingRecordIsNotActivationState === true, "Pricing record is not activation state");
assert(pricingRecord.authorityBoundary.pricingRecordIsNotRevenueRecognition === true, "Pricing record is not revenue recognition");
assert(pricingRecord.authorityBoundary.offerVisibilityDoesNotCreateEntitlement === true, "Offer visibility does not create entitlement");
assert(pricingRecord.authorityBoundary.fundTrackerVerificationRequiredForCommitment === true, "FundTrackerAI verification required for commitment");

const validation = validateProductBundlePricing(pricingRecord);
recordProductBundlePricingValidated(pricingRecord, validation);

assert(validation.valid === true, "Valid pricing record passes validation");
assert(validation.subtotal === 146, "Pricing subtotal is correct");
assert(validation.discountEstimate === 49, "Pricing discount estimate is correct");
assert(validation.estimatedTotal === 97, "Pricing estimated total is correct");
assert(validation.nextAllowedStatus === "READY_FOR_REVIEW", "Valid pricing can become review-ready");
assert(validation.authorityBoundary.validationIsNotOfferApproval === true, "Pricing validation is not offer approval");
assert(validation.authorityBoundary.validationIsNotCheckout === true, "Pricing validation is not checkout");
assert(validation.authorityBoundary.validationIsNotCommitment === true, "Pricing validation is not commitment");

const draftOffer = checkProductBundleOfferingGuard(pricingRecord);
recordProductBundleOfferingGuard(pricingRecord, draftOffer);

assert(draftOffer.allowed === false, "Draft pricing cannot surface as offer");
assert(draftOffer.reason === "DRAFT_PRICING_CANNOT_SURFACE", "Draft pricing refusal reason is correct");

const approvedPricing = updateProductBundlePricingStatus(pricingRecord, "APPROVED_FOR_OFFERING");
const approvedOffer = checkProductBundleOfferingGuard(approvedPricing);
recordProductBundleOfferingGuard(approvedPricing, approvedOffer);

assert(approvedOffer.allowed === true, "Approved pricing can surface as offer");
assert(approvedOffer.reason === "APPROVED_PRICING_CAN_SURFACE_AS_OFFER", "Approved offering reason is correct");
assert(approvedOffer.authorityBoundary.offeringGuardIsNotCheckout === true, "Offering guard is not checkout");
assert(approvedOffer.authorityBoundary.offeringGuardIsNotPaymentCommitment === true, "Offering guard is not payment commitment");
assert(approvedOffer.authorityBoundary.offeringGuardIsNotActivation === true, "Offering guard is not activation");

const supersededPricing = updateProductBundlePricingStatus(pricingRecord, "SUPERSEDED");
const supersededOffer = checkProductBundleOfferingGuard(supersededPricing);
recordProductBundleOfferingGuard(supersededPricing, supersededOffer);

assert(supersededOffer.allowed === false, "Superseded pricing cannot surface");
assert(supersededOffer.reason === "SUPERSEDED_PRICING_CANNOT_SURFACE", "Superseded pricing refusal reason is correct");

const invalidPricing = createProductBundlePricingRecord({
  bundleName: "",
  bundleKind: "other",
  status: "DRAFT",
  priority: "LOW",
  summary: "",
  currency: "USD",
  cadence: "monthly",
  lineItems: [
    {
      lineItemId: "",
      label: "",
      description: "Invalid line item",
      moduleOrProduct: "",
      quantity: 0,
      unitPrice: -1,
      required: true
    }
  ],
  discountRules: [
    {
      discountRuleId: "",
      label: "",
      discountType: "percent",
      value: 150,
      conditions: [],
      active: true
    }
  ],
  relatedModules: [],
  dependencies: [],
  constraints: []
});

const invalidValidation = validateProductBundlePricing(invalidPricing);
recordProductBundlePricingValidated(invalidPricing, invalidValidation);

assert(invalidValidation.valid === false, "Invalid pricing record fails validation");
assert(invalidValidation.blockedReasons.includes("BUNDLE_NAME_REQUIRED"), "Invalid pricing requires bundle name");
assert(invalidValidation.blockedReasons.includes("BUNDLE_SUMMARY_REQUIRED"), "Invalid pricing requires summary");
assert(invalidValidation.blockedReasons.includes("RELATED_MODULE_REQUIRED"), "Invalid pricing requires related module");
assert(invalidValidation.blockedReasons.includes("CONSTRAINTS_REQUIRED"), "Invalid pricing requires constraints");
assert(invalidValidation.blockedReasons.includes("LINE_ITEM_ID_REQUIRED"), "Invalid pricing requires line item id");
assert(invalidValidation.blockedReasons.includes("LINE_ITEM_LABEL_REQUIRED"), "Invalid pricing requires line item label");
assert(invalidValidation.blockedReasons.includes("LINE_ITEM_MODULE_OR_PRODUCT_REQUIRED"), "Invalid pricing requires module or product");
assert(invalidValidation.blockedReasons.includes("LINE_ITEM_QUANTITY_MUST_BE_POSITIVE"), "Invalid pricing requires positive quantity");
assert(invalidValidation.blockedReasons.includes("LINE_ITEM_UNIT_PRICE_CANNOT_BE_NEGATIVE"), "Invalid pricing blocks negative unit price");
assert(invalidValidation.blockedReasons.includes("DISCOUNT_RULE_ID_REQUIRED"), "Invalid pricing requires discount rule id");
assert(invalidValidation.blockedReasons.includes("DISCOUNT_RULE_LABEL_REQUIRED"), "Invalid pricing requires discount rule label");
assert(invalidValidation.blockedReasons.includes("PERCENT_DISCOUNT_CANNOT_EXCEED_100"), "Invalid pricing blocks percent discount over 100");

const ledgerPath = getProductBundlePricingLedgerPath();
assert(fs.existsSync(ledgerPath), "Product bundle pricing ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "Product bundle pricing ledger contains entries");

console.log("");
console.log("PRODUCT_BUNDLE_PRICING_REGISTRY_SMOKE=PASS");









