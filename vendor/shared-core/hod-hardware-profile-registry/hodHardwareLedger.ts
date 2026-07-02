import fs from "fs";
import path from "path";
import {
  HODHardwareLedgerEntry,
  HODHardwareProfile,
  HODHardwareUseGuardResult,
  HODHardwareValidationResult
} from "./hodHardwareContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hod-hardware-profile-registry";
const LEDGER_PATH = path.join(LEDGER_DIR, "hod-hardware-profile-registry-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordHODHardwareProfileRegistered(
  profile: HODHardwareProfile
): HODHardwareLedgerEntry {
  const entry: HODHardwareLedgerEntry = {
    ledgerEntryId: id("hod-hardware-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "HARDWARE_PROFILE_REGISTERED",
    hardwareProfileId: profile.hardwareProfileId,
    status: profile.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "HOD hardware profile registered.",
      "Hardware profile is not authority, identity, deployment approval, runtime execution, or source truth."
    ]
  };

  appendJsonl({ profile, entry });
  return entry;
}

export function recordHODHardwareProfileValidated(
  profile: HODHardwareProfile,
  result: HODHardwareValidationResult
): HODHardwareLedgerEntry {
  const entry: HODHardwareLedgerEntry = {
    ledgerEntryId: id("hod-hardware-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "HARDWARE_PROFILE_VALIDATED",
    hardwareProfileId: profile.hardwareProfileId,
    status: profile.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Hardware profile valid: ${result.valid}`,
      `Blocked reasons: ${result.blockedReasons.join(", ") || "None"}`,
      "Validation is not approval.",
      "Validation is not runtime use."
    ]
  };

  appendJsonl({ profile, result, entry });
  return entry;
}

export function recordHODHardwareUseGuard(
  profile: HODHardwareProfile,
  result: HODHardwareUseGuardResult
): HODHardwareLedgerEntry {
  const entry: HODHardwareLedgerEntry = {
    ledgerEntryId: id("hod-hardware-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "HARDWARE_USE_GUARD_CHECKED",
    hardwareProfileId: profile.hardwareProfileId,
    status: profile.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Use allowed: ${result.allowed}`,
      `Use reason: ${result.reason}`,
      "Use guard is not execution.",
      "Use guard is not deployment.",
      "Use guard is not identity authority."
    ]
  };

  appendJsonl({ profile, result, entry });
  return entry;
}

export function getHODHardwareLedgerPath() {
  return LEDGER_PATH;
}
