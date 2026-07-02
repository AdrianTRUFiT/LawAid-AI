import { createHash } from "node:crypto";
import type { GovernanceDecisionResult } from "../governance-engine";
import type {
  RoutingDecisionAdapterResult,
  RoutingDecisionPacket
} from "./routingDecisionPacketContracts";

function buildPacketId(input: {
  decisionId: string;
  triggerId: string;
  branchState: string;
  classificationState: string;
  nextActionId: string;
}): string {
  const seed = JSON.stringify(input);
  return `routing_decision_${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
}

export function adaptGovernanceDecisionToRoutingPacket(
  result: GovernanceDecisionResult & {
    decisionRecordPath?: string;
    pendingQueuePath?: string;
    pendingRepeatStatus?: "CREATED" | "EXISTING";
  }
): RoutingDecisionAdapterResult {
  const packet: RoutingDecisionPacket = {
    packetType: "ROUTING_DECISION_PACKET",
    packetId: buildPacketId({
      decisionId: result.decisionRecord.decisionId,
      triggerId: result.decisionRecord.triggerId,
      branchState: result.branchState,
      classificationState: result.classification.classificationState,
      nextActionId: result.nextActionPacket.actionId
    }),
    sourceDecisionId: result.decisionRecord.decisionId,
    sourceTriggerId: result.decisionRecord.triggerId,
    triggerClassification: result.classification.classificationState,
    branchResult: result.branchState,
    nextAction: result.nextActionPacket.actionType,
    nextActionTargetPath: result.nextActionPacket.targetPath,
    decisionRecordId: result.decisionRecord.decisionId,
    deferredPending: result.branchState === "DEFERRED_PENDING",
    pendingQueueId: result.pendingQueueItem?.pendingId,
    reasonCodes: [
      ...result.decisionRecord.decisionReasons
    ],
    createdAt: new Date().toISOString()
  };

  return { packet };
}
