import { createHash } from "crypto";
import { TransactionStatement } from "../transaction-statements";

export interface ProofBackRecord {
  proofBackId: string;
  protocol: "PROOFBACK";
  sourceTsId: string;
  decisionState: string;
  recordType: "ASSET_GOVERNANCE";
  preservedHash: string;
  createdAt: string;
  transactionStatement: TransactionStatement;
}

export function createProofBackRecord(ts: TransactionStatement): ProofBackRecord {
  const base = {
    proofBackId: "proofback_" + Date.now(),
    protocol: "PROOFBACK" as const,
    sourceTsId: ts.tsId,
    decisionState: ts.decisionState,
    recordType: "ASSET_GOVERNANCE" as const,
    createdAt: new Date().toISOString(),
    transactionStatement: ts
  };

  return {
    ...base,
    preservedHash: createHash("sha256").update(JSON.stringify(base)).digest("hex")
  };
}
