import type {
  AiopSessionState,
  VerifiedOpportunity,
} from "./aiopContracts";
import { createVerifiedOpportunity } from "./aiopPackaging";

export interface AiopSummaryPackage {
  packageId: string;
  sourceSessionId: string;
  currentStage: string;
  readinessState?: string;
  routingDecision?: string;
  pressureCategory?: string;
  urgency?: string;
  verifiedOpportunity?: VerifiedOpportunity;
  createdAt: string;
}

function makeAiopId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildAiopSummaryPackage(
  session: AiopSessionState,
): AiopSummaryPackage {
  const verifiedOpportunity =
    session.verifiedOpportunity ?? createVerifiedOpportunity(session);

  return {
    packageId: makeAiopId("aiop_package"),
    sourceSessionId: session.sessionId,
    currentStage: session.currentStage,
    readinessState: session.interpretation?.readinessState,
    routingDecision: session.interpretation?.routingDecision,
    pressureCategory: session.interpretation?.pressureCategory,
    urgency: session.interpretation?.urgency,
    verifiedOpportunity,
    createdAt: nowIso(),
  };
}