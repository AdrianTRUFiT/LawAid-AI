import type {
  GovernanceDecisionResult,
  GovernanceTrigger
} from "./governanceEngineContracts";
import { classifyTrigger } from "./triggerClassifier";
import { resolveBranch } from "./branchResolver";
import { enqueuePendingItem } from "./pendingQueue";
import { recordDecision } from "./decisionRecorder";

export function runGovernanceDecisionEngine(trigger: GovernanceTrigger): GovernanceDecisionResult & {
  decisionRecordPath: string;
  pendingQueuePath?: string;
  pendingRepeatStatus?: "CREATED" | "EXISTING";
} {
  const classification = classifyTrigger(trigger);
  const branch = resolveBranch({ trigger, classification });

  const decisionWrite = recordDecision({
    trigger,
    classificationState: classification.classificationState,
    branchState: branch.branchState,
    decisionReasons: [...classification.reasons],
    nextActionPacket: branch.nextActionPacket
  });

  if (branch.branchState === "DEFERRED_PENDING") {
    const pendingWrite = enqueuePendingItem({
      trigger,
      reasons: [...classification.reasons]
    });

    return {
      classification,
      branchState: branch.branchState,
      nextActionPacket: branch.nextActionPacket,
      decisionRecord: decisionWrite.record,
      decisionRecordPath: decisionWrite.recordPath,
      pendingQueueItem: pendingWrite.item,
      pendingQueuePath: pendingWrite.itemPath,
      pendingRepeatStatus: pendingWrite.repeatStatus
    };
  }

  return {
    classification,
    branchState: branch.branchState,
    nextActionPacket: branch.nextActionPacket,
    decisionRecord: decisionWrite.record,
    decisionRecordPath: decisionWrite.recordPath
  };
}
