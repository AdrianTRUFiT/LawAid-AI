import { createHash } from "crypto";

export type TSDecisionState = "SAFE" | "HOLD" | "REFUSED";

export interface TransactionStatement {
  tsId: string;
  protocol: "TS";
  sourceReportId: string;
  decisionState: TSDecisionState;
  decisionReason: string;
  authorizedBy: string;
  assetIds: string[];
  consequenceSummary: string;
  proofHash: string;
  createdAt: string;
}

export function makeProofHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function createTransactionStatement(input: Omit<TransactionStatement, "tsId" | "protocol" | "proofHash" | "createdAt">): TransactionStatement {
  const base = {
    tsId: "ts_" + Date.now(),
    protocol: "TS" as const,
    ...input,
    createdAt: new Date().toISOString()
  };

  return {
    ...base,
    proofHash: makeProofHash(base)
  };
}

export function validateTransactionStatement(ts: TransactionStatement): boolean {
  const { proofHash, ...base } = ts as any;
  return proofHash === makeProofHash(base);
}
