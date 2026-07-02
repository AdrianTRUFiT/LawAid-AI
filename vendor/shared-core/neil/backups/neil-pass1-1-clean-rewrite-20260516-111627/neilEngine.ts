import type {
  NeilNegotiationContext,
  NeilNegotiationPacket,
  NeilNegotiationStatus,
  NeilStrategyMove
} from "./neilContracts.js";
import { createPrimetimeProtocol } from "./neilPrimetime.js";

function hasCoreContext(context: NeilNegotiationContext): boolean {
  return Boolean(
    context.contextId &&
    context.createdAt &&
    context.counterpart &&
    context.objective &&
    context.requestedOutcome &&
    context.knownFacts.length > 0
  );
}

function buildStrategyMoves(context: NeilNegotiationContext): NeilStrategyMove[] {
  const moves: NeilStrategyMove[] = [];

  if (context.pressureLevel === "HIGH" || context.pressureLevel === "HOSTILE") {
    moves.push("STRATEGIC_SILENCE");
    moves.push("REFRAME_PRESSURE");
    moves.push("REQUEST_PROOF");
  }

  if (context.constraints.length > 0) {
    moves.push("COUNTER_WITH_CONDITIONS");
  }

  if (context.matterType === "LAWAI_NEGOTIATION") {
    moves.push("CLARIFY_AUTHORITY");
    moves.push("DELAY_UNTIL_DOCUMENTED");
  }

  moves.push("HUMAN_REVIEW_ONLY");

  return Array.from(new Set(moves));
}

function buildResponseDraft(context: NeilNegotiationContext, moves: NeilStrategyMove[]): string {
  const lines: string[] = [];

  lines.push("I am reviewing the documented facts and will respond only through a verified, bounded path.");

  if (moves.includes("REQUEST_PROOF")) {
    lines.push("Please provide the specific documentation supporting the requested position.");
  }

  if (moves.includes("CLARIFY_AUTHORITY")) {
    lines.push("This response does not waive rights, concede authority, or create legal advice.");
  }

  if (moves.includes("COUNTER_WITH_CONDITIONS")) {
    lines.push("Any next step must remain conditioned on documented authority, clear scope, and human review.");
  }

  if (moves.includes("REFRAME_PRESSURE")) {
    lines.push("I will not react to pressure. I will respond to verified substance.");
  }

  lines.push("No final action is authorized without human approval.");

  return lines.join(" ");
}

export function generateNeilNegotiationPacket(context: NeilNegotiationContext): NeilNegotiationPacket {
  const refusalReasons: string[] = [];
  const conditions: string[] = [];
  const primetimeMode = createPrimetimeProtocol(context.primetimeTriggerPhrase);

  if (context.externalApiUsed) refusalReasons.push("External APIs are not allowed in NEIL Pass 1.");
  if (context.liveNegotiationRequested) refusalReasons.push("Live negotiation execution is not allowed in NEIL Pass 1.");
  if (context.paymentRequested) refusalReasons.push("Payment movement is not allowed in NEIL Pass 1.");
  if (context.signatureRequested) refusalReasons.push("Signature execution is not allowed in NEIL Pass 1.");
  if (context.legalAuthorityClaimed) refusalReasons.push("Legal authority claims are not allowed in NEIL Pass 1.");

  if (!hasCoreContext(context)) {
    conditions.push("Complete negotiation context before review.");
  }

  if (context.armanisReference) {
    conditions.push(...context.armanisReference.conditions);

    if (context.armanisReference.status === "REFUSED") {
      conditions.push("ARMANIS reference is refused; negotiation must not advance.");
    }
  }

  const moves = buildStrategyMoves(context);
  const safetyReview = buildNeilSafetyReview({
    pressureLevel: context.pressureLevel,
    primetimeActive: primetimeMode.modeState === "ACTIVE",
    strategyMoves: safetyReview.normalizedMoves,
    legalAuthorityClaimed: context.legalAuthorityClaimed,
    liveNegotiationRequested: context.liveNegotiationRequested,
    externalApiUsed: context.externalApiUsed,
    paymentRequested: context.paymentRequested,
    signatureRequested: context.signatureRequested
  });

  const status: NeilNegotiationStatus =
    refusalReasons.length > 0
      ? "REFUSED_BOUNDARY"
      : conditions.includes("Complete negotiation context before review.")
        ? "HOLD_FOR_CONTEXT"
        : context.pressureLevel === "HOSTILE"
          ? "ESCALATE_TO_HUMAN"
          : primetimeMode.modeState === "ACTIVE"
            ? "PRIMETIME_ACTIVE"
            : "READY_FOR_HUMAN_REVIEW";

  return Object.freeze({
    packetId: `neil_packet_${context.contextId}`,
    createdAt: new Date().toISOString(),
    contextId: context.contextId,
    status,
    matterType: context.matterType,
    counterpart: context.counterpart,
    objective: context.objective,
    primetimeMode,
    strategyMoves: safetyReview.normalizedMoves,
    conditions: Array.from(new Set(conditions)),
    refusalReasons,
    responseDraft: buildResponseDraft(context, moves),
    armanisStatus: context.armanisReference?.status ?? null,
    armanisCertificationLevel: context.armanisReference?.certificationLevel ?? null,
    armanisCompatibilityScore: context.armanisReference?.compatibilityScore ?? null,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: "",
    noLiveNegotiation: true,
    noPayments: true,
    noSignature: true,
    noExternalApis: true,
    noLegalAuthority: true
  });
}