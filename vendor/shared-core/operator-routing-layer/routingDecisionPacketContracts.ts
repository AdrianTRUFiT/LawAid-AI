export type RoutingDecisionState =
  | "ROUTING_DECISION_PACKET";

export type RoutingDecisionPacket = {
  packetType: RoutingDecisionState;
  packetId: string;
  sourceDecisionId: string;
  sourceTriggerId: string;
  triggerClassification:
    | "CLASSIFIED_VALID"
    | "CLASSIFIED_INVALID"
    | "CLASSIFIED_DEFERRED";
  branchResult:
    | "BRANCH_CONTINUE"
    | "BRANCH_HOLD"
    | "BRANCH_REROUTE"
    | "DEFERRED_PENDING";
  nextAction:
    | "CONTINUE_TO_NEXT_STAGE"
    | "HOLD_FOR_REVIEW"
    | "REROUTE_TO_PARENT"
    | "QUEUE_PENDING";
  nextActionTargetPath: string;
  decisionRecordId: string;
  deferredPending: boolean;
  pendingQueueId?: string;
  reasonCodes: string[];
  createdAt: string;
};

export type RoutingDecisionAdapterResult = {
  packet: RoutingDecisionPacket;
};
