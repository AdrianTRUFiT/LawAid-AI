import fs from "fs";
import path from "path";
import {
  AIOSWorkflowDefinition,
  AIOSWorkflowLedgerEntry,
  AIOSWorkflowRuntimeGuardResult,
  AIOSWorkflowValidationResult
} from "./aiosWorkflowContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/aios-workflow-registry";
const LEDGER_PATH = path.join(LEDGER_DIR, "aios-workflow-registry-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordAIOSWorkflowRegistered(
  workflow: AIOSWorkflowDefinition
): AIOSWorkflowLedgerEntry {
  const entry: AIOSWorkflowLedgerEntry = {
    ledgerEntryId: id("aios-workflow-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "WORKFLOW_REGISTERED",
    workflowId: workflow.workflowId,
    status: workflow.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "AIOS workflow registered.",
      "Workflow registration is not execution, activation, authority, or completed artifact."
    ]
  };

  appendJsonl({ workflow, entry });
  return entry;
}

export function recordAIOSWorkflowValidated(
  workflow: AIOSWorkflowDefinition,
  result: AIOSWorkflowValidationResult
): AIOSWorkflowLedgerEntry {
  const entry: AIOSWorkflowLedgerEntry = {
    ledgerEntryId: id("aios-workflow-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "WORKFLOW_VALIDATED",
    workflowId: workflow.workflowId,
    status: workflow.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Workflow valid: ${result.valid}`,
      `Blocked reasons: ${result.blockedReasons.join(", ") || "None"}`,
      "Validation is not execution.",
      "Validation is not activation."
    ]
  };

  appendJsonl({ workflow, result, entry });
  return entry;
}

export function recordAIOSWorkflowRuntimeGuard(
  workflow: AIOSWorkflowDefinition,
  result: AIOSWorkflowRuntimeGuardResult
): AIOSWorkflowLedgerEntry {
  const entry: AIOSWorkflowLedgerEntry = {
    ledgerEntryId: id("aios-workflow-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "RUNTIME_GUARD_CHECKED",
    workflowId: workflow.workflowId,
    status: workflow.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Runtime allowed: ${result.allowed}`,
      `Runtime reason: ${result.reason}`,
      "Runtime guard is not execution.",
      "Runtime guard is not activation."
    ]
  };

  appendJsonl({ workflow, result, entry });
  return entry;
}

export function getAIOSWorkflowLedgerPath() {
  return LEDGER_PATH;
}
