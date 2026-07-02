import type {
  RawNeedSignal,
  CapturedNeedSignal,
  AiopClarificationSession,
  PackageAssemblyPlan,
  TransactionStatement
} from "../contracts/setupContracts";
import type { SetupProofPacket, SetupProofPacketEnvironment } from "../contracts/proofPacketContracts";

export function createSetupProofPacket(input: {
  environment: SetupProofPacketEnvironment;
  rawSignal: RawNeedSignal;
  capturedSignal: CapturedNeedSignal;
  clarification: AiopClarificationSession;
  packagePlan: PackageAssemblyPlan;
  transactionStatement?: TransactionStatement;
}): SetupProofPacket {
  const packet: SetupProofPacket = {
    packetId: `SETUP-PROOF-${input.packagePlan.planId}`,
    environment: input.environment,
    buildTarget: "AIVA_SETUP_PROOF_PACKET_AND_HANDOFF_V1",
    rawSignal: input.rawSignal,
    capturedSignal: input.capturedSignal,
    clarification: input.clarification,
    packagePlan: input.packagePlan,
    transactionStatement: input.transactionStatement,
    boundaryPreservation: {
      diceOnlyCaptured: true,
      aiopOnlyClarified: true,
      aidOnlyMatchedDepot: true,
      noUnauthorizedFulfillment: true,
      noPaymentRails: true,
      noWallet: true,
      noBankIntegration: true,
      noSimulatorPatch: true
    },
    handoffSummary: [
      "Raw need signal was captured by DICE.",
      "AIOP clarified and routed the need without creating truth.",
      "AID-S matched the clarified need to approved depot inventory.",
      "Package assembly plan was created without unauthorized fulfillment.",
      "TS remains Transaction Statement and is not limited to invoice.",
      "No live payment, wallet, bank, or simulator mutation occurred."
    ],
    createdAt: new Date().toISOString()
  };

  assertSetupProofPacket(packet);

  return packet;
}

export function assertSetupProofPacket(packet: SetupProofPacket): void {
  if (!packet.rawSignal.signalId) throw new Error("PROOF_PACKET_RAW_SIGNAL_MISSING");
  if (!packet.capturedSignal.captured) throw new Error("PROOF_PACKET_CAPTURED_SIGNAL_MISSING");
  if (!packet.clarification.clarificationId) throw new Error("PROOF_PACKET_CLARIFICATION_MISSING");
  if (!packet.packagePlan.planId) throw new Error("PROOF_PACKET_PACKAGE_PLAN_MISSING");

  if (packet.packagePlan.decision === "ASSEMBLE" && packet.packagePlan.selectedDepotItems.length < 1) {
    throw new Error("PROOF_PACKET_ASSEMBLE_WITHOUT_DEPOT_ITEM");
  }

  if (!packet.boundaryPreservation.noPaymentRails) throw new Error("PAYMENT_RAIL_BOUNDARY_BROKEN");
  if (!packet.boundaryPreservation.noWallet) throw new Error("WALLET_BOUNDARY_BROKEN");
  if (!packet.boundaryPreservation.noBankIntegration) throw new Error("BANK_BOUNDARY_BROKEN");
  if (!packet.boundaryPreservation.noUnauthorizedFulfillment) throw new Error("UNAUTHORIZED_FULFILLMENT_BOUNDARY_BROKEN");
}