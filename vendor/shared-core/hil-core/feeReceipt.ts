import { appendPersistentLedger } from './persistentLedger';

export type FeeReceipt = {
  receiptId: string;
  eventId: string;
  artifactId: string;
  module: string;
  eventType: string;
  fee: number;
  currency: "USD";
  issuedAt: number;
  ledgerHash: string;
};

export function createFeeReceipt(input: {
  eventId: string;
  artifactId: string;
  module: string;
  eventType: string;
  fee: number;
}) {

  const ledger = appendPersistentLedger({
    eventId: input.eventId,
    artifactId: input.artifactId,
    type: input.eventType,
    module: input.module,
    fee: input.fee
  });

  return {
    ledger,
    receipt: {
      receiptId: "FEE-" + ledger.hash.slice(0, 16),
      eventId: input.eventId,
      artifactId: input.artifactId,
      module: input.module,
      eventType: input.eventType,
      fee: input.fee,
      currency: "USD",
      issuedAt: ledger.timestamp,
      ledgerHash: ledger.hash
    }
  };
}
