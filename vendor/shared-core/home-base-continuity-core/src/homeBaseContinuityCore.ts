export type ContinuityState =
  | "connected"
  | "degraded"
  | "fallback_active"
  | "store_and_forward"
  | "relayed"
  | "recovering"
  | "reconciled"
  | "disconnected_but_stateful";

export type ChannelState = "healthy" | "degraded" | "unavailable";

export type FallbackMode =
  | "none"
  | "lower_bandwidth"
  | "minimal_signal"
  | "store_and_forward"
  | "relay_mesh";

export type NodeRole = "home_base" | "released_node" | "relay_participant";

export type ReconciliationDisposition = "applied" | "held" | "refused";

export type ContinuityRefusalCode =
  | "HOME_BASE_MISMATCH"
  | "UNAUTHORIZED_PARTICIPATION"
  | "INVALID_RELAY_ATTEMPT"
  | "STALE_RELATIONSHIP"
  | "INVALID_RECOVERY_SYNC"
  | "REPLAYED_PACKET"
  | "FORCED_MESH_EXPANSION"
  | "INVALID_STATE_TRANSITION";

export interface HomeBaseNode {
  id: string;
  role: "home_base";
  label: string;
  trustAnchorId: string;
  continuitySeedVersion: number;
}

export interface ReleasedNode {
  id: string;
  role: "released_node";
  label: string;
  homeBaseId: string;
  continuitySeedVersion: number;
  lastKnownHeartbeatAt: string | null;
}

export interface ParticipationPermission {
  participantNodeId: string;
  relayEnabled: boolean;
  canRelayForHomeBaseIds: string[];
  expiresAt: string | null;
}

export interface MeshSupportRelation {
  relayNodeId: string;
  supportedHomeBaseId: string;
  densityClass: "tight" | "wide";
  permissionGranted: boolean;
}

export interface ContinuityPacket {
  packetId: string;
  emittedByNodeId: string;
  targetHomeBaseId: string;
  emittedAt: string;
  mode: FallbackMode;
  continuityState: ContinuityState;
  payloadHash: string;
  replayProtectionNonce: string;
}

export interface LocalPreservedState {
  releasedNodeId: string;
  homeBaseId: string;
  lastKnownStatus: string;
  lastKnownRelationshipHash: string;
  fallbackContactRule: string;
  allowedCommunicationMethods: string[];
  safetyPosture: "normal" | "watchful" | "protected";
  localEvents: ContinuityPacket[];
}

export interface ReassuranceSignal {
  releasedNodeId: string;
  homeBaseId: string;
  continuityState: ContinuityState;
  fallbackMode: FallbackMode;
  messageClass: "full" | "reduced" | "minimal" | "preserved_only";
}

export interface ReconciliationEvent {
  releasedNodeId: string;
  homeBaseId: string;
  continuitySeedVersion: number;
  packetsToApply: ContinuityPacket[];
  restoredAt: string;
}

export interface RecoverySyncRecord {
  releasedNodeId: string;
  homeBaseId: string;
  appliedPacketIds: string[];
  heldPacketIds: string[];
  refusedPacketIds: string[];
  disposition: ReconciliationDisposition;
  reason: string | null;
}

export interface ContinuitySnapshot {
  homeBaseId: string;
  releasedNodeId: string;
  continuityState: ContinuityState;
  preferredChannel: ChannelState;
  fallbackMode: FallbackMode;
  reassuranceSignal: ReassuranceSignal;
  localPreservedState: LocalPreservedState;
  relayUsed: boolean;
  refusalCodes: ContinuityRefusalCode[];
}

export interface EvaluateContinuityInput {
  homeBase: HomeBaseNode;
  releasedNode: ReleasedNode;
  preferredChannel: ChannelState;
  lowerBandwidthAvailable: boolean;
  minimalSignalAvailable: boolean;
  relayCandidate: ParticipationPermission | null;
  storedLocalState: LocalPreservedState;
  nowIso: string;
}

export interface EvaluateReconciliationInput {
  event: ReconciliationEvent;
  homeBase: HomeBaseNode;
  releasedNode: ReleasedNode;
  seenPacketIds?: Set<string>;
}

const STATE_TRANSITIONS: Record<ContinuityState, ContinuityState[]> = {
  connected: ["degraded", "fallback_active", "disconnected_but_stateful"],
  degraded: ["fallback_active", "store_and_forward", "connected"],
  fallback_active: ["store_and_forward", "relayed", "recovering", "connected"],
  store_and_forward: ["recovering", "reconciled"],
  relayed: ["recovering", "reconciled"],
  recovering: ["reconciled", "connected"],
  reconciled: ["connected"],
  disconnected_but_stateful: ["store_and_forward", "recovering"]
};

function isExpired(expiresAt: string | null, nowIso: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < new Date(nowIso).getTime();
}

