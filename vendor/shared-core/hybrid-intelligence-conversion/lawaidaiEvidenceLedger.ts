import fs from "fs";
import path from "path";
import { EvidencePacket } from "./lawaidaiEvidenceGate";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const EVIDENCE_LEDGER_PATH = path.join(LEDGER_DIR, "lawaidai-evidence-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type LawAidAIEvidenceLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  evidencePacketId: string;
  reviewPacketId: string;
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  status:
    | "evidence_certified_external"
    | "evidence_held_for_external_certification"
    | "evidence_refused";
  chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence";
  authorityBoundary: {
    reviewIsNotEvidence: true;
    evidenceRequiresExternalAuthority: true;
    lawAidAIMayNotCertifyEvidence: true;
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
  };
  notes: string[];
};

export function recordLawAidAIEvidencePacket(
  packet: EvidencePacket
): LawAidAIEvidenceLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const status =
    packet.evidenceStatus === "EVIDENCE_CERTIFIED"
      ? "evidence_certified_external"
      : packet.evidenceStatus === "EVIDENCE_HELD_FOR_EXTERNAL_CERTIFICATION"
        ? "evidence_held_for_external_certification"
        : "evidence_refused";

  const entry: LawAidAIEvidenceLedgerEntry = {
    ledgerEntryId: id("lawaidai-evidence-ledger"),
    createdAt: new Date().toISOString(),
    evidencePacketId: packet.evidencePacketId,
    reviewPacketId: packet.reviewPacketId,
    receivingInputId: packet.receivingInputId,
    custodyId: packet.custodyId,
    sourceReferencePacketId: packet.sourceReferencePacketId,
    hilDecisionId: packet.hilDecisionId,
    hicConversionId: packet.hicConversionId,
    status,
    chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
    authorityBoundary: {
      reviewIsNotEvidence: true,
      evidenceRequiresExternalAuthority: true,
      lawAidAIMayNotCertifyEvidence: true,
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true
    },
    notes: [
      "Evidence ledger records external-certification status only.",
      "Review did not create evidence.",
      "LawAidAI did not internally certify evidence.",
      "Evidence does not trigger action.",
      "Action requires proper activation authority."
    ]
  };

  fs.appendFileSync(
    EVIDENCE_LEDGER_PATH,
    JSON.stringify({ packet, entry }) + "\n",
    "utf8"
  );

  return entry;
}

export function getLawAidAIEvidenceLedgerPath() {
  return EVIDENCE_LEDGER_PATH;
}
