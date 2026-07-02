import type { FraudAttackVector, FraudHarnessPolicy } from "../fraudai-adversarial-harness";
import type { FraudSeverityTier, FraudPressureRoute } from "./adaptiveFraudPressureContracts";

export interface FraudVectorWeight {
  vector: FraudAttackVector;
  baseRisk: number;
  severity: FraudSeverityTier;
  defaultRoute: FraudPressureRoute;
  reason: string;
}

export const FRAUD_VECTOR_WEIGHTS: FraudVectorWeight[] = [
  {
    vector: "ANCHOR_HASH_MUTATION",
    baseRisk: 72,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Direct tampering attempt against public verification anchor."
  },
  {
    vector: "RECEIPT_HASH_MUTATION",
    baseRisk: 72,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Direct tampering attempt against public verification receipt."
  },
  {
    vector: "PROJECTION_HASH_MUTATION",
    baseRisk: 82,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Attempt to alter projection identity beneath public anchor."
  },
  {
    vector: "LEDGER_ENTRY_HASH_MUTATION",
    baseRisk: 82,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Attempt to alter tamper-aware ledger continuity."
  },
  {
    vector: "SOURCE_AUTHORITY_MUTATION",
    baseRisk: 90,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to confuse source authority and undermine FundTrackerAI truth."
  },
  {
    vector: "DESTINATION_MUTATION",
    baseRisk: 76,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Attempt to reroute projection destination."
  },
  {
    vector: "REGISTRY_NAME_MUTATION",
    baseRisk: 78,
    severity: "HIGH",
    defaultRoute: "HUMAN_REVIEW",
    reason: "Attempt to forge registry identity."
  },
  {
    vector: "RECEIPT_SWAP",
    baseRisk: 88,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to attach valid-looking receipt to wrong anchor."
  },
  {
    vector: "BOUNDARY_DOWNGRADE",
    baseRisk: 96,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to convert non-authority artifact into authority."
  },
  {
    vector: "RAW_PROJECTION_PUBLIC_LEAK",
    baseRisk: 92,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to expose raw projection in public verification layer."
  },
  {
    vector: "RAW_FINANCIAL_PUBLIC_LEAK",
    baseRisk: 100,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to expose raw financial data."
  },
  {
    vector: "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK",
    baseRisk: 96,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to expose private custody path."
  },
  {
    vector: "SYNTHETIC_RECEIPT",
    baseRisk: 94,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Attempt to fabricate proof artifact."
  },
  {
    vector: "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION",
    baseRisk: 90,
    severity: "CRITICAL",
    defaultRoute: "CRITICAL_ESCALATION",
    reason: "Replay attempt against different projection."
  }
];

export function getVectorWeight(vector: FraudAttackVector): FraudVectorWeight {
  const found = FRAUD_VECTOR_WEIGHTS.find((item) => item.vector === vector);

  if (!found) {
    throw new Error(`UNKNOWN_FRAUD_VECTOR: ${vector}`);
  }

  return found;
}

export function assertPolicyCoverage(policy: FraudHarnessPolicy): boolean {
  return policy.requiredVectors.every((vector) =>
    FRAUD_VECTOR_WEIGHTS.some((weight) => weight.vector === vector)
  );
}

