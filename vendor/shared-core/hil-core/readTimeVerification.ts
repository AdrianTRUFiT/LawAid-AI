import { verifyPersistentLedger } from './persistentLedger';

export function verifyLedgerBeforeExecution() {
  const result = verifyPersistentLedger();

  if (!result.verified) {
    return {
      decision: "BLOCK",
      reason: "LEDGER_TAMPER_DETECTED",
      detail: result
    };
  }

  return {
    decision: "OK",
    entries: result.entries
  };
}
