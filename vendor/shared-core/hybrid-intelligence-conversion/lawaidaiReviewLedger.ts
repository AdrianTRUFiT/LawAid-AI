import fs from "fs";
import path from "path";
import { LawAidAIReviewPacket } from "./lawaidaiReviewGate";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const REVIEW_LEDGER_PATH = path.join(LEDGER_DIR, "lawaidai-review-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type LawAidAIReviewLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  reviewPacketId: string;
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  status: "review_recorded" | "review_held";
  chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review";
  authorityBoundary: {
    reviewIsNotEvidence: true;
    reviewIsNotAction: true;
    reviewIsNotExternalCertification: true;
    reviewIsNotActivationAuthority: true;
    reviewDoesNotVerifyTruth: true;
  };
  notes: string[];
};

export function recordLawAidAIReviewPacket(
  packet: LawAidAIReviewPacket
): LawAidAIReviewLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const entry: LawAidAIReviewLedgerEntry = {
    ledgerEntryId: id("lawaidai-review-ledger"),
    createdAt: new Date().toISOString(),
    reviewPacketId: packet.reviewPacketId,
    receivingInputId: packet.receivingInputId,
    custodyId: packet.custodyId,
    sourceReferencePacketId: packet.sourceReferencePacketId,
    hilDecisionId: packet.hilDecisionId,
    hicConversionId: packet.hicConversionId,
    status:
      packet.reviewStatus === "REVIEW_PACKET_READY"
        ? "review_recorded"
        : "review_held",
    chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review",
    authorityBoundary: {
      reviewIsNotEvidence: true,
      reviewIsNotAction: true,
      reviewIsNotExternalCertification: true,
      reviewIsNotActivationAuthority: true,
      reviewDoesNotVerifyTruth: true
    },
    notes: [
      "Review ledger records governed interpretation eligibility only.",
      "Review ledger does not create evidence.",
      "Review ledger does not trigger action.",
      "Review ledger does not create activation authority.",
      "Review ledger preserves custody, source reference, HIL, HIC, and receiving trace."
    ]
  };

  fs.appendFileSync(
    REVIEW_LEDGER_PATH,
    JSON.stringify({ packet, entry }) + "\n",
    "utf8"
  );

  return entry;
}

export function getLawAidAIReviewLedgerPath() {
  return REVIEW_LEDGER_PATH;
}
