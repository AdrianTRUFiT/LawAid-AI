import type {
  GovernanceBranchState,
  GovernanceClassification,
  GovernanceNextActionPacket,
  GovernanceTrigger
} from "./governanceEngineContracts";

function buildActionId(triggerId: string, suffix: string): string {
  return `gov_action_${triggerId}_${suffix}`;
}

export function resolveBranch(args: {
  trigger: GovernanceTrigger;
  classification: GovernanceClassification;
}): {
  branchState: GovernanceBranchState;
  nextActionPacket: GovernanceNextActionPacket;
} {
  const { trigger, classification } = args;

  if (classification.classificationState === "CLASSIFIED_VALID") {
    return {
      branchState: "BRANCH_CONTINUE",
      nextActionPacket: {
        actionId: buildActionId(trigger.triggerId, "continue"),
        actionType: "CONTINUE_TO_NEXT_STAGE",
        sourceRecordId: trigger.sourceRecordId,
        packetId: trigger.packetId,
        targetPath: "shared-core/next-stage",
        reasonCodes: [...classification.reasons],
        createdAt: new Date().toISOString()
      }
    };
  }

  if (classification.classificationState === "CLASSIFIED_INVALID" && classification.incomplete) {
    return {
      branchState: "BRANCH_HOLD",
      nextActionPacket: {
        actionId: buildActionId(trigger.triggerId, "hold"),
        actionType: "HOLD_FOR_REVIEW",
        sourceRecordId: trigger.sourceRecordId,
        packetId: trigger.packetId,
        targetPath: "shared-core/governance-review",
        reasonCodes: [...classification.reasons],
        createdAt: new Date().toISOString()
      }
    };
  }

  if (classification.classificationState === "CLASSIFIED_INVALID" && classification.conflicting) {
    return {
      branchState: "BRANCH_REROUTE",
      nextActionPacket: {
        actionId: buildActionId(trigger.triggerId, "reroute"),
        actionType: "REROUTE_TO_PARENT",
        sourceRecordId: trigger.sourceRecordId,
        packetId: trigger.packetId,
        targetPath: "shared-core/parent-review",
        reasonCodes: [...classification.reasons],
        createdAt: new Date().toISOString()
      }
    };
  }

  return {
    branchState: "DEFERRED_PENDING",
    nextActionPacket: {
      actionId: buildActionId(trigger.triggerId, "pending"),
      actionType: "QUEUE_PENDING",
      sourceRecordId: trigger.sourceRecordId,
      packetId: trigger.packetId,
      targetPath: "shared-core/pending-queue",
      reasonCodes: [...classification.reasons],
      createdAt: new Date().toISOString()
    }
  };
}
