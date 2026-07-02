import fs from "fs";
import path from "path";
import { ActionGateResult } from "./lawaidaiActionGate";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/hic-ledger";
const ACTION_LEDGER_PATH = path.join(LEDGER_DIR, "lawaidai-action-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type LawAidAIActionLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  resultId: string;
  evidencePacketId?: string;
  actionPacketId?: string;
  status: "action_packet_created" | "action_packet_not_created";
  reason: ActionGateResult["reason"];
  chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action";
  authorityBoundary: {
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
    humanActivationRequired: true;
    noEvidenceBypass: true;
    noAuthorityBypass: true;
    actionDoesNotCreateTruth: true;
    actionDoesNotCertifyEvidence: true;
  };
  notes: string[];
};

export function recordLawAidAIActionGateResult(
  result: ActionGateResult
): LawAidAIActionLedgerEntry {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });

  const entry: LawAidAIActionLedgerEntry = {
    ledgerEntryId: id("lawaidai-action-ledger"),
    createdAt: new Date().toISOString(),
    resultId: result.resultId,
    evidencePacketId: result.evidencePacketId,
    actionPacketId: result.actionPacket?.actionPacketId,
    status:
      result.resultStatus === "ACTION_PACKET_CREATED"
        ? "action_packet_created"
        : "action_packet_not_created",
    reason: result.reason,
    chain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
    authorityBoundary: {
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      humanActivationRequired: true,
      noEvidenceBypass: true,
      noAuthorityBypass: true,
      actionDoesNotCreateTruth: true,
      actionDoesNotCertifyEvidence: true
    },
    notes: [
      "Action ledger preserves the evidence-to-action boundary.",
      "Evidence does not trigger Action.",
      "Action requires valid human activation authority.",
      "Action remains trace-bound and does not create truth or evidence certification."
    ]
  };

  fs.appendFileSync(
    ACTION_LEDGER_PATH,
    JSON.stringify({ result, entry }) + "\n",
    "utf8"
  );

  return entry;
}

export function getLawAidAIActionLedgerPath() {
  return ACTION_LEDGER_PATH;
}
