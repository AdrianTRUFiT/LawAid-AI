import type { RoutingDecisionPacket } from "./routingDecisionPacketContracts";

export type RoutingIntentRecord = {
  recordId: string;
  packetId: string;
  sourceDecisionId: string;
  sourceTriggerId: string;
  decisionRecordId: string;
  triggerClassification: RoutingDecisionPacket["triggerClassification"];
  branchResult: RoutingDecisionPacket["branchResult"];
  nextAction: RoutingDecisionPacket["nextAction"];
  nextActionTargetPath: string;
  deferredPending: boolean;
  pendingQueueId?: string;
  reasonCodes: string[];
  createdAt: string;
  sourceRecordId?: string;
  certifiedClosureRecordId?: string;
};

export type RoutingIntentWriteResult = {
  record: RoutingIntentRecord;
  recordPath: string;
  repeatStatus: "CREATED" | "EXISTING";
};

export type LatestGovernanceRoutingIntent = {
  latestRecord: RoutingIntentRecord | null;
  totalRecords: number;
};

export type RoutingIntentQueryResult = {
  count: number;
  records: RoutingIntentRecord[];
};
