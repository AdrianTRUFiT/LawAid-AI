import type {
  SoulRegistryPublicAnchor,
  SoulRegistryPublicReceipt,
  SoulRegistryRefusalCode
} from "../soulregistry-anchor";

export type FraudAttackVector =
  | "ANCHOR_HASH_MUTATION"
  | "RECEIPT_HASH_MUTATION"
  | "PROJECTION_HASH_MUTATION"
  | "LEDGER_ENTRY_HASH_MUTATION"
  | "SOURCE_AUTHORITY_MUTATION"
  | "DESTINATION_MUTATION"
  | "REGISTRY_NAME_MUTATION"
  | "RECEIPT_SWAP"
  | "BOUNDARY_DOWNGRADE"
  | "RAW_PROJECTION_PUBLIC_LEAK"
  | "RAW_FINANCIAL_PUBLIC_LEAK"
  | "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK"
  | "SYNTHETIC_RECEIPT"
  | "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION";

export type FraudAttackResultStatus =
  | "FRAUD_ATTACK_REFUSED"
  | "FRAUD_ATTACK_DETECTED"
  | "FRAUD_ATTACK_ESCAPED";

export interface FraudMutationInput {
  vector: FraudAttackVector;
  anchor: SoulRegistryPublicAnchor;
  receipt: SoulRegistryPublicReceipt;
}

export interface FraudMutationOutput {
  vector: FraudAttackVector;
  mutatedAnchor: SoulRegistryPublicAnchor;
  mutatedReceipt: SoulRegistryPublicReceipt;
  injectedPublicPayload?: string;
}

export interface FraudAttackResult {
  vector: FraudAttackVector;
  status: FraudAttackResultStatus;
  refused: boolean;
  detected: boolean;
  refusalReasons: string[];
  expectedRefusalReasons: string[];
  boundary: {
    fraudDidNotCreatePaymentAuthority: true;
    fraudDidNotCreateTransactionTruth: true;
    fraudDidNotCreateCustodyTransfer: true;
    fraudDidNotExposeRawProjection: boolean;
    fraudDidNotExposeRawFinancialData: boolean;
    fraudDidNotExposePrivateCustodyPath: boolean;
  };
}

export interface FraudHarnessRunResult {
  status: "FRAUDAI_ADVERSARIAL_HARNESS_PASS" | "FRAUDAI_ADVERSARIAL_HARNESS_FAIL";
  passed: boolean;
  totalVectors: number;
  refusedOrDetected: number;
  escapedVectors: FraudAttackVector[];
  results: FraudAttackResult[];
  boundary: {
    noPaymentAuthorityCreated: true;
    noTransactionTruthCreated: true;
    noCustodyTransferCreated: true;
    registryVerifierIsReadOnly: true;
    publicPrivateSeparationMaintained: boolean;
  };
}

export interface FraudHarnessPolicy {
  name: "FraudAI Adversarial Harness";
  purpose: string;
  successStandard: string;
  requiredVectors: FraudAttackVector[];
  expectedRefusals: Record<FraudAttackVector, string[]>;
}

