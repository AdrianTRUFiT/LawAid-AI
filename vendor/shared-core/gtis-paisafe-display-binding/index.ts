export type PaiSafeDisplayStatus =
  | "display_not_started"
  | "display_pending"
  | "display_governed_safe"
  | "display_held"
  | "display_refused"
  | "display_activated"
  | "display_requires_attention";

export type GovernedStateSource =
  | "FUNDTRACKER_REVERIFICATION_REQUEST"
  | "ATS_ARTIFACT_GATE"
  | "MEMORY_BOUNDARY"
  | "TRIPWIRE_MESH"
  | "CONSEQUENCE_INTELLIGENCE";

export type DisplayBindingRefusalCode =
  | "SOURCE_REF_REQUIRED"
  | "FUNDTRACKER_DECISION_REF_REQUIRED"
  | "DISPLAY_CANNOT_CREATE_AUTHORITY"
  | "RAW_SOURCE_DATA_REFUSED"
  | "INTERNAL_SCORE_EXPOSURE_REFUSED"
  | "AUDIT_INTERNALS_EXPOSURE_REFUSED";

export interface TransactionAuthorityState {
  readonly __brand: "TRANSACTION_AUTHORITY_STATE";
  transactionRef: string;
  authoritySource: "FundTrackerAI";
  activatedTransactionStateRef: string;
}

export interface PaiSafeDisplayState {
  readonly __brand: "PAI_SAFE_DISPLAY_STATE";
  bindingId: string;
  transactionRef: string;
  status: PaiSafeDisplayStatus;
  consumerMessage: string;
  safeToDisplay: boolean;
  safeToProceed: boolean;
  downstreamActivationEligible: boolean;
  proofReference: string;
  sourceRefs: {
    fundTrackerDecisionRef?: string;
    activatedTransactionStateRef?: string;
    governedStateSource: GovernedStateSource;
  };
  prohibitedExposure: {
    rawProcessorObjectExposed: false;
    internalScoringWeightsExposed: false;
    custodyClassDetailsExposed: false;
    auditInternalsExposed: false;
  };
  refusalReasons: DisplayBindingRefusalCode[];
  boundary: {
    paiSafeIsDisplayOnly: true;
    displayIsNotAuthority: true;
    displayCannotBecomeTransactionTruth: true;
    paiSafeDoesNotCreatePaymentAuthority: true;
    paiSafeDoesNotCreateRuntimeActivation: true;
    fundTrackerAIRemainsTransactionTruth: true;
  };
}

export interface PaiSafeDisplayBindingInput {
  transactionRef: string;
  sourceRef?: string;
  fundTrackerDecisionRef?: string;
  activatedTransactionStateRef?: string;
  governedStateSource: GovernedStateSource;
  requestedStatus: PaiSafeDisplayStatus;
  rawProcessorObjectPresent: boolean;
  internalScoringWeightsPresent: boolean;
  custodyClassDetailsPresent: boolean;
  auditInternalsPresent: boolean;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildPaiSafeDisplayBinding(input: PaiSafeDisplayBindingInput): PaiSafeDisplayState {
  const refusalReasons: DisplayBindingRefusalCode[] = [];

  if (!hasText(input.sourceRef)) refusalReasons.push("SOURCE_REF_REQUIRED");
  if (!hasText(input.fundTrackerDecisionRef)) refusalReasons.push("FUNDTRACKER_DECISION_REF_REQUIRED");
  if (input.rawProcessorObjectPresent) refusalReasons.push("RAW_SOURCE_DATA_REFUSED");
  if (input.internalScoringWeightsPresent) refusalReasons.push("INTERNAL_SCORE_EXPOSURE_REFUSED");
  if (input.auditInternalsPresent) refusalReasons.push("AUDIT_INTERNALS_EXPOSURE_REFUSED");

  const blocked = refusalReasons.length > 0;

  const status: PaiSafeDisplayStatus = blocked
    ? "display_requires_attention"
    : input.requestedStatus;

  return {
    __brand: "PAI_SAFE_DISPLAY_STATE",
    bindingId: `pai_safe_display_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    status,
    consumerMessage: blocked
      ? "PAI-SAFE cannot display governed confidence until source references and exposure boundaries are clean."
      : input.requestedStatus === "display_activated"
        ? "PAI-SAFE display: FundTrackerAI-sourced activation state has been verified for display."
        : input.requestedStatus === "display_governed_safe"
          ? "PAI-SAFE display: transaction is governed and ready for FundTrackerAI-sourced next step."
          : input.requestedStatus === "display_held"
            ? "PAI-SAFE display: transaction is held for governed review."
            : input.requestedStatus === "display_refused"
              ? "PAI-SAFE display: transaction did not pass governed verification."
              : "PAI-SAFE display: governed transaction state is pending.",
    safeToDisplay: true,
    safeToProceed: !blocked && (input.requestedStatus === "display_governed_safe" || input.requestedStatus === "display_activated"),
    downstreamActivationEligible: !blocked && input.requestedStatus === "display_activated" && hasText(input.activatedTransactionStateRef),
    proofReference: input.sourceRef ?? "SOURCE_REF_MISSING",
    sourceRefs: {
      ...(input.fundTrackerDecisionRef ? { fundTrackerDecisionRef: input.fundTrackerDecisionRef } : {}),
      ...(input.activatedTransactionStateRef ? { activatedTransactionStateRef: input.activatedTransactionStateRef } : {}),
      governedStateSource: input.governedStateSource
    },
    prohibitedExposure: {
      rawProcessorObjectExposed: false,
      internalScoringWeightsExposed: false,
      custodyClassDetailsExposed: false,
      auditInternalsExposed: false
    },
    refusalReasons: unique(refusalReasons),
    boundary: {
      paiSafeIsDisplayOnly: true,
      displayIsNotAuthority: true,
      displayCannotBecomeTransactionTruth: true,
      paiSafeDoesNotCreatePaymentAuthority: true,
      paiSafeDoesNotCreateRuntimeActivation: true,
      fundTrackerAIRemainsTransactionTruth: true
    }
  };
}

export const GTIS_PAI_SAFE_DISPLAY_BINDING_DOCTRINE = {
  name: "GTIS-to-PAI-SAFE Display Binding",
  class: "CONSUMER_SAFE_DISPLAY_PROJECTION_LAYER",
  purpose:
    "Project governed GTIS/FundTrackerAI-sourced state to PAI-SAFE without allowing display state to become authority.",
  boundary: {
    displayIsNotAuthority: true,
    paiSafeDoesNotCreateTruth: true,
    rawSourceNeverDisplayed: true,
    fundTrackerAIRemainsTransactionTruth: true
  }
} as const;
