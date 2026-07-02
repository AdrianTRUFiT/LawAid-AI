import { toFinTechionAnomaly } from "../lib/fintechion/fintechionBridge";
import { FundTrackerVerificationRuntime } from "../lib/fundtracker/fundTrackerVerificationRuntime";
import { GTISArtifactStore } from "../lib/gtis/gtisArtifactStore";
import type { ActorId, CorrelationId, CurrencyCode } from "../lib/gtis/gtisContracts";

const store = new GTISArtifactStore();
const runtime = new FundTrackerVerificationRuntime(store);

const correlationId = "cor_demo_01" as CorrelationId;
const actorId = "actor_demo_01" as ActorId;
const currency = "USD" as CurrencyCode;

const obligation = runtime.createObligation({
  correlationId,
  actorId,
  merchantId: "merchant_alpha",
  amountMinor: 125000,
  currency,
  destinationRef: "dest_operating_primary",
  expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  purpose: "governed_commercial_passage",
  policyVersion: "GTIS-POLICY-V1",
});

const instruction = runtime.mintInstruction(obligation);

const submission = runtime.receiveSubmission(instruction, {
  processorEventId: "stripe_evt_123",
  amountMinor: 125000,
  currency,
  destinationRef: "dest_operating_primary",
  idempotencyKey: "idem_123",
  processorStatus: "charge_succeeded",
});

const verification = runtime.verify(obligation, instruction, submission);
const result = runtime.conclude(obligation, instruction, submission, verification);
const activation = runtime.assertConsequenceAuthorized(correlationId);

console.log("FINAL_ARTIFACT_TYPE=", result.finalArtifact.type);
console.log("EVIDENCE_ARTIFACT_ID=", result.evidenceArtifactId);
console.log("ACTIVATION_REASON=", activation.payload.activationReason);
console.log("ARTIFACT_COUNT=", store.getArtifactsByCorrelation(correlationId).length);
console.log("METRICS=", JSON.stringify(store.getMetrics(), null, 2));

if (
  result.finalArtifact.type === "RefusalArtifact" ||
  result.finalArtifact.type === "HumanReviewRequestedArtifact"
) {
  const anomaly = toFinTechionAnomaly(result.finalArtifact);
  console.log("ANOMALY=", JSON.stringify(anomaly, null, 2));
}
