import { IdentityUsageInput, IdentityUsageResult } from './aiTrackContracts';

export function evaluateIdentityUsage(input: IdentityUsageInput): IdentityUsageResult {
  if (!input.identityId || !input.assetId || !input.usageId) {
    return {
      decision: "REFUSED",
      reason: "IDENTITY_ASSET_USAGE_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (input.zoneType === "FREE_EXPRESSIVE_ZONE") {
    return {
      decision: "APPROVED",
      reason: "FREE_EXPRESSION_ALLOWED_NO_CONSEQUENCE",
      traceRequired: false,
      consequenceAllowed: false
    };
  }

  if (input.zoneType === "COMMONS_ZONE") {
    if (!input.attributionPresent) {
      return {
        decision: "HELD",
        reason: "COMMONS_ATTRIBUTION_REQUIRED",
        traceRequired: true,
        consequenceAllowed: false
      };
    }

    return {
      decision: "ROUTED",
      reason: "COMMONS_USE_ROUTED_WITH_ATTRIBUTION",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.consent) {
    return {
      decision: "REFUSED",
      reason: "CONSENT_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.scopeMatched) {
    return {
      decision: "HELD",
      reason: "USAGE_SCOPE_MISMATCH",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.attributionPresent) {
    return {
      decision: "HELD",
      reason: "ATTRIBUTION_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.valueRoutingPresent) {
    return {
      decision: "HELD",
      reason: "VALUE_ROUTING_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.presenceSignal) {
    return {
      decision: "ESCALATED",
      reason: "PRESENCE_RIGHTS_REVIEW_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  if (!input.contributionLayers.includes("TRACE")) {
    return {
      decision: "HELD",
      reason: "CONTRIBUTION_TRACE_REQUIRED",
      traceRequired: true,
      consequenceAllowed: false
    };
  }

  return {
    decision: "APPROVED",
    reason: "IDENTITY_USAGE_AUTHORIZED",
    traceRequired: true,
    consequenceAllowed: true
  };
}
