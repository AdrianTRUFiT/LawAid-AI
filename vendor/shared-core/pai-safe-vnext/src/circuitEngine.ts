import type {
  PaiSafeTransactionCircuitResult,
  PaiSafeTransactionRequest
} from "./contracts.js";
import { runAdvisoryTrustCheck } from "./trustCheckEngine.js";
import { generateProofBackProtectionRecord } from "./proofBackEngine.js";
import { generateProofBackedReceipt } from "./receiptEngine.js";

export function runPaiSafeTransactionCircuit(
  request: PaiSafeTransactionRequest,
  now = new Date().toISOString()
): PaiSafeTransactionCircuitResult {
  const trustCheck = runAdvisoryTrustCheck(request, now);
  const proofBack = generateProofBackProtectionRecord(request, trustCheck, now);
  const receipt = generateProofBackedReceipt(request, trustCheck, proofBack, now);

  return {
    request,
    trustCheck,
    proofBack,
    receipt
  };
}
