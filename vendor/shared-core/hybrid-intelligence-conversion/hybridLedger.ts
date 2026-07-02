import fs from "fs";
import path from "path";
import {
  AnalogCustodyRecord,
  AnalogObservation,
  HICConversionPacket,
  HILDecision,
  HybridLedgerEntry,
  SourceReferencePacket
} from "./hybridContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const LEDGER_PATH = path.join(LEDGER_DIR, "hic-ledger.jsonl");
const CUSTODY_LEDGER_PATH = path.join(LEDGER_DIR, "analog-custody-ledger.jsonl");
const SOURCE_REFERENCE_LEDGER_PATH = path.join(LEDGER_DIR, "source-reference-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(value) + "\n", "utf8");
}

export function recordAnalogCustody(custody: AnalogCustodyRecord): HybridLedgerEntry {
  const entry: HybridLedgerEntry = {
    ledgerEntryId: id("custody-ledger"),
    createdAt: new Date().toISOString(),
    observationId: custody.observationId,
    custodyId: custody.custodyId,
    status: custody.custodyStatus === "custody_recorded" ? "custody_recorded" : "refused",
    chain: "Reality -> HIL -> HIC -> AIOS",
    notes: [
      "Analog custody record created.",
      "Custody record is not truth.",
      "Source reference is not authority.",
      "AI does not own the physical or analog source."
    ]
  };

  appendJsonl(CUSTODY_LEDGER_PATH, { custody, entry });
  return entry;
}

export function recordSourceReference(packet: SourceReferencePacket): HybridLedgerEntry {
  const entry: HybridLedgerEntry = {
    ledgerEntryId: id("source-reference-ledger"),
    createdAt: new Date().toISOString(),
    observationId: packet.observationId,
    custodyId: packet.custodyId,
    sourceReferencePacketId: packet.sourceReferencePacketId,
    status: packet.packetStatus === "source_reference_ready" ? "source_reference_recorded" : "refused",
    chain: "Reality -> HIL -> HIC -> AIOS",
    notes: [
      "Source reference packet created.",
      "Packet does not certify truth.",
      "Packet does not create legal evidence.",
      "HIL must review before HIC conversion."
    ]
  };

  appendJsonl(SOURCE_REFERENCE_LEDGER_PATH, { packet, entry });
  return entry;
}

export function recordHybridLedgerEntry(
  observation: AnalogObservation,
  decision: HILDecision,
  conversion?: HICConversionPacket
): HybridLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const entry: HybridLedgerEntry = {
    ledgerEntryId: id("hybrid-ledger"),
    createdAt: new Date().toISOString(),
    observationId: observation.observationId,
    hilDecisionId: decision.decisionId,
    conversionId: conversion?.conversionId,
    status: conversion?.status === "HIC_CONVERTED" ? "recorded" : "refused",
    chain: "Reality -> HIL -> HIC -> AIOS",
    notes: [
      "Reality reaches HIL first.",
      "HIC converts only HIL-approved reality.",
      "AIOS may operate only after structured conversion.",
      "Conversion does not create truth; it creates a governed digital artifact."
    ]
  };

  appendJsonl(LEDGER_PATH, entry);
  return entry;
}

export function getHybridLedgerPath() {
  return LEDGER_PATH;
}

export function getAnalogCustodyLedgerPath() {
  return CUSTODY_LEDGER_PATH;
}

export function getSourceReferenceLedgerPath() {
  return SOURCE_REFERENCE_LEDGER_PATH;
}
