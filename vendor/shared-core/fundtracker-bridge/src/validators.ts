import type {
  TrustWrappedSettlementResult,
} from "../../ecosystem-value/src/index.js";
import type {
  FundTrackerActivationPolicy,
} from "./contracts.js";

export function validateTrustedSettlementForFundTracker(input: {
  wrapped: TrustWrappedSettlementResult;
  policy: FundTrackerActivationPolicy;
}): { ok: boolean; reason: string } {
  if (!input.wrapped.trusted) {
    if (input.wrapped.decision === "REFUSED_TAMPERED") {
      return { ok: false, reason: "Settlement was refused as tampered." };
    }

    if (input.wrapped.decision === "REFUSED_QUARANTINED") {
      return { ok: false, reason: "Settlement was refused as quarantined." };
    }

    return { ok: false, reason: "Settlement is not trusted." };
  }

  if (input.wrapped.decision !== input.policy.requiredBridgeDecision) {
    return {
      ok: false,
      reason: `Bridge decision must be ${input.policy.requiredBridgeDecision}, received ${input.wrapped.decision}.`,
    };
  }

  if (input.wrapped.authorizationDecision !== input.policy.requiredAuthorizationDecision) {
    return {
      ok: false,
      reason: `Authorization decision must be ${input.policy.requiredAuthorizationDecision}, received ${input.wrapped.authorizationDecision}.`,
    };
  }

  const settlement = input.wrapped.settlementRecord;

  if (!settlement || typeof settlement !== "object") {
    return {
      ok: false,
      reason: "Trusted settlement result does not contain a settlement record.",
    };
  }

  if (settlement.complianceSnapshot.status !== input.policy.requiredComplianceStatus) {
    return {
      ok: false,
      reason: `Compliance status must be ${input.policy.requiredComplianceStatus}, received ${settlement.complianceSnapshot.status}.`,
    };
  }

  return {
    ok: true,
    reason: "Trusted settlement validated for FundTracker activation.",
  };
}