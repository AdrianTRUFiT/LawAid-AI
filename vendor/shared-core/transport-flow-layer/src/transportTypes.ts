export type FlowUnitType =
  | "package"
  | "pallet"
  | "load"
  | "container"
  | "document_batch"
  | "inventory_group"
  | "service_request"
  | "transport_reservation"
  | "capacity_slot"
  | "generic";

export type NodeType =
  | "origin"
  | "collection"
  | "consolidation"
  | "border"
  | "compliance"
  | "carrier_transfer"
  | "warehouse"
  | "cross_dock"
  | "regional_hub"
  | "final_mile"
  | "receiver"
  | "orchestrator";

export type MovementState =
  | "CREATED"
  | "READY_FOR_PICKUP"
  | "COLLECTED"
  | "ARRIVED_AT_COLLECTION_NODE"
  | "CONSOLIDATED"
  | "IN_TRANSIT"
  | "AT_BORDER_REVIEW"
  | "CLEARED"
  | "HELD"
  | "REFUSED"
  | "ARRIVED_AT_REGIONAL_HUB"
  | "DECONSOLIDATED"
  | "STAGED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "REROUTED"
  | "RETURNING"
  | "CLOSED";

export type CheckpointDecision =
  | "PASS"
  | "HOLD"
  | "REVIEW"
  | "REROUTE"
  | "SPLIT"
  | "CONSOLIDATE"
  | "REFUSE";

export type CheckpointType =
  | "origin_validation"
  | "consolidation_gate"
  | "border_compliance"
  | "storage_routing"
  | "final_mile_readiness"
  | "receiver_confirmation"
  | "generic";

export type ProofArtifactType =
  | "pickup_proof"
  | "transfer_receipt"
  | "compliance_clearance"
  | "customs_release"
  | "receiving_scan"
  | "delivery_confirmation"
  | "integrity_log"
  | "exception_note"
  | "checkpoint_decision";

export interface CapacityProfile {
  maxUnits: number;
  maxWeight?: number;
  maxVolume?: number;
}

export interface FlowTimingWindow {
  earliestAt?: string;
  latestAt?: string;
  serviceLevel?: "economy" | "standard" | "priority" | "critical";
}

export interface TransportNode {
  nodeId: string;
  nodeType: NodeType;
  locationCode: string;
  capacityProfile: CapacityProfile;
  throughputLimitPerHour: number;
  allowedTransitions: MovementState[];
  checkpointPolicies: CheckpointType[];
  queueDepth: number;
  handlingMode: "manual" | "semi_automated" | "automated";
}

export interface RouteLeg {
  sequence: number;
  nodeId: string;
  nodeType: NodeType;
  expectedStateOnArrival: MovementState;
  expectedStateOnDeparture?: MovementState;
  expectedWindow?: FlowTimingWindow;
}

export interface RoutePlan {
  routeId: string;
  laneSequence: RouteLeg[];
  transportModes: string[];
  expectedTransferPoints: string[];
  expectedTimingWindows: FlowTimingWindow[];
  fallbackRouteIds: string[];
  optimizationFlags: string[];
}

export interface CheckpointRecord {
  checkpointId: string;
  checkpointType: CheckpointType;
  nodeId: string;
  decision: CheckpointDecision;
  decisionReason: string;
  timestamp: string;
  actor: string;
  downstreamInstruction?: string;
  proofArtifactId?: string;
}

export interface ProofArtifact {
  artifactId: string;
  artifactType: ProofArtifactType;
  flowUnitId: string;
  nodeId: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface FlowUnit {
  flowUnitId: string;
  flowUnitType: FlowUnitType;
  originNodeId: string;
  destinationNodeId: string;
  currentNodeId: string;
  currentState: MovementState;
  routePlan: RoutePlan;
  checkpointHistory: CheckpointRecord[];
  consolidationGroupId?: string;
  complianceStatus: "unknown" | "pending" | "cleared" | "held" | "refused";
  timingWindow?: FlowTimingWindow;
  priority: number;
  utilizationValue: number;
  proofArtifacts: ProofArtifact[];
  metadata?: Record<string, unknown>;
}

export interface ConsolidationGroup {
  groupId: string;
  groupType: "lane_batch" | "mode_batch" | "destination_batch" | "mixed";
  memberIds: string[];
  capacityUsed: number;
  capacityMax: number;
  direction: "outbound" | "inbound" | "return";
  departureWindow?: FlowTimingWindow;
  returnPathPlan?: string;
  deconsolidationNodeId?: string;
}

export interface CheckpointEvaluationInput {
  flowUnit: FlowUnit;
  node: TransportNode;
  checkpointId: string;
  checkpointType: CheckpointType;
  actor: string;
  docsComplete?: boolean;
  ownerConfirmed?: boolean;
  compatibleForConsolidation?: boolean;
  routeJustified?: boolean;
  complianceCleared?: boolean;
  requiresReview?: boolean;
  rerouteTargetNodeId?: string;
  splitRequired?: boolean;
  endpointReady?: boolean;
}

export interface CheckpointEvaluationResult {
  checkpoint: CheckpointRecord;
  proofArtifact: ProofArtifact | null;
  suggestedNextState: MovementState;
}

export interface ExceptionEvent {
  eventId: string;
  flowUnitId: string;
  sourceCheckpointId: string;
  exceptionType:
    | "missed_pickup"
    | "consolidation_miss"
    | "border_delay"
    | "delivery_miss"
    | "reroute_required"
    | "generic";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  createdAt: string;
}

export interface ImpactPropagationRecord {
  recordId: string;
  flowUnitId: string;
  rootEventId: string;
  downstreamEffects: string[];
  throughputLossEstimate: number;
  createdAt: string;
}