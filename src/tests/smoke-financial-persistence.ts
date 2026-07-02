export {};
import {
  processVerifiedOpportunity,
  sampleProcessorEvent,
  sampleVerifiedOpportunity,
} from "../lib/fundtracker";
import {
  appendActivatedTransactionStateJson,
  appendProcessorEventJson,
  appendTransactionIntentJson,
  appendVerificationDecisionJson,
  appendVerifiedOpportunityJson,
  getFundTrackerJsonArtifacts,
  resetFundTrackerJsonArtifacts,
} from "../lib/fundtracker/jsonStore";
import {
  appendOversightJson,
  getFinTechionJsonArtifacts,
  resetFinTechionJsonArtifacts,
} from "../lib/fintechion/jsonStore";
import { buildOversightState } from "../lib/fintechion";

resetFundTrackerJsonArtifacts();
resetFinTechionJsonArtifacts();

appendVerifiedOpportunityJson(sampleVerifiedOpportunity);
appendProcessorEventJson(sampleProcessorEvent);

const result = processVerifiedOpportunity(
  sampleVerifiedOpportunity,
  sampleProcessorEvent,
);

appendTransactionIntentJson(result.intent);
appendVerificationDecisionJson(result.decision);

if (result.activatedTransactionState) {
  appendActivatedTransactionStateJson(result.activatedTransactionState);

  const oversight = buildOversightState({
    period: "2026-04",
    transactions: [result.activatedTransactionState],
    refundExposure: 0,
    disputeExposure: 0,
  });

  appendOversightJson(oversight);
}

const ft = getFundTrackerJsonArtifacts();
const fi = getFinTechionJsonArtifacts();

console.log("PERSIST_FT_VERIFIED_OPPS=", ft.verifiedOpportunities.length);
console.log("PERSIST_FT_ACTIVATED=", ft.activatedTransactionStates.length);
console.log("PERSIST_FI_OVERSIGHT=", fi.length);

