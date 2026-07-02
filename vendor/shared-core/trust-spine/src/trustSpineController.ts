import type {
  ActorIdentity,
  ArtifactEnvelope,
  AuthorizationRequest,
  PolicySnapshot,
  TrustSnapshot,
} from "./trustSpineContracts.js";
import { authorizeAction, isAuthorizationApproved } from "./authorizationTrace.js";
import { canArtifactPropagate, quarantineArtifact } from "./quarantineEngine.js";
import { createRepairRecord, markArtifactRepaired } from "./repairEngine.js";
import { TrustRegistry } from "./trustRegistry.js";
import { createArtifactEnvelope, verifyArtifactIntegrity } from "./trustEnvelope.js";

export class TrustSpineController {
  private registry = new TrustRegistry();

  getRegistry(): TrustRegistry {
    return this.registry;
  }

  createGovernedArtifact<TPayload>(input: {
    actor: ActorIdentity;
    policy: PolicySnapshot;
    request: AuthorizationRequest;
    payload: TPayload;
    parentArtifactIds?: string[];
  }): {
    receipt: ReturnType<typeof authorizeAction>;
    envelope: ArtifactEnvelope<TPayload>;
  } {
    const receipt = authorizeAction({
      actor: input.actor,
      policy: input.policy,
      request: input.request,
    });

    this.registry.append("authorization", "authorize", {
      actorId: input.actor.actorId,
      decision: receipt.decision,
      artifactType: input.request.artifactType,
      scope: input.request.scope,
      receiptId: receipt.receiptId,
    });

    const trustState = isAuthorizationApproved(receipt) ? "verified" : "suspect";

    const envelope = createArtifactEnvelope({
      artifactType: input.request.artifactType,
      payload: input.payload,
      actorId: input.actor.actorId,
      scope: input.request.scope,
      parentArtifactIds: input.parentArtifactIds,
      authorizationReceiptId: receipt.receiptId,
      policyVersion: input.policy.version,
      trustState,
      quarantineState: isAuthorizationApproved(receipt) ? "none" : "blocked",
      notes: isAuthorizationApproved(receipt)
        ? ["Artifact created from authorized transition."]
        : [`Artifact creation was not fully approved: ${receipt.decision}`],
    });

    this.registry.append(envelope.artifactId, "create", {
      artifactType: envelope.artifactType,
      contentHash: envelope.contentHash,
      trustState: envelope.trustState,
      quarantineState: envelope.quarantineState,
      parentArtifactIds: envelope.parentArtifactIds,
    });

    return { receipt, envelope };
  }

  snapshot<TPayload>(input: {
    envelope: ArtifactEnvelope<TPayload>;
    authorizationApproved: boolean;
  }): TrustSnapshot {
    const isTampered = !verifyArtifactIntegrity(input.envelope);

    return {
      artifactId: input.envelope.artifactId,
      contentHash: input.envelope.contentHash,
      trustState: input.envelope.trustState,
      quarantineState: input.envelope.quarantineState,
      lineageDepth: input.envelope.parentArtifactIds.length,
      authorizationValid: input.authorizationApproved,
      isTampered,
      canPropagate:
        input.authorizationApproved &&
        !isTampered &&
        canArtifactPropagate(input.envelope),
    };
  }

  quarantine<TPayload>(
    envelope: ArtifactEnvelope<TPayload>,
    state: "observe" | "suspect" | "quarantined" | "blocked",
    reason: string,
  ): ArtifactEnvelope<TPayload> {
    const next = quarantineArtifact(envelope, state, reason);

    this.registry.append(envelope.artifactId, "quarantine", {
      quarantineState: next.quarantineState,
      trustState: next.trustState,
      reason,
    });

    return next;
  }

  repair<TPayload>(input: {
    envelope: ArtifactEnvelope<TPayload>;
    reason: string;
    repairType: "reverify" | "rollback" | "supersede" | "replace";
  }): {
    repairRecord: ReturnType<typeof createRepairRecord>;
    repairedEnvelope: ArtifactEnvelope<TPayload>;
  } {
    const repairRecord = createRepairRecord({
      artifactId: input.envelope.artifactId,
      repairType: input.repairType,
      reason: input.reason,
      repairedArtifactId: input.envelope.artifactId,
    });

    const repairedEnvelope = markArtifactRepaired(
      input.envelope,
      repairRecord,
    );

    this.registry.append(input.envelope.artifactId, "repair", {
      repairType: repairRecord.repairType,
      repairId: repairRecord.repairId,
      reason: repairRecord.reason,
    });

    return {
      repairRecord,
      repairedEnvelope,
    };
  }
}