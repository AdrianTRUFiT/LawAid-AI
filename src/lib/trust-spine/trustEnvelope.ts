import type { ArtifactEnvelope, QuarantineState, TrustState } from "./trustSpineContracts";
import { hashPayload, makeId, nowIso } from "./trustSpineUtils";

export function createArtifactEnvelope<TPayload>(input: {
  artifactType: string;
  payload: TPayload;
  actorId: string;
  scope: string;
  parentArtifactIds?: string[];
  authorizationReceiptId?: string;
  policyVersion?: string;
  trustState?: TrustState;
  quarantineState?: QuarantineState;
  notes?: string[];
}): ArtifactEnvelope<TPayload> {
  return {
    artifactId: makeId("artifact"),
    artifactType: input.artifactType,
    parentArtifactIds: input.parentArtifactIds ?? [],
    contentHash: hashPayload(input.payload),
    payload: input.payload,
    actorId: input.actorId,
    authorizationReceiptId: input.authorizationReceiptId,
    policyVersion: input.policyVersion,
    scope: input.scope,
    trustState: input.trustState ?? "draft",
    quarantineState: input.quarantineState ?? "none",
    createdAt: nowIso(),
    notes: input.notes ?? [],
  };
}

export function verifyArtifactIntegrity<TPayload>(
  envelope: ArtifactEnvelope<TPayload>,
): boolean {
  return envelope.contentHash === hashPayload(envelope.payload);
}
