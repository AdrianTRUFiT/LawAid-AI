import fs from "fs";
import path from "path";
import {
  PartnerAdapterDefinition,
  PartnerAdapterLedgerEntry,
  PartnerAdapterUseGuardResult,
  PartnerAdapterValidationResult
} from "./partnerAdapterContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/partner-adapter-registry";
const LEDGER_PATH = path.join(LEDGER_DIR, "partner-adapter-registry-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordPartnerAdapterRegistered(
  adapter: PartnerAdapterDefinition
): PartnerAdapterLedgerEntry {
  const entry: PartnerAdapterLedgerEntry = {
    ledgerEntryId: id("partner-adapter-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PARTNER_ADAPTER_REGISTERED",
    partnerAdapterId: adapter.partnerAdapterId,
    status: adapter.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "Partner adapter registered.",
      "Partner adapter is not authority, trust proof, transaction truth, activation approval, or product commitment."
    ]
  };

  appendJsonl({ adapter, entry });
  return entry;
}

export function recordPartnerAdapterValidated(
  adapter: PartnerAdapterDefinition,
  result: PartnerAdapterValidationResult
): PartnerAdapterLedgerEntry {
  const entry: PartnerAdapterLedgerEntry = {
    ledgerEntryId: id("partner-adapter-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PARTNER_ADAPTER_VALIDATED",
    partnerAdapterId: adapter.partnerAdapterId,
    status: adapter.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Partner adapter valid: ${result.valid}`,
      `Blocked reasons: ${result.blockedReasons.join(", ") || "None"}`,
      "Validation is not approval.",
      "Validation is not connection."
    ]
  };

  appendJsonl({ adapter, result, entry });
  return entry;
}

export function recordPartnerAdapterUseGuard(
  adapter: PartnerAdapterDefinition,
  result: PartnerAdapterUseGuardResult
): PartnerAdapterLedgerEntry {
  const entry: PartnerAdapterLedgerEntry = {
    ledgerEntryId: id("partner-adapter-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PARTNER_ADAPTER_USE_GUARD_CHECKED",
    partnerAdapterId: adapter.partnerAdapterId,
    status: adapter.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Use allowed: ${result.allowed}`,
      `Use reason: ${result.reason}`,
      "Use guard is not execution.",
      "Use guard is not activation.",
      "Use guard is not transaction truth."
    ]
  };

  appendJsonl({ adapter, result, entry });
  return entry;
}

export function getPartnerAdapterLedgerPath() {
  return LEDGER_PATH;
}
