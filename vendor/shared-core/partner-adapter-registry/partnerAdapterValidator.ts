import {
  PartnerAdapterDefinition,
  PartnerAdapterValidationResult
} from "./partnerAdapterContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validatePartnerAdapter(
  adapter: PartnerAdapterDefinition
): PartnerAdapterValidationResult {
  const blockedReasons: string[] = [];

  if (!adapter.partnerName) blockedReasons.push("PARTNER_NAME_REQUIRED");
  if (!adapter.adapterName) blockedReasons.push("ADAPTER_NAME_REQUIRED");
  if (!adapter.summary) blockedReasons.push("ADAPTER_SUMMARY_REQUIRED");
  if (adapter.relatedModules.length === 0) blockedReasons.push("RELATED_MODULE_REQUIRED");
  if (adapter.connectionModes.length === 0) blockedReasons.push("CONNECTION_MODE_REQUIRED");
  if (adapter.capabilities.length === 0) blockedReasons.push("CAPABILITY_REQUIRED");
  if (adapter.permissions.length === 0) blockedReasons.push("PERMISSION_BOUNDARY_REQUIRED");
  if (adapter.constraints.length === 0) blockedReasons.push("CONSTRAINTS_REQUIRED");

  const connectionModeSet = new Set(adapter.connectionModes);

  for (const capability of adapter.capabilities) {
    if (!capability.capabilityId) blockedReasons.push("CAPABILITY_ID_REQUIRED");
    if (!capability.label) blockedReasons.push("CAPABILITY_LABEL_REQUIRED");
    if (!capability.description) blockedReasons.push("CAPABILITY_DESCRIPTION_REQUIRED");
    if (!connectionModeSet.has(capability.connectionMode)) blockedReasons.push("CAPABILITY_CONNECTION_MODE_NOT_DECLARED");
    if (capability.requiresWebhookSecret && capability.connectionMode !== "webhook" && capability.connectionMode !== "hybrid") {
      blockedReasons.push("WEBHOOK_SECRET_REQUIRES_WEBHOOK_OR_HYBRID_MODE");
    }
  }

  if (adapter.status === "RETIRED") blockedReasons.push("RETIRED_ADAPTER_NOT_VALID_FOR_REVIEW");
  if (adapter.status === "SUPERSEDED") blockedReasons.push("SUPERSEDED_ADAPTER_NOT_VALID_FOR_REVIEW");

  const valid = blockedReasons.length === 0;

  return {
    validationId: id("partner-adapter-validation"),
    partnerAdapterId: adapter.partnerAdapterId,
    checkedAt: new Date().toISOString(),
    valid,
    blockedReasons: Array.from(new Set(blockedReasons)),
    nextAllowedStatus: valid ? "READY_FOR_REVIEW" : "REVIEW_HELD",
    authorityBoundary: {
      ...adapter.authorityBoundary,
      validationIsNotApproval: true,
      validationIsNotConnection: true
    }
  };
}
