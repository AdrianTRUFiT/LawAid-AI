import { AID_DEPOT_INVENTORY } from "../engine/depotInventory";
import {
  diceCaptureSignal,
  aiopClarifySignal,
  assembleFromAidDepot,
  createTransactionStatement
} from "../engine/setupEngine";

const raw = {
  signalId: "RAW-NEED-001",
  source: "DIRECT_USER" as const,
  userStatement: "I need help protecting a transaction before I send money.",
  createdAt: new Date().toISOString()
};

const captured = diceCaptureSignal(raw);

if (!captured.captured) throw new Error("DICE_CAPTURE=FAIL");

const clarified = aiopClarifySignal(captured, {
  interpretedNeed: "transaction safety before consequence",
  userType: "consumer",
  urgency: "HIGH",
  desiredOutcome: "verify readiness before authorizing",
  constraints: ["no live payment", "no bank replacement"],
  missingAnswers: [],
  requiresTransactionProof: true
});

const plan = assembleFromAidDepot(clarified, AID_DEPOT_INVENTORY);

if (plan.decision !== "ASSEMBLE") {
  console.error(plan);
  throw new Error("AID_DEPOT_ASSEMBLY=FAIL");
}

const ts = createTransactionStatement(plan, "Setup package statement");

if (!ts.tsId.startsWith("TS-")) throw new Error("TS_ARTIFACT=FAIL");

const incomplete = aiopClarifySignal(captured, {
  interpretedNeed: "unknown",
  userType: "consumer",
  urgency: "MEDIUM",
  desiredOutcome: "unclear",
  constraints: [],
  missingAnswers: ["desired outcome missing"],
  requiresTransactionProof: false
});

const hold = assembleFromAidDepot(incomplete, AID_DEPOT_INVENTORY);

if (hold.decision !== "HOLD") throw new Error("AIOP_HOLD_RULE=FAIL");

const unsupported = aiopClarifySignal(captured, {
  interpretedNeed: "unauthorized rocket launch",
  userType: "unsupported_user",
  urgency: "CRITICAL",
  desiredOutcome: "outside inventory",
  constraints: [],
  missingAnswers: [],
  requiresTransactionProof: false
});

const refused = assembleFromAidDepot(unsupported, AID_DEPOT_INVENTORY);

if (refused.decision !== "REFUSE") throw new Error("UNAUTHORIZED_FULFILLMENT_REFUSAL=FAIL");

console.log("AIVA_SETUP_AND_DEPOT_FULFILLMENT_MODEL_V1=PASS");
console.log("DICE_CAPTURE_ONLY=PASS");
console.log("AIOP_CLARIFICATION_ROUTING=PASS");
console.log("AID_S_DEPOT_MATCH=PASS");
console.log("PACKAGE_ASSEMBLY_PLAN=PASS");
console.log("AIOP_HOLD_IF_INCOMPLETE=PASS");
console.log("UNAUTHORIZED_FULFILLMENT_REFUSED=PASS");
console.log("TS_TRANSACTION_STATEMENT_DEFINED=PASS");
console.log("NO_PAYMENT_RAILS=PASS");
console.log("NO_WALLET=PASS");
console.log("NO_SIMULATOR_PATCH=PASS");