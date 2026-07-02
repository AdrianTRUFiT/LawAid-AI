import { createSetupProofPacket }
from "../engine/createSetupProofPacket";

function assertPass(
  label: string,
  condition: boolean
) {
  if (!condition) {
    console.error(`${label}=FAIL`);
    process.exit(1);
  }

  console.log(`${label}=PASS`);
}

const packet = createSetupProofPacket({
  capturedSignalId: "SIG-001",
  clarificationId: "CLAR-001",
  planId: "PLAN-001",

  approvedDepotItems: [
    {
      itemId: "DEPOT-TRAVELFLOW",
      itemType: "DASHBOARD",
      label: "TravelFlowAI Client Dashboard"
    }
  ],

  deliverySurface: "DASHBOARD",

  proofRequirements: [
    {
      requirementId: "REQ-001",
      label: "Identity Match",
      satisfied: true
    }
  ],

  tsReference: "TS-SETUP-001"
});

assertPass(
  "SETUP_PACKET_CREATED",
  !!packet.packetId
);

assertPass(
  "NO_UNASSEMBLED_PACKET",
  packet.approvedDepotItems.length > 0
);

assertPass(
  "NO_FINANCIAL_AUTHORITY",
  packet.financialAuthorityGranted === false
);

assertPass(
  "ADVISORY_ONLY",
  packet.advisoryOnly === true
);

assertPass(
  "TS_REFERENCE_LINKED",
  packet.tsReference === "TS-SETUP-001"
);

assertPass(
  "READY_STATE",
  packet.setupDecision === "READY"
);

console.log("");
console.log("SETUP PROOF PACKET:");
console.log(JSON.stringify(packet, null, 2));
