import type {
  ActorIdentity,
  AuthorizationReceipt,
  AuthorizationRequest,
  PolicySnapshot,
} from "./trustSpineContracts.js";
import { makeId, nowIso, signRecord } from "./trustSpineUtils.js";

export function authorizeAction(input: {
  actor: ActorIdentity;
  policy: PolicySnapshot;
  request: AuthorizationRequest;
}): AuthorizationReceipt {
  const expiresAt = input.policy.expiresAt
    ? new Date(input.policy.expiresAt).getTime()
    : null;
  const now = Date.now();

  let decision: AuthorizationReceipt["decision"] = "approved";

  if (expiresAt !== null && now > expiresAt) {
    decision = "expired";
  } else if (!input.policy.allowedArtifactTypes.includes(input.request.artifactType)) {
    decision = "refused";
  } else if (!input.actor.scope.includes(input.request.scope)) {
    decision = "out_of_scope";
  } else if (!input.policy.allowedScopes.includes(input.request.scope)) {
    decision = "out_of_scope";
  }

  const base = {
    receiptId: makeId("auth"),
    actorId: input.actor.actorId,
    action: input.request.action,
    artifactType: input.request.artifactType,
    scope: input.request.scope,
    decision,
    justification: input.request.justification,
    policyId: input.policy.policyId,
    policyVersion: input.policy.version,
    createdAt: nowIso(),
  };

  const signature = signRecord({
    keyId: input.actor.keyId,
    actorId: input.actor.actorId,
    payload: base,
  });

  return {
    ...base,
    signature,
  };
}

export function isAuthorizationApproved(
  receipt: AuthorizationReceipt,
): boolean {
  return receipt.decision === "approved";
}