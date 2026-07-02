import {
  AiopSessionState,
  VerifiedOpportunity
} from "./aiopContracts";
import { interpretAiopSession } from "./aiopInterpreter";

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

export function createVerifiedOpportunity(state: AiopSessionState): VerifiedOpportunity {
  const interpretation = state.interpretation ?? interpretAiopSession(state);
  const name = String(state.responses["name"]?.value ?? "").trim();
  const email = String(state.responses["email"]?.value ?? "").trim();
  const notes = String(state.responses["notes"]?.value ?? "").trim();

  return {
    opportunityId: makeId("opp"),
    sessionId: state.sessionId,
    createdAt: new Date().toISOString(),
    capturedSignalId: state.capturedSignal.signalId,
    identity: {
      name: name || undefined,
      email: email || undefined
    },
    context: {
      pressureCategory: interpretation.pressureCategory,
      primaryConcern: interpretation.insight.pressureCenter,
      notes: notes || undefined
    },
    posture: interpretation.posture,
    urgency: interpretation.urgency,
    riskSignals: interpretation.riskSignals,
    preferences: interpretation.preferences,
    routingDecision: interpretation.routingDecision,
    readinessState: interpretation.readinessState,
    paymentReadiness: interpretation.paymentReadiness,
    connections: {
      source: state.capturedSignal.source,
      signalCategory: state.capturedSignal.signalCategory
    },
    initializationHints: interpretation.initializationHints
  };
}
