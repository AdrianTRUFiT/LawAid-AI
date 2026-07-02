export type ValueStoreType =
  | "bank_deposit_account"
  | "prepaid_account"
  | "credit_line"
  | "wallet_balance"
  | "app_balance"
  | "stored_value_system"
  | "brokerage_cash_balance";

export type ObligationStatus =
  | "created"
  | "instruction_minted"
  | "submitted"
  | "verified"
  | "refused"
  | "expired";

export interface PaymentObligation {
  obligationId: string;
  merchantId: string;
  consumerRef: string;
  valueStoreType: ValueStoreType;
  amount: number;
  currency: string;
  purpose: string;
  dueAt?: string;
  createdAt: string;
  status: ObligationStatus;
  proofRequirements: string[];
}

export interface PaymentInstructionGuard {
  instructionId: string;
  obligationId: string;
  merchantId: string;
  consumerRef: string;
  amount: number;
  currency: string;
  destinationRef: string;
  nonce: string;
  expiresAt: string;
  commitmentHash: string;
  createdAt: string;
  status: "minted" | "submitted" | "verified" | "refused" | "expired";
  consumedAt?: string;
}

export interface ProcessorSubmission {
  processorReference: string;
  transactionId: string;
  instructionId: string;
  merchantId: string;
  amount: number;
  currency: string;
  destinationRef: string;
  receivedAt: string;
  rawStatus: string;
}

export interface GuardVerificationResult {
  allowed: boolean;
  status: "verified" | "refused" | "expired";
  reasons: string[];
  evaluatedAt: string;
}
