import type { NeilPressureLevel, NeilStrategyMove } from "./neilContracts.js";

export type NeilSafetyFlag =
  | "LEGAL_AUTHORITY_REFUSED"
  | "LIVE_NEGOTIATION_REFUSED"
  | "PAYMENT_REFUSED"
  | "SIGNATURE_REFUSED"
  | "EXTERNAL_API_REFUSED"
  | "HOSTILE_PRESSURE_ESCALATION"
  | "HUMAN_REVIEW_REQUIRED";

export interface NeilSafetyReview {
  safetyFlags: NeilSafetyFlag[];
  normalizedMoves: NeilStrategyMove[];
  pressurePosture: "STANDARD" | "CONTROLLED" | "PRIMETIME" | "ESCALATE";
  responseCompression: "NORMAL" | "COMPRESSED";
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export function normalizeStrategyMoves(moves: NeilStrategyMove[]): NeilStrategyMove[] {
  const priority: NeilStrategyMove[] = [
    "STRATEGIC_SILENCE",
    "REQUEST_PROOF",
    "CLARIFY_AUTHORITY",
    "REFRAME_PRESSURE",
    "COUNTER_WITH_CONDITIONS",
    "DELAY_UNTIL_DOCUMENTED",
    "HUMAN_REVIEW_ONLY"
  ];

  const unique = Array.from(new Set(moves));
  return priority.filter((move) => unique.includes(move));
}

export function derivePressurePosture(
  pressureLevel: NeilPressureLevel,
  primetimeActive: boolean
): NeilSafetyReview["pressurePosture"] {
  if (pressureLevel === "HOSTILE") return "ESCALATE";
  if (primetimeActive) return "PRIMETIME";
  if (pressureLevel === "HIGH") return "CONTROLLED";
  return "STANDARD";
}

export function buildNeilSafetyReview(input: {
  pressureLevel: NeilPressureLevel;
  primetimeActive: boolean;
  strategyMoves: NeilStrategyMove[];
  legalAuthorityClaimed: boolean;
  liveNegotiationRequested: boolean;
  externalApiUsed: boolean;
  paymentRequested: boolean;
  signatureRequested: boolean;
}): NeilSafetyReview {
  const safetyFlags: NeilSafetyFlag[] = [];

  if (input.legalAuthorityClaimed) safetyFlags.push("LEGAL_AUTHORITY_REFUSED");
  if (input.liveNegotiationRequested) safetyFlags.push("LIVE_NEGOTIATION_REFUSED");
  if (input.externalApiUsed) safetyFlags.push("EXTERNAL_API_REFUSED");
  if (input.paymentRequested) safetyFlags.push("PAYMENT_REFUSED");
  if (input.signatureRequested) safetyFlags.push("SIGNATURE_REFUSED");
  if (input.pressureLevel === "HOSTILE") safetyFlags.push("HOSTILE_PRESSURE_ESCALATION");

  safetyFlags.push("HUMAN_REVIEW_REQUIRED");

  return Object.freeze({
    safetyFlags: Array.from(new Set(safetyFlags)),
    normalizedMoves: normalizeStrategyMoves(input.strategyMoves),
    pressurePosture: derivePressurePosture(input.pressureLevel, input.primetimeActive),
    responseCompression: input.primetimeActive || input.pressureLevel === "HIGH" || input.pressureLevel === "HOSTILE"
      ? "COMPRESSED"
      : "NORMAL",
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  });
}