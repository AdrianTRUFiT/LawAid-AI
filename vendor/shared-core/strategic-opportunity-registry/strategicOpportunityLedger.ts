import fs from "fs";
import path from "path";
import {
  StrategicOpportunityLedgerEntry,
  StrategicOpportunityRecord
} from "./strategicOpportunityContracts";
import { StrategicOpportunityPromotionResult } from "./strategicOpportunityContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/strategic-opportunity-registry";
const LEDGER_PATH = path.join(LEDGER_DIR, "strategic-opportunity-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordOpportunityCaptured(
  record: StrategicOpportunityRecord
): StrategicOpportunityLedgerEntry {
  const entry: StrategicOpportunityLedgerEntry = {
    ledgerEntryId: id("strategic-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "OPPORTUNITY_CAPTURED",
    opportunityId: record.opportunityId,
    status: record.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "Strategic opportunity captured.",
      "Registry entry is preserved signal only.",
      "Registry entry is not doctrine, build authorization, or product commitment."
    ]
  };

  appendJsonl({ record, entry });
  return entry;
}

export function recordPromotionChecked(
  record: StrategicOpportunityRecord,
  result: StrategicOpportunityPromotionResult
): StrategicOpportunityLedgerEntry {
  const entry: StrategicOpportunityLedgerEntry = {
    ledgerEntryId: id("strategic-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PROMOTION_CHECKED",
    opportunityId: record.opportunityId,
    status: record.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Promotion allowed: ${result.allowed}`,
      `Promotion reason: ${result.reason}`,
      "Promotion check is not execution.",
      "Human authorization remains required."
    ]
  };

  appendJsonl({ record, result, entry });
  return entry;
}

export function getStrategicOpportunityLedgerPath() {
  return LEDGER_PATH;
}
