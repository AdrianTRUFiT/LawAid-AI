import type { ArtifactEnvelope, QuarantineState, TrustState } from "./trustSpineContracts";

export function quarantineArtifact<TPayload>(
  envelope: ArtifactEnvelope<TPayload>,
  state: QuarantineState,
  note: string,
): ArtifactEnvelope<TPayload> {
  const trustState: TrustState =
    state === "none" ? envelope.trustState : state === "observe" ? "suspect" : "quarantined";

  return {
    ...envelope,
    quarantineState: state,
    trustState,
    notes: [...(envelope.notes ?? []), note],
  };
}

export function canArtifactPropagate<TPayload>(
  envelope: ArtifactEnvelope<TPayload>,
): boolean {
  return (
    envelope.trustState !== "quarantined" &&
    envelope.quarantineState !== "quarantined" &&
    envelope.quarantineState !== "blocked"
  );
}
