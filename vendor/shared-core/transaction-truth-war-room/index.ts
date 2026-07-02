import type { AuthorityCommandDecision } from "../authority-lattice-lock";

export type WarRoomRoute =
  | "CLEAR"
  | "WATCH"
  | "HOLD"
  | "ESCALATE"
  | "REFUSE";

export interface WarRoomInput {
  transactionRef: string;
  authorityDecisions: AuthorityCommandDecision[];
  tripwireRoute: "CLEAR" | "WATCH" | "MACHINE_HOLD" | "HUMAN_REVIEW" | "CRITICAL_ESCALATION" | "INSTANT_REFUSE";
  fraudPressureActive: boolean;
  proofHealthClean: boolean;
  launchMode: "DEV" | "DEMO" | "LAUNCH_REVIEW";
}

export interface WarRoomCommandDeck {
  deckId: string;
  transactionRef: string;
  route: WarRoomRoute;
  operatorSummary: string;
  actionItems: string[];
  blockedCommands: string[];
  allowedCommands: string[];
  boundary: {
    warRoomIsNotPaymentAuthority: true;
    warRoomIsNotTransactionTruth: true;
    warRoomIsNotCustodyTransfer: true;
    warRoomIsNotRuntimeActivation: true;
    operatorVisibilityIsNotAuthority: true;
  };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function buildTransactionTruthWarRoomDeck(input: WarRoomInput): WarRoomCommandDeck {
  const blocked = input.authorityDecisions
    .filter((decision) => !decision.allowed)
    .map((decision) => `${decision.actor}:${decision.command}`);

  const allowed = input.authorityDecisions
    .filter((decision) => decision.allowed)
    .map((decision) => `${decision.actor}:${decision.command}`);

  const actionItems: string[] = [];

  if (blocked.length > 0) actionItems.push("Review refused authority commands.");
  if (input.tripwireRoute === "MACHINE_HOLD") actionItems.push("Inspect correlated multi-seam pre-breach pressure.");
  if (input.tripwireRoute === "CRITICAL_ESCALATION") actionItems.push("Escalate authority-attack class pressure.");
  if (input.tripwireRoute === "INSTANT_REFUSE") actionItems.push("Preserve synthetic authority evidence.");
  if (input.fraudPressureActive) actionItems.push("Review active fraud pressure.");
  if (!input.proofHealthClean) actionItems.push("Repair or reverify proof health before consequence.");

  let route: WarRoomRoute = "CLEAR";

  if (input.tripwireRoute === "INSTANT_REFUSE" || blocked.some((item) => item.includes("CREATE_PAYMENT_AUTHORITY"))) {
    route = "REFUSE";
  } else if (input.tripwireRoute === "CRITICAL_ESCALATION") {
    route = "ESCALATE";
  } else if (input.tripwireRoute === "MACHINE_HOLD" || input.fraudPressureActive || !input.proofHealthClean) {
    route = "HOLD";
  } else if (input.tripwireRoute === "WATCH" || blocked.length > 0) {
    route = "WATCH";
  }

  return {
    deckId: `war_room_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    route,
    operatorSummary:
      "Transaction Truth War Room summarizes command pressure, tripwire pressure, proof health, and operator actions without becoming authority.",
    actionItems: unique(actionItems),
    blockedCommands: unique(blocked),
    allowedCommands: unique(allowed),
    boundary: {
      warRoomIsNotPaymentAuthority: true,
      warRoomIsNotTransactionTruth: true,
      warRoomIsNotCustodyTransfer: true,
      warRoomIsNotRuntimeActivation: true,
      operatorVisibilityIsNotAuthority: true
    }
  };
}

export const TRANSACTION_TRUTH_WAR_ROOM_DOCTRINE = {
  name: "Transaction Truth War Room",
  class: "OPERATOR_READABLE_COMMAND_INTELLIGENCE_LAYER",
  purpose:
    "Convert fraud pressure, tripwire pressure, authority refusals, and proof health into operator-readable intelligence without becoming authority.",
  boundary: {
    visibilityIsNotAuthority: true,
    dashboardIsNotTruth: true,
    operatorSummaryIsNotConsequence: true
  }
} as const;
