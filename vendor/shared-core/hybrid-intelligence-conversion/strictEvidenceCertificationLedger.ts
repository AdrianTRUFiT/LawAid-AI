import fs from "fs";
import path from "path";
import { StrictEvidenceCertificationResult } from "./strictEvidenceCertificationGate";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const STRICT_EVIDENCE_GATE_LEDGER_PATH = path.join(LEDGER_DIR, "strict-evidence-certification-gate-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type StrictEvidenceCertificationLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  resultId: string;
  reviewPacketId: string;
  evidencePacketId?: string;
  status:
    | "evidence_packet_created"
    | "evidence_packet_not_created";
  reason: StrictEvidenceCertificationResult["reason"];
  chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence";
  authorityBoundary: {
    reviewIsNotEvidence: true;
    invalidCertificationCreatesNoEvidencePacket: true;
    evidenceRequiresExternalAuthority: true;
    lawAidAIMayNotCertifyEvidence: true;
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
  };
  notes: string[];
};

export function recordStrictEvidenceCertificationResult(
  result: StrictEvidenceCertificationResult
): StrictEvidenceCertificationLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const entry: StrictEvidenceCertificationLedgerEntry = {
    ledgerEntryId: id("strict-evidence-ledger"),
    createdAt: new Date().toISOString(),
    resultId: result.resultId,
    reviewPacketId: result.reviewPacketId,
    evidencePacketId: result.evidencePacket?.evidencePacketId,
    status:
      result.resultStatus === "EVIDENCE_PACKET_CREATED"
        ? "evidence_packet_created"
        : "evidence_packet_not_created",
    reason: result.reason,
    chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
    authorityBoundary: {
      reviewIsNotEvidence: true,
      invalidCertificationCreatesNoEvidencePacket: true,
      evidenceRequiresExternalAuthority: true,
      lawAidAIMayNotCertifyEvidence: true,
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true
    },
    notes: [
      "Strict evidence certification gate ledger preserves the no-packet-on-invalid-certification rule.",
      "Review remains non-certifying.",
      "Evidence remains external-authority only.",
      "Evidence remains non-activating."
    ]
  };

  fs.appendFileSync(
    STRICT_EVIDENCE_GATE_LEDGER_PATH,
    JSON.stringify({ result, entry }) + "\n",
    "utf8"
  );

  return entry;
}

export function getStrictEvidenceCertificationLedgerPath() {
  return STRICT_EVIDENCE_GATE_LEDGER_PATH;
}
