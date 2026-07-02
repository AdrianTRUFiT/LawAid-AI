export type AuthorityActor =
  | "FUNDTRACKER_AI"
  | "PAI_SAFE"
  | "FINTECHION_AI"
  | "SOULREGISTRY"
  | "HUMAN_REVIEW"
  | "CONSEQUENCE_INTELLIGENCE"
  | "PREDICTIVE_FIREWALL"
  | "TRIPWIRE_MESH"
  | "UNKNOWN_ACTOR";

export type AuthorityCommand =
  | "DISPLAY_STATUS"
  | "MONITOR_OVERSIGHT"
  | "VERIFY_COMMITMENT"
  | "CREATE_TRANSACTION_TRUTH"
  | "CREATE_ACTIVATED_TRANSACTION_STATE"
  | "AUTHORIZE_CONSEQUENCE"
  | "CREATE_PAYMENT_AUTHORITY"
  | "TRANSFER_CUSTODY"
  | "OVERRIDE_FUNDTRACKER"
  | "PROMOTE_SURFACE_TO_TRUTH";

export type AuthorityDecisionStatus =
  | "AUTHORITY_COMMAND_ALLOWED"
  | "AUTHORITY_COMMAND_REFUSED";

export type AuthorityRefusalCode =
  | "UNKNOWN_ACTOR_REFUSED"
  | "SURFACE_TO_TRUTH_PROMOTION_REFUSED"
  | "NON_FUNDTRACKER_TRUTH_COMMAND_REFUSED"
  | "PAYMENT_AUTHORITY_CREATION_REFUSED"
  | "CUSTODY_TRANSFER_REFUSED"
  | "FUNDTRACKER_OVERRIDE_REFUSED"
  | "ACTIVATION_WITHOUT_FUNDTRACKER_REFUSED"
  | "DISPLAY_ONLY_BOUNDARY_ENFORCED"
  | "OVERSIGHT_ONLY_BOUNDARY_ENFORCED";

export interface AuthorityCommandInput {
  commandId: string;
  actor: AuthorityActor;
  command: AuthorityCommand;
  transactionRef: string;
  sourceRef: string;
  requiredArtifacts: string[];
}

export interface AuthorityCommandDecision {
  status: AuthorityDecisionStatus;
  commandId: string;
  actor: AuthorityActor;
  command: AuthorityCommand;
  allowed: boolean;
  refusalReasons: AuthorityRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    authorityLatticeIsNotPaymentAuthority: true;
    authorityLatticeIsNotTransactionTruth: true;
    authorityLatticeIsNotCustodyTransfer: true;
    authorityLatticeIsNotRuntimeActivation: true;
    fundTrackerAIRemainsTransactionTruth: true;
    paiSafeRemainsDisplayOnly: true;
    finTechionAIRemainsOversightOnly: true;
  };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasArtifact(input: AuthorityCommandInput, artifact: string): boolean {
  return input.requiredArtifacts.includes(artifact);
}

export function evaluateAuthorityCommand(input: AuthorityCommandInput): AuthorityCommandDecision {
  const refusalReasons: AuthorityRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (input.actor === "UNKNOWN_ACTOR") {
    refusalReasons.push("UNKNOWN_ACTOR_REFUSED");
    requiredCorrections.push("Bind command to a known bounded actor.");
  }

  if (input.command === "CREATE_PAYMENT_AUTHORITY") {
    refusalReasons.push("PAYMENT_AUTHORITY_CREATION_REFUSED");
    requiredCorrections.push("No shared-core actor may create payment authority.");
  }

  if (input.command === "TRANSFER_CUSTODY") {
    refusalReasons.push("CUSTODY_TRANSFER_REFUSED");
    requiredCorrections.push("Custody transfer requires separate custody authority and cannot occur here.");
  }

  if (input.command === "OVERRIDE_FUNDTRACKER") {
    refusalReasons.push("FUNDTRACKER_OVERRIDE_REFUSED");
    requiredCorrections.push("FundTrackerAI cannot be overridden by another surface or oversight actor.");
  }

  if (input.command === "PROMOTE_SURFACE_TO_TRUTH") {
    refusalReasons.push("SURFACE_TO_TRUTH_PROMOTION_REFUSED");
    requiredCorrections.push("Display, receipt, forecast, review, and oversight are not truth.");
  }

  if (
    (input.command === "CREATE_TRANSACTION_TRUTH" ||
      input.command === "VERIFY_COMMITMENT" ||
      input.command === "CREATE_ACTIVATED_TRANSACTION_STATE" ||
      input.command === "AUTHORIZE_CONSEQUENCE") &&
    input.actor !== "FUNDTRACKER_AI"
  ) {
    refusalReasons.push("NON_FUNDTRACKER_TRUTH_COMMAND_REFUSED");
    requiredCorrections.push("Only FundTrackerAI may govern transaction truth commands.");
  }

  if (
    input.command === "CREATE_ACTIVATED_TRANSACTION_STATE" &&
    (!hasArtifact(input, "FundTrackerDecision") || !hasArtifact(input, "VerifiedOpportunity"))
  ) {
    refusalReasons.push("ACTIVATION_WITHOUT_FUNDTRACKER_REFUSED");
    requiredCorrections.push("Activated Transaction State requires FundTrackerAI decision and Verified Opportunity.");
  }

  if (input.actor === "PAI_SAFE" && input.command !== "DISPLAY_STATUS") {
    refusalReasons.push("DISPLAY_ONLY_BOUNDARY_ENFORCED");
    requiredCorrections.push("PAI-SAFE may display governed status only.");
  }

  if (input.actor === "FINTECHION_AI" && input.command !== "MONITOR_OVERSIGHT") {
    refusalReasons.push("OVERSIGHT_ONLY_BOUNDARY_ENFORCED");
    requiredCorrections.push("FinTechionAI may monitor and interpret only.");
  }

  const allowed = refusalReasons.length === 0;

  return {
    status: allowed ? "AUTHORITY_COMMAND_ALLOWED" : "AUTHORITY_COMMAND_REFUSED",
    commandId: input.commandId,
    actor: input.actor,
    command: input.command,
    allowed,
    refusalReasons: unique(refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    boundary: {
      authorityLatticeIsNotPaymentAuthority: true,
      authorityLatticeIsNotTransactionTruth: true,
      authorityLatticeIsNotCustodyTransfer: true,
      authorityLatticeIsNotRuntimeActivation: true,
      fundTrackerAIRemainsTransactionTruth: true,
      paiSafeRemainsDisplayOnly: true,
      finTechionAIRemainsOversightOnly: true
    }
  };
}

export const AUTHORITY_LATTICE_LOCK_DOCTRINE = {
  name: "Authority Lattice Lock",
  class: "CROSS_SYSTEM_COMMAND_REFUSAL_GRID",
  purpose:
    "Prevent any surface, forecast, receipt, review artifact, oversight actor, or model output from promoting itself into transaction authority.",
  boundary: {
    noSurfaceToTruthPromotion: true,
    noOversightToCommandPromotion: true,
    noForecastToEvidencePromotion: true,
    fundTrackerAIRemainsTransactionTruth: true
  }
} as const;
