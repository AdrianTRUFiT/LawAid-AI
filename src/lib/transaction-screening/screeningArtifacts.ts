import type { ScreeningInput } from "./screeningContracts";
import type {
  ConsequenceClass,
  RuleHit,
  ScreeningArtifact,
  ScreeningDecision,
} from "./screeningTypes";

function artifactId(prefix: string, transactionId: string, n: number): string {
  return `${prefix}-${transactionId}-${String(n).padStart(3, "0")}`;
}

export function buildScreeningArtifacts(
  input: ScreeningInput,
  decision: ScreeningDecision,
  consequenceClass: ConsequenceClass,
  hits: RuleHit[],
  summary: string
): ScreeningArtifact[] {
  const createdAt = new Date().toISOString();
  const artifacts: ScreeningArtifact[] = [];

  artifacts.push({
    artifactId: artifactId("screening-entry", input.transactionId, 1),
    artifactType: "ScreeningEntryArtifact",
    createdAt,
    transactionId: input.transactionId,
    decision,
    consequenceClass,
    details: {
      transactionType: input.transactionType,
      amount: input.amount,
      currency: input.currency,
      occurredAt: input.occurredAt,
    },
  });

  hits.forEach((hit, index) => {
    artifacts.push({
      artifactId: artifactId("screening-hit", input.transactionId, index + 2),
      artifactType: "ScreeningRuleHitArtifact",
      createdAt,
      transactionId: input.transactionId,
      decision,
      consequenceClass,
      details: {
        ruleId: hit.ruleId,
        ruleType: hit.ruleType,
        severity: hit.severity,
        message: hit.message,
        evidence: hit.evidence ?? {},
      },
    });
  });

  if (decision === "REVIEW_REQUIRED") {
    artifacts.push({
      artifactId: artifactId("screening-review", input.transactionId, 500),
      artifactType: "ScreeningReviewRequiredArtifact",
      createdAt,
      transactionId: input.transactionId,
      decision,
      consequenceClass,
      details: { summary },
    });
  }

  if (decision === "HOLD") {
    artifacts.push({
      artifactId: artifactId("screening-hold", input.transactionId, 600),
      artifactType: "ScreeningHoldArtifact",
      createdAt,
      transactionId: input.transactionId,
      decision,
      consequenceClass,
      details: { summary },
    });
  }

  if (decision === "REFUSE") {
    artifacts.push({
      artifactId: artifactId("screening-refuse", input.transactionId, 700),
      artifactType: "ScreeningRefusalArtifact",
      createdAt,
      transactionId: input.transactionId,
      decision,
      consequenceClass,
      details: { summary },
    });
  }

  if (decision === "PASS") {
    artifacts.push({
      artifactId: artifactId("screening-clear", input.transactionId, 800),
      artifactType: "ScreeningClearanceArtifact",
      createdAt,
      transactionId: input.transactionId,
      decision,
      consequenceClass,
      details: { summary },
    });
  }

  artifacts.push({
    artifactId: artifactId("screening-summary", input.transactionId, 999),
    artifactType: "ScreeningSummaryArtifact",
    createdAt,
    transactionId: input.transactionId,
    decision,
    consequenceClass,
    details: {
      hitCount: hits.length,
      summary,
    },
  });

  return artifacts;
}