function transitionAllowed(from: ContinuityState, to: ContinuityState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

function deriveFallbackMode(input: EvaluateContinuityInput): {
  state: ContinuityState;
  mode: FallbackMode;
  relayUsed: boolean;
  refusalCodes: ContinuityRefusalCode[];
} {
  const refusalCodes: ContinuityRefusalCode[] = [];

  if (input.preferredChannel === "healthy") {
    return {
      state: "connected",
      mode: "none",
      relayUsed: false,
      refusalCodes
    };
  }

  if (input.preferredChannel === "degraded") {
    if (input.lowerBandwidthAvailable) {
      return {
        state: "fallback_active",
        mode: "lower_bandwidth",
        relayUsed: false,
        refusalCodes
      };
    }

    if (input.minimalSignalAvailable) {
      return {
        state: "fallback_active",
        mode: "minimal_signal",
        relayUsed: false,
        refusalCodes
      };
    }
  }

  if (
    input.relayCandidate &&
    input.relayCandidate.relayEnabled &&
    !isExpired(input.relayCandidate.expiresAt, input.nowIso) &&
    input.relayCandidate.canRelayForHomeBaseIds.includes(input.homeBase.id)
  ) {
    return {
      state: "relayed",
      mode: "relay_mesh",
      relayUsed: true,
      refusalCodes
    };
  }

  if (input.relayCandidate && !input.relayCandidate.relayEnabled) {
    refusalCodes.push("UNAUTHORIZED_PARTICIPATION");
  }

  if (
    input.relayCandidate &&
    input.relayCandidate.relayEnabled &&
    !input.relayCandidate.canRelayForHomeBaseIds.includes(input.homeBase.id)
  ) {
    refusalCodes.push("INVALID_RELAY_ATTEMPT");
  }

  return {
    state: "store_and_forward",
    mode: "store_and_forward",
    relayUsed: false,
    refusalCodes
  };
}

function deriveMessageClass(mode: FallbackMode): ReassuranceSignal["messageClass"] {
  switch (mode) {
    case "none":
      return "full";
    case "lower_bandwidth":
      return "reduced";
    case "minimal_signal":
    case "relay_mesh":
      return "minimal";
    case "store_and_forward":
      return "preserved_only";
  }
}

export function evaluateContinuity(input: EvaluateContinuityInput): ContinuitySnapshot {
  const refusalCodes: ContinuityRefusalCode[] = [];

  if (input.releasedNode.homeBaseId !== input.homeBase.id) {
    refusalCodes.push("HOME_BASE_MISMATCH");
  }

  if (input.releasedNode.continuitySeedVersion !== input.homeBase.continuitySeedVersion) {
    refusalCodes.push("STALE_RELATIONSHIP");
  }

  const fallback = deriveFallbackMode(input);
  refusalCodes.push(...fallback.refusalCodes);

  const reassuranceSignal: ReassuranceSignal = {
    releasedNodeId: input.releasedNode.id,
    homeBaseId: input.homeBase.id,
    continuityState: fallback.state,
    fallbackMode: fallback.mode,
    messageClass: deriveMessageClass(fallback.mode)
  };

  return {
    homeBaseId: input.homeBase.id,
    releasedNodeId: input.releasedNode.id,
    continuityState: fallback.state,
    preferredChannel: input.preferredChannel,
    fallbackMode: fallback.mode,
    reassuranceSignal,
    localPreservedState: input.storedLocalState,
    relayUsed: fallback.relayUsed,
    refusalCodes
  };
}

export function reconcileContinuity(
  input: EvaluateReconciliationInput
): RecoverySyncRecord {
  const seenPacketIds = input.seenPacketIds ?? new Set<string>();
  const appliedPacketIds: string[] = [];
  const heldPacketIds: string[] = [];
  const refusedPacketIds: string[] = [];

  if (input.event.homeBaseId !== input.homeBase.id) {
    return {
      releasedNodeId: input.releasedNode.id,
      homeBaseId: input.homeBase.id,
      appliedPacketIds,
      heldPacketIds,
      refusedPacketIds: input.event.packetsToApply.map((p) => p.packetId),
      disposition: "refused",
      reason: "HOME_BASE_MISMATCH"
    };
  }

  if (input.event.continuitySeedVersion !== input.homeBase.continuitySeedVersion) {
    return {
      releasedNodeId: input.releasedNode.id,
      homeBaseId: input.homeBase.id,
      appliedPacketIds,
      heldPacketIds,
      refusedPacketIds: input.event.packetsToApply.map((p) => p.packetId),
      disposition: "held",
      reason: "STALE_RELATIONSHIP"
    };
  }

  let previousState: ContinuityState = "store_and_forward";

  for (const packet of input.event.packetsToApply) {
    if (packet.targetHomeBaseId !== input.homeBase.id) {
      refusedPacketIds.push(packet.packetId);
      continue;
    }

    if (seenPacketIds.has(packet.packetId)) {
      refusedPacketIds.push(packet.packetId);
      continue;
    }

    if (!transitionAllowed(previousState, packet.continuityState)) {
      refusedPacketIds.push(packet.packetId);
      continue;
    }

    appliedPacketIds.push(packet.packetId);
    previousState = packet.continuityState;
    seenPacketIds.add(packet.packetId);
  }

  const disposition: ReconciliationDisposition =
    refusedPacketIds.length > 0 && appliedPacketIds.length === 0
      ? "refused"
      : refusedPacketIds.length > 0
        ? "held"
        : "applied";

  return {
    releasedNodeId: input.releasedNode.id,
    homeBaseId: input.homeBase.id,
    appliedPacketIds,
    heldPacketIds,
    refusedPacketIds,
    disposition,
    reason:
      disposition === "applied"
        ? null
        : disposition === "held"
          ? "PARTIAL_RECONCILIATION_REVIEW"
          : "INVALID_RECOVERY_SYNC"
  };
}

export function createLocalPreservedState(
  releasedNodeId: string,
  homeBaseId: string
): LocalPreservedState {
  return {
    releasedNodeId,
    homeBaseId,
    lastKnownStatus: "seeded",
    lastKnownRelationshipHash: `${homeBaseId}:${releasedNodeId}:seeded`,
    fallbackContactRule: "quiet_failover",
    allowedCommunicationMethods: ["primary", "lower_bandwidth", "minimal_signal"],
    safetyPosture: "watchful",
    localEvents: []
  };
}