import fs from "fs";
import path from "path";
import { LawAidAIReceivingInputPacket } from "./lawaidaiReceivingBridge";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const RECEIVING_LEDGER_PATH = path.join(LEDGER_DIR, "lawaidai-receiving-input-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type LawAidAIReceivingLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  status: "receiving_recorded" | "receiving_held";
  chain: "Reality -> HIL -> HIC -> LawAidAI Receiving";
  authorityBoundary: {
    receivingIsNotAuthority: true;
    receivingIsNotActivation: true;
    receivingDoesNotVerifyTruth: true;
  };
  notes: string[];
};

export function recordLawAidAIReceivingInput(
  packet: LawAidAIReceivingInputPacket
): LawAidAIReceivingLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const entry: LawAidAIReceivingLedgerEntry = {
    ledgerEntryId: id("lawaidai-receiving-ledger"),
    createdAt: new Date().toISOString(),
    receivingInputId: packet.receivingInputId,
    custodyId: packet.custodyId,
    sourceReferencePacketId: packet.sourceReferencePacketId,
    hilDecisionId: packet.hilDecisionId,
    hicConversionId: packet.hicConversionId,
    status:
      packet.receivingStatus === "RECEIVING_INPUT_READY"
        ? "receiving_recorded"
        : "receiving_held",
    chain: "Reality -> HIL -> HIC -> LawAidAI Receiving",
    authorityBoundary: {
      receivingIsNotAuthority: true,
      receivingIsNotActivation: true,
      receivingDoesNotVerifyTruth: true
    },
    notes: [
      "Receiving ledger records intake visibility only.",
      "Receiving ledger does not create verified state.",
      "Receiving ledger does not activate LawAidAI output.",
      "Receiving ledger preserves source trace."
    ]
  };

  fs.appendFileSync(
    RECEIVING_LEDGER_PATH,
    JSON.stringify({ packet, entry }) + "\n",
    "utf8"
  );

  return entry;
}

export function getLawAidAIReceivingLedgerPath() {
  return RECEIVING_LEDGER_PATH;
}
