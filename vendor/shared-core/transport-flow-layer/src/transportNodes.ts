import type { CheckpointType, MovementState, TransportNode } from "./transportTypes.js";

export function createTransportNode(input: {
  nodeId: string;
  nodeType: TransportNode["nodeType"];
  locationCode: string;
  maxUnits: number;
  throughputLimitPerHour: number;
  allowedTransitions?: MovementState[];
  checkpointPolicies?: CheckpointType[];
  queueDepth?: number;
  handlingMode?: TransportNode["handlingMode"];
}): TransportNode {
  return {
    nodeId: input.nodeId,
    nodeType: input.nodeType,
    locationCode: input.locationCode,
    capacityProfile: {
      maxUnits: input.maxUnits,
    },
    throughputLimitPerHour: input.throughputLimitPerHour,
    allowedTransitions: input.allowedTransitions ?? [],
    checkpointPolicies: input.checkpointPolicies ?? [],
    queueDepth: input.queueDepth ?? 0,
    handlingMode: input.handlingMode ?? "manual",
  };
}