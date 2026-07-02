export {};
import { buildOversightEnforcementState } from "../lib/fintechion";
import type { GovernedFinancialOversightState } from "../lib/fintechion/types";

const oversight: GovernedFinancialOversightState = {
  oversightStateId: "ofs_lucky7_001",
  period: "2026-04",
  sourceSystems: ["FundTrackerAI"],
  grossRevenue: 1000,
  netRevenue: 700,
  feeExposure: 300,
  refundExposure: 1200,
  disputeExposure: 800,
  anomalyFlags: [
    {
      code: "REFUND_EXPOSURE",
      message: "Refund exposure is high.",
      severity: "high",
    },
    {
      code: "DISPUTE_EXPOSURE",
      message: "Dispute exposure is high.",
      severity: "high",
    },
  ],
  complianceFlags: [],
  merchantHealthState: "at-risk",
  recommendedActions: ["Review account", "Restrict processing"],
  generatedAt: new Date().toISOString(),
};

const enforcement = buildOversightEnforcementState(oversight);

console.log("ENFORCEMENT_ACTION=", enforcement.action);
console.log("ENFORCEMENT_REASON=", enforcement.reason);

