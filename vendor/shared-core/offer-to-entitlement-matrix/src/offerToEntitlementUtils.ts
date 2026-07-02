import type { OfferCode, OfferTerm } from "./offerToEntitlementTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeEntitlementPackageId(subjectId: string, offerCode: OfferCode, offerTerm: OfferTerm): string {
  return `entitlement_package_${subjectId}_${offerCode}_${offerTerm}`;
}

export function isOfferCode(value: string): value is OfferCode {
  return ["TRIAL_CORE", "PAID_CORE", "MODULE_ADDON"].includes(value);
}

export function isOfferTerm(value: string): value is OfferTerm {
  return ["trial_14d", "monthly", "annual"].includes(value);
}