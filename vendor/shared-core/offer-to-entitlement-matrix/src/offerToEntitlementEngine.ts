import type {
  EntitlementPackageArtifact,
  OfferToEntitlementInput,
  OfferToEntitlementResult,
} from "./offerToEntitlementTypes.js";
import {
  isOfferCode,
  isOfferTerm,
  makeEntitlementPackageId,
  nowIso,
} from "./offerToEntitlementUtils.js";

export function runOfferToEntitlementMatrix(
  input: OfferToEntitlementInput,
): OfferToEntitlementResult {
  if (!isOfferCode(input.offerCode)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_OFFER",
        refusalReason: `Offer-to-entitlement mapping refused because offer '${input.offerCode}' is not defined.`,
      },
    };
  }

  if (!isOfferTerm(input.offerTerm)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_TERM",
        refusalReason: `Offer-to-entitlement mapping refused because term '${input.offerTerm}' is invalid.`,
      },
    };
  }

  let rights: string[];
  let durationDays: number;
  let downgradeRule: string;
  let closureRule: string;
  let archiveExportRule: string;
  let reentryRule: string;

  switch (input.offerCode) {
    case "TRIAL_CORE":
      rights = ["core_dashboard", "continuity_view", "limited_support"];
      durationDays = 14;
      downgradeRule = "trial_to_limited_or_expired";
      closureRule = "trial_closes_without_paid_extension";
      archiveExportRule = "summary_export_only";
      reentryRule = "paid_conversion_or_reactivation_offer";
      break;

    case "PAID_CORE":
      rights = ["core_dashboard", "continuity_view", "full_support", "active_modules"];
      durationDays = input.offerTerm === "annual" ? 365 : 30;
      downgradeRule = "grace_then_past_due_then_downgrade";
      closureRule = "paid_closure_preserves_return_path";
      archiveExportRule = "archive_and_export_available";
      reentryRule = "reactivation_allowed_with_continuity";
      break;

    case "MODULE_ADDON":
      rights = ["addon_module_access"];
      durationDays = input.offerTerm === "annual" ? 365 : 30;
      downgradeRule = "addon_removed_on_nonrenewal";
      closureRule = "addon_closure_does_not_destroy_core_continuity";
      archiveExportRule = "module_scope_export_only";
      reentryRule = "addon_repurchase_allowed";
      break;
  }

  const artifact: EntitlementPackageArtifact = {
    entitlementPackageId: makeEntitlementPackageId(input.subjectId, input.offerCode, input.offerTerm),
    subjectId: input.subjectId,
    offerCode: input.offerCode,
    offerTerm: input.offerTerm,
    rights,
    durationDays,
    downgradeRule,
    closureRule,
    archiveExportRule,
    reentryRule,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}