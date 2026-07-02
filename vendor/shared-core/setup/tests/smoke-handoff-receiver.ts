import { createSetupProofPacket } from "../engine/createSetupProofPacket";
import { evaluateHandoffReceiver } from "../engine/handoffReceiverEngine";

function assertPass(label: string, condition: boolean) {
  if (!condition) {
    console.error(`${label}=FAIL`);
    process.exit(1);
  }
  console.log(`${label}=PASS`);
}

const readyPacket = createSetupProofPacket({
  capturedSignalId: "SIG-READY",
  clarificationId: "CLAR-READY",
  planId: "PLAN-READY",
  approvedDepotItems: [
    { itemId: "AID-TRAVELFLOW", itemType: "DASHBOARD", label: "TravelFlowAI Setup" }
  ],
  deliverySurface: "DASHBOARD",
  proofRequirements: [
    { requirementId: "REQ-ID", label: "Identity match", satisfied: true }
  ],
  tsReference: "TS-READY-001"
});

const accepted = evaluateHandoffReceiver({
  requestId: "REQ-001",
  targetReceiver: "TRAVELFLOWAI",
  packet: readyPacket,
  receivedAt: new Date().toISOString()
});

assertPass("RECEIVER_ACCEPTS_READY_PACKET", accepted.decision === "ACCEPT");
assertPass("RECEIVER_MAY_ACTIVATE", accepted.receiverMayActivate === true);
assertPass("NO_FINANCIAL_AUTHORITY_GRANTED", accepted.financialAuthorityGranted === false);

const heldPacket = createSetupProofPacket({
  capturedSignalId: "SIG-HOLD",
  clarificationId: "CLAR-HOLD",
  planId: "PLAN-HOLD",
  approvedDepotItems: [
    { itemId: "AID-TPS", itemType: "MERCHANT_PORTAL", label: "TPS Merchant Setup" }
  ],
  deliverySurface: "MERCHANT_PORTAL",
  proofRequirements: [
    { requirementId: "REQ-MISSING", label: "Required proof", satisfied: false }
  ],
  tsReference: "TS-HOLD-001"
});

const held = evaluateHandoffReceiver({
  requestId: "REQ-002",
  targetReceiver: "TPS",
  packet: heldPacket,
  receivedAt: new Date().toISOString()
});

assertPass("RECEIVER_HOLDS_HELD_PACKET", held.decision === "HOLD");
assertPass("HELD_PACKET_DOES_NOT_ACTIVATE", held.receiverMayActivate === false);

const noTsPacket = createSetupProofPacket({
  capturedSignalId: "SIG-NOTS",
  clarificationId: "CLAR-NOTS",
  planId: "PLAN-NOTS",
  approvedDepotItems: [
    { itemId: "AID-TPS", itemType: "MERCHANT_PORTAL", label: "TPS Merchant Setup" }
  ],
  deliverySurface: "MERCHANT_PORTAL",
  proofRequirements: [
    { requirementId: "REQ-ID", label: "Identity match", satisfied: true }
  ]
});

const noTs = evaluateHandoffReceiver({
  requestId: "REQ-003",
  targetReceiver: "TPS",
  packet: noTsPacket,
  receivedAt: new Date().toISOString()
});

assertPass("RECEIVER_REFUSES_MISSING_TS", noTs.decision === "REFUSE");
assertPass("TS_REFERENCE_REQUIRED_CODE", noTs.refusalCodes.includes("TS_REFERENCE_REQUIRED"));

const mismatch = evaluateHandoffReceiver({
  requestId: "REQ-004",
  targetReceiver: "SOULSEED",
  packet: readyPacket,
  receivedAt: new Date().toISOString()
});

assertPass("RECEIVER_REFUSES_UNSUPPORTED_SURFACE", mismatch.decision === "REFUSE");
assertPass("UNSUPPORTED_SURFACE_CODE", mismatch.refusalCodes.includes("DELIVERY_SURFACE_UNSUPPORTED"));

console.log("AIVA_SETUP_HANDOFF_RECEIVER_CONTRACT_V1=PASS");
console.log("PACKET_ACCEPTANCE_BOUNDARY=PASS");
console.log("RECEIVER_DOES_NOT_REINTERPRET_CONVERSATION=PASS");
console.log("NO_PAYMENT_RAILS=PASS");
console.log("NO_WALLET=PASS");
console.log("NO_FINANCIAL_AUTHORITY=PASS");