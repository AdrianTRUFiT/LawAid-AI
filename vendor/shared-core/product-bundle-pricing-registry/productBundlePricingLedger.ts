import fs from "fs";
import path from "path";
import {
  ProductBundleOfferingGuardResult,
  ProductBundlePricingLedgerEntry,
  ProductBundlePricingRecord,
  ProductBundlePricingValidationResult
} from "./productBundlePricingContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/product-bundle-pricing-registry";
const LEDGER_PATH = path.join(LEDGER_DIR, "product-bundle-pricing-registry-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordProductBundlePricingRegistered(
  record: ProductBundlePricingRecord
): ProductBundlePricingLedgerEntry {
  const entry: ProductBundlePricingLedgerEntry = {
    ledgerEntryId: id("pricing-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PRICING_RECORD_REGISTERED",
    pricingRecordId: record.pricingRecordId,
    status: record.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "Product bundle pricing record registered.",
      "Pricing record is not transaction truth, payment commitment, checkout approval, activation state, or revenue recognition."
    ]
  };

  appendJsonl({ record, entry });
  return entry;
}

export function recordProductBundlePricingValidated(
  record: ProductBundlePricingRecord,
  result: ProductBundlePricingValidationResult
): ProductBundlePricingLedgerEntry {
  const entry: ProductBundlePricingLedgerEntry = {
    ledgerEntryId: id("pricing-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PRICING_RECORD_VALIDATED",
    pricingRecordId: record.pricingRecordId,
    status: record.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Pricing valid: ${result.valid}`,
      `Estimated total: ${result.estimatedTotal}`,
      `Blocked reasons: ${result.blockedReasons.join(", ") || "None"}`,
      "Validation is not offer approval.",
      "Validation is not checkout.",
      "Validation is not commitment."
    ]
  };

  appendJsonl({ record, result, entry });
  return entry;
}

export function recordProductBundleOfferingGuard(
  record: ProductBundlePricingRecord,
  result: ProductBundleOfferingGuardResult
): ProductBundlePricingLedgerEntry {
  const entry: ProductBundlePricingLedgerEntry = {
    ledgerEntryId: id("pricing-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "OFFERING_GUARD_CHECKED",
    pricingRecordId: record.pricingRecordId,
    status: record.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Offering allowed: ${result.allowed}`,
      `Offering reason: ${result.reason}`,
      "Offering guard is not checkout.",
      "Offering guard is not payment commitment.",
      "Offering guard is not activation."
    ]
  };

  appendJsonl({ record, result, entry });
  return entry;
}

export function getProductBundlePricingLedgerPath() {
  return LEDGER_PATH;
}
