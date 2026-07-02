import {
  type ActivatedTransactionStateArtifact,
  type ArtifactId,
  type CorrelationId,
  type EvidenceArtifact,
  type GTISArtifact,
  type GTISMetrics,
  type HumanReviewRequestedArtifact,
  type RefusalArtifact,
  emptyMetrics,
  makeId,
  nowIso,
  sha256,
} from "../gtis/gtisContracts";

export class GTISArtifactStore {
  private readonly artifactsByCorrelation = new Map<CorrelationId, GTISArtifact[]>();
  private readonly finalArtifacts = new Map<
    CorrelationId,
    ActivatedTransactionStateArtifact | RefusalArtifact | HumanReviewRequestedArtifact
  >();
  private metrics: GTISMetrics = emptyMetrics();

  append<TArtifact extends GTISArtifact>(
    input: Omit<TArtifact, "artifactId" | "issuedAt" | "previousArtifactHash" | "artifactHash">
  ): TArtifact {
    const existing = this.artifactsByCorrelation.get(input.correlationId) ?? [];
    const previous = existing.length > 0 ? existing[existing.length - 1] : null;

    const artifact: TArtifact = {
      ...input,
      artifactId: makeId<"ArtifactId">("art") as ArtifactId,
      issuedAt: nowIso(),
      previousArtifactHash: previous?.artifactHash ?? null,
      artifactHash: "",
    } as TArtifact;

    artifact.artifactHash = sha256({
      artifactId: artifact.artifactId,
      type: artifact.type,
      correlationId: artifact.correlationId,
      state: artifact.state,
      issuedAt: artifact.issuedAt,
      previousArtifactHash: artifact.previousArtifactHash,
      payload: artifact.payload,
    });

    existing.push(artifact);
    this.artifactsByCorrelation.set(input.correlationId, existing);

    if (
      artifact.type === "ActivatedTransactionStateArtifact" ||
      artifact.type === "RefusalArtifact" ||
      artifact.type === "HumanReviewRequestedArtifact"
    ) {
      this.finalArtifacts.set(input.correlationId, artifact);
    }

    return artifact;
  }

  bindEvidence(correlationId: CorrelationId, artifactIds: ArtifactId[]): EvidenceArtifact {
    const payload = {
      evidenceId: makeId<"ArtifactId">("evd") as ArtifactId,
      correlationId,
      artifactIds,
      boundAt: nowIso(),
      packageHash: "",
    };

    payload.packageHash = sha256({
      correlationId: payload.correlationId,
      artifactIds: payload.artifactIds,
      boundAt: payload.boundAt,
    });

    return this.append<EvidenceArtifact>({
      type: "EvidenceArtifact",
      correlationId,
      state: "EVIDENCE_PACKAGE_BOUND",
      payload,
    });
  }

  getArtifactsByCorrelation(correlationId: CorrelationId): GTISArtifact[] {
    return [...(this.artifactsByCorrelation.get(correlationId) ?? [])];
  }

  getFinalArtifact(
    correlationId: CorrelationId
  ): ActivatedTransactionStateArtifact | RefusalArtifact | HumanReviewRequestedArtifact | undefined {
    return this.finalArtifacts.get(correlationId);
  }

  assertConsequenceAuthorized(correlationId: CorrelationId): ActivatedTransactionStateArtifact {
    const finalArtifact = this.finalArtifacts.get(correlationId);
    if (!finalArtifact) {
      throw new Error("GTIS consequence denial: no final artifact exists.");
    }
    if (finalArtifact.type !== "ActivatedTransactionStateArtifact") {
      throw new Error(
        `GTIS consequence denial: final artifact is ${finalArtifact.type}, not activation.`
      );
    }
    return finalArtifact;
  }

  getMetrics(): GTISMetrics {
    return { ...this.metrics };
  }

  updateMetrics(mutator: (current: GTISMetrics) => GTISMetrics): void {
    this.metrics = mutator({ ...this.metrics });
  }
}
