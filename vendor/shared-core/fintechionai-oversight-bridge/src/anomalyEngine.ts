import type {
  FinTechionAIOversightInput,
  MerchantHealthState,
  OversightAnomalyFlag,
} from "./contracts.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildOversightAnomalies(
  input: FinTechionAIOversightInput,
): OversightAnomalyFlag[] {
  const flags: OversightAnomalyFlag[] = [];
  const snapshot = input.protectedFlow.snapshot;

  if (snapshot.decision === "FLOW_SWOLLEN") {
    flags.push({
      anomalyId: makeId("anomaly"),
      category: "flow_swelling",
      severity: "high",
      message: "Protected flow is swollen and may require operator attention.",
    });
  }

  if (snapshot.decision === "FLOW_BLOCKED") {
    flags.push({
      anomalyId: makeId("anomaly"),
      category: "flow_swelling",
      severity: "critical",
      message: "Protected flow is blocked and requires escalation.",
    });
  }

  if ((input.refundExposure ?? 0) > 0) {
    flags.push({
      anomalyId: makeId("anomaly"),
      category: "refund_exposure",
      severity: (input.refundExposure ?? 0) >= 10 ? "high" : "medium",
      message: `Refund exposure present: ${input.refundExposure}.`,
    });
  }

  if ((input.disputeExposure ?? 0) > 0) {
    flags.push({
      anomalyId: makeId("anomaly"),
      category: "dispute_exposure",
      severity: (input.disputeExposure ?? 0) >= 5 ? "high" : "medium",
      message: `Dispute exposure present: ${input.disputeExposure}.`,
    });
  }

  const anyUncompliant = input.activationRecords.some(
    (x) => x.complianceSnapshot.status !== "compliant",
  );

  if (anyUncompliant) {
    flags.push({
      anomalyId: makeId("anomaly"),
      category: "compliance_exposure",
      severity: "critical",
      message: "At least one activation record is not compliant.",
    });
  }

  return flags;
}

export function deriveMerchantHealthState(
  anomalies: OversightAnomalyFlag[],
): MerchantHealthState {
  if (anomalies.some((x) => x.severity === "critical")) return "degraded";
  if (anomalies.some((x) => x.severity === "high")) return "elevated_risk";
  if (anomalies.some((x) => x.severity === "medium")) return "watch";
  return "healthy";
}

export function deriveRecommendedActions(
  anomalies: OversightAnomalyFlag[],
): string[] {
  const actions = new Set<string>();

  for (const anomaly of anomalies) {
    if (anomaly.category === "flow_swelling") {
      actions.add("Review protected-flow restoration plan and checkpoint drag.");
      actions.add("Inspect blocked or swollen release conditions.");
    }

    if (anomaly.category === "refund_exposure") {
      actions.add("Review refund trend and affected offers.");
    }

    if (anomaly.category === "dispute_exposure") {
      actions.add("Preserve dispute truth and review chargeback posture.");
    }

    if (anomaly.category === "compliance_exposure") {
      actions.add("Escalate compliance-sensitive activity for operator review.");
    }
  }

  if (actions.size === 0) {
    actions.add("Maintain monitoring and continue governed financial oversight.");
  }

  return Array.from(actions);
}