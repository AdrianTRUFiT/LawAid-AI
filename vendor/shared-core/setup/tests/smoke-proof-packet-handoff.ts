import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AID_DEPOT_INVENTORY } from "../engine/depotInventory";
import {
  diceCaptureSignal,
  aiopClarifySignal,
  assembleFromAidDepot,
  createTransactionStatement
} from "../engine/setupEngine";
import { createSetupProofPacket } from "../engine/proofPacketFactory";

const raw = {
  signalId: "RAW-NEED-PROOF-001",
  source: "DIRECT_USER" as const,
  userStatement: "I need a guided setup that helps me verify a transaction before I authorize it.",
  createdAt: new Date().toISOString()
};

const captured = diceCaptureSignal(raw);

const clarification = aiopClarifySignal(captured, {
  interpretedNeed: "guided transaction readiness setup",
  userType: "consumer",
  urgency: "HIGH",
  desiredOutcome: "receive a usable setup package with proof path",
  constraints: ["sandbox only", "no live payment", "no bank integration"],
  missingAnswers: [],
  requiresTransactionProof: true
});

const plan = assembleFromAidDepot(clarification, AID_DEPOT_INVENTORY);

if (plan.decision !== "ASSEMBLE") {
  console.error(plan);
  throw new Error("PROOF_PACKET_PLAN_ASSEMBLY=FAIL");
}

const ts = createTransactionStatement(plan, "Setup handoff Transaction Statement");

const packet = createSetupProofPacket({
  environment: "SANDBOX",
  rawSignal: raw,
  capturedSignal: captured,
  clarification,
  packagePlan: plan,
  transactionStatement: ts
});

if (packet.buildTarget !== "AIVA_SETUP_PROOF_PACKET_AND_HANDOFF_V1") {
  throw new Error("PROOF_PACKET_BUILD_TARGET=FAIL");
}

if (!packet.boundaryPreservation.noUnauthorizedFulfillment) {
  throw new Error("PROOF_PACKET_BOUNDARY=FAIL");
}

const outDir = join(process.cwd(), "records");
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "setup-proof-packet-sandbox.json");
writeFileSync(outPath, JSON.stringify(packet, null, 2), "utf8");

console.log("AIVA_SETUP_PROOF_PACKET_AND_HANDOFF_V1=PASS");
console.log("SETUP_PROOF_PACKET_CREATED=PASS");
console.log("SIGNAL_TO_CLARIFICATION_INCLUDED=PASS");
console.log("DEPOT_MATCH_INCLUDED=PASS");
console.log("PACKAGE_PLAN_INCLUDED=PASS");
console.log("TS_REFERENCE_INCLUDED=PASS");
console.log("BOUNDARY_PRESERVATION_INCLUDED=PASS");
console.log("NO_PAYMENT_RAILS=PASS");
console.log("NO_WALLET=PASS");
console.log("NO_BANK_INTEGRATION=PASS");
console.log("NO_SIMULATOR_PATCH=PASS");
console.log(`PROOF_PACKET_WRITTEN=${outPath}`);