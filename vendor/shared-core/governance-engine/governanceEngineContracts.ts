export type GovernanceTriggerState =
  | "TRIGGER_DETECTED";

export type GovernanceClassificationState =
  | "CLASSIFIED_VALID"
  | "CLASSIFIED_INVALID"
  | "CLASSIFIED_DEFERRED";

export type GovernanceBranchState =
  | "BRANCH_CONTINUE"
  | "BRANCH_HOLD"
  | "BRANCH_REROUTE"
  | "DEFERRED_PENDING";

export type GovernanceTriggerKind =
  | "CERTIFIED_READY"
  | "CERTIFIED_HOLD"
  | "CERTIFIED_REFUSE_MUTATION"
  | "CERTIFIED_REFUSE_INCOMPLETE"
  | "CERTIFIED_REFUSE_UNCERTIFIED"
  | "UNKNOWN";

export type GovernanceTrigger = {
  triggerId: string;
  sourceRecordId: string;
  packetId?: string;
  triggerKind: GovernanceTriggerKind;
  sourceParent: string;
  receivingParent: string;
  certifiedClosureResult?: string;
  hilReadyStatus?: string;
  reasonCodes: string[];
  createdAt: string;
};

export type GovernanceClassification = {
  triggerState: GovernanceTriggerState;
  classificationState: GovernanceClassificationState;
  valid: boolean;
  deferred: boolean;
  conflicting: boolean;
  incomplete: boolean;
  reasons: string[];
};

export type GovernanceNextActionPacket = {
  actionId: string;
  actionType:
    | "CONTINUE_TO_NEXT_STAGE"
    | "HOLD_FOR_REVIEW"
    | "REROUTE_TO_PARENT"
    | "QUEUE_PENDING";
  sourceRecordId: string;
  packetId?: string;
  targetPath: string;
  reasonCodes: string[];
  createdAt: string;
};

export type GovernanceDecisionRecord = {
  decisionId: string;
  triggerId: string;
  sourceRecordId: string;
  packetId?: string;
  triggerKind: GovernanceTriggerKind;
  classificationState: GovernanceClassificationState;
  branchState: GovernanceBranchState;
  decisionReasons: string[];
  nextActionPacket: GovernanceNextActionPacket;
  createdAt: string;
};

export type GovernancePendingQueueItem = {
  pendingId: string;
  triggerId: string;
  sourceRecordId: string;
  packetId?: string;
  triggerKind: GovernanceTriggerKind;
  status: "pending";
  reasonCodes: string[];
  createdAt: string;
};

export type GovernanceDecisionResult = {
  classification: GovernanceClassification;
  branchState: GovernanceBranchState;
  nextActionPacket: GovernanceNextActionPacket;
  decisionRecord: GovernanceDecisionRecord;
  pendingQueueItem?: GovernancePendingQueueItem;
};
