import type {
  ScreeningDecisionResolution,
  ScreeningEngineInput,
  ScreeningEngineOutput,
} from "./screeningContracts";
import type { RuleHit } from "./screeningTypes";
import { buildScreeningArtifacts } from "./screeningArtifacts";
import { applyModeAdjustment, isScreeningEnabled } from "./screeningMode";
import { evaluateAllRules } from "./screeningRules";

function resolveDecision(hits: RuleHit[]): ScreeningDecisionResolution {
  if (hits.some((h) => h.ruleType === "SANCTIONS_MATCH" || h.ruleType === "COUNTRY_RESTRICTION")) {
    return {
      decision: "REFUSE",
      consequenceClass: "refuse_progression",
      summary: "Critical screening hit requires refusal.",
    };
  }

  if (hits.some((h) => h.ruleType === "DUPLICATE_TRANSACTION")) {
    return {
      decision: "HOLD",
      consequenceClass: "hold_progression",
      summary: "Duplicate indicator requires hold.",
    };
  }

  if (hits.some((h) => h.ruleType === "KYC_INCOMPLETE")) {
    return {
      decision: "REVIEW_REQUIRED",
      consequenceClass: "require_human_review",
      summary: "KYC incompleteness requires review.",
    };
  }

  if (hits.length > 0) {
    return {
      decision: "REVIEW_REQUIRED",
      consequenceClass: "require_human_review",
      summary: "Non-critical screening hits require review.",
    };
  }

  return {
    decision: "PASS",
    consequenceClass: "allow_progression",
    summary: "Screening passed with no active hits.",
  };
}

export function runTransactionScreening({
  input,
  policy,
}: ScreeningEngineInput): ScreeningEngineOutput {
  if (!isScreeningEnabled(policy.mode)) {
    const decision = "PASS";
    const consequenceClass = "allow_progression";
    const summary = "Screening is disabled; transaction progression remains unchanged.";

    const artifacts = buildScreeningArtifacts(
      input,
      decision,
      consequenceClass,
      [],
      summary
    );

    return {
      transactionId: input.transactionId,
      mode: policy.mode,
      decision,
      consequenceClass,
      hits: [],
      artifacts,
      reviewRequired: false,
      blocked: false,
      allowed: true,
      summary,
    };
  }

  const rawHits = evaluateAllRules(input, policy);
  const rawResolution = resolveDecision(rawHits);

  const adjustedDecision = applyModeAdjustment(policy.mode, rawResolution.decision);

  const adjustedConsequence =
    adjustedDecision === "PASS"
      ? "allow_progression"
      : adjustedDecision === "REVIEW_REQUIRED"
      ? "require_human_review"
      : adjustedDecision === "HOLD"
      ? "hold_progression"
      : "refuse_progression";

  const summary =
    policy.mode === "observe" && rawHits.length > 0
      ? `Observe-only mode recorded ${rawHits.length} hit(s); progression remains allowed.`
      : rawResolution.summary;

  const artifacts = buildScreeningArtifacts(
    input,
    adjustedDecision,
    adjustedConsequence,
    rawHits,
    summary
  );

  return {
    transactionId: input.transactionId,
    mode: policy.mode,
    decision: adjustedDecision,
    consequenceClass: adjustedConsequence,
    hits: rawHits,
    artifacts,
    reviewRequired: adjustedDecision === "REVIEW_REQUIRED",
    blocked: adjustedDecision === "HOLD" || adjustedDecision === "REFUSE",
    allowed: adjustedDecision === "PASS",
    summary,
  };
}
