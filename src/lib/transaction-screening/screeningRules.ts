import type {
  RuleEvaluator,
  ScreeningInput,
  ScreeningPolicy,
} from "./screeningContracts";
import type { RuleHit } from "./screeningTypes";

function buildHit(
  ruleId: string,
  ruleType: RuleHit["ruleType"],
  severity: RuleHit["severity"],
  message: string,
  evidence?: Record<string, unknown>
): RuleHit {
  return {
    ruleId,
    ruleType,
    severity,
    message,
    triggered: true,
    evidence,
  };
}

export const evaluateSanctions: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.sanctions;
  if (!rule.enabled) return null;

  if (input.sender.sanctionsMatched || input.recipient.sanctionsMatched) {
    return buildHit(
      rule.id,
      "SANCTIONS_MATCH",
      rule.severityOnTrigger ?? "critical",
      "Sanctions match detected.",
      {
        senderMatched: !!input.sender.sanctionsMatched,
        recipientMatched: !!input.recipient.sanctionsMatched,
      }
    );
  }

  return null;
};

export const evaluateKyc: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.kyc;
  if (!rule.enabled) return null;

  if (!input.sender.kycVerified || !input.recipient.kycVerified) {
    return buildHit(
      rule.id,
      "KYC_INCOMPLETE",
      rule.severityOnTrigger ?? "high",
      "KYC verification incomplete.",
      {
        senderKycVerified: input.sender.kycVerified,
        recipientKycVerified: input.recipient.kycVerified,
      }
    );
  }

  return null;
};

export const evaluateDuplicate: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.duplicate;
  if (!rule.enabled) return null;

  if (input.priorTransactionIds?.includes(input.transactionId)) {
    return buildHit(
      rule.id,
      "DUPLICATE_TRANSACTION",
      rule.severityOnTrigger ?? "high",
      "Duplicate transaction detected.",
      {
        transactionId: input.transactionId,
      }
    );
  }

  return null;
};

export const evaluateVelocity: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.velocity;
  if (!rule.enabled) return null;

  const threshold = rule.threshold ?? 5;
  const count = input.recentVelocityCount ?? 0;

  if (count > threshold) {
    return buildHit(
      rule.id,
      "VELOCITY_LIMIT",
      rule.severityOnTrigger ?? "medium",
      "Velocity threshold exceeded.",
      {
        recentVelocityCount: count,
        threshold,
      }
    );
  }

  return null;
};

export const evaluateAmountThreshold: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.amountThreshold;
  if (!rule.enabled) return null;

  const threshold = rule.threshold ?? 10000;
  if (input.amount >= threshold) {
    return buildHit(
      rule.id,
      "AMOUNT_THRESHOLD",
      rule.severityOnTrigger ?? "medium",
      "Amount threshold triggered.",
      {
        amount: input.amount,
        threshold,
      }
    );
  }

  return null;
};

export const evaluateCountryRestriction: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.countryRestriction;
  if (!rule.enabled) return null;

  const blocked = new Set(rule.blockedCountries ?? []);
  const senderCountry = input.sender.country ?? "";
  const recipientCountry = input.recipient.country ?? "";

  if (blocked.has(senderCountry) || blocked.has(recipientCountry)) {
    return buildHit(
      rule.id,
      "COUNTRY_RESTRICTION",
      rule.severityOnTrigger ?? "critical",
      "Restricted country detected.",
      {
        senderCountry,
        recipientCountry,
      }
    );
  }

  return null;
};

export const evaluateContradictoryMetadata: RuleEvaluator = (input, policy) => {
  const rule = policy.rules.contradictoryMetadata;
  if (!rule.enabled) return null;

  const metadata = input.metadata ?? {};
  const declaredSenderId = metadata["declaredSenderId"];
  if (declaredSenderId && declaredSenderId !== input.sender.id) {
    return buildHit(
      rule.id,
      "CONTRADICTORY_METADATA",
      rule.severityOnTrigger ?? "medium",
      "Contradictory transaction metadata detected.",
      {
        declaredSenderId,
        actualSenderId: input.sender.id,
      }
    );
  }

  return null;
};

export function evaluateAllRules(
  input: ScreeningInput,
  policy: ScreeningPolicy
): RuleHit[] {
  const evaluators: RuleEvaluator[] = [
    evaluateSanctions,
    evaluateKyc,
    evaluateDuplicate,
    evaluateVelocity,
    evaluateAmountThreshold,
    evaluateCountryRestriction,
    evaluateContradictoryMetadata,
  ];

  return evaluators
    .map((fn) => fn(input, policy))
    .filter((hit): hit is RuleHit => hit !== null);
}
