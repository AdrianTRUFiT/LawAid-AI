import crypto from 'crypto';

export type ClosureState = "CLOSED" | "HELD" | "REFUSED";

export type ClosureArtifactType =
  | "RAW_SIGNAL"
  | "CAPTURED_SIGNAL"
  | "VERIFIED_OPPORTUNITY"
  | "ACTIVATED_TRANSACTION_STATE"
  | "LIVE_SYSTEM_RECORD";

export type ClosureArtifact = {
  signalRunId: string;
  artifactId: string;
  type: ClosureArtifactType;
  parentArtifactId?: string;
  hash: string;
  timestamp: number;
  status: "ACTIVE" | "REFUSED";
  reason?: string;
};

const ORDER: ClosureArtifactType[] = [
  "RAW_SIGNAL",
  "CAPTURED_SIGNAL",
  "VERIFIED_OPPORTUNITY",
  "ACTIVATED_TRANSACTION_STATE",
  "LIVE_SYSTEM_RECORD"
];

function sha(input: any) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function makeArtifact(input: {
  signalRunId: string;
  type: ClosureArtifactType;
  parent?: ClosureArtifact;
}): ClosureArtifact {
  if (input.parent) {
    const parentIndex = ORDER.indexOf(input.parent.type);
    const currentIndex = ORDER.indexOf(input.type);

    if (currentIndex !== parentIndex + 1) {
      const refused: ClosureArtifact = {
        signalRunId: input.signalRunId,
        artifactId: "REFUSED-" + sha(input).slice(0, 12),
        type: input.type,
        parentArtifactId: input.parent.artifactId,
        hash: "",
        timestamp: Date.now(),
        status: "REFUSED",
        reason: "INVALID_ARTIFACT_SEQUENCE"
      };

      refused.hash = sha(refused);
      return refused;
    }
  }

  const artifact: ClosureArtifact = {
    signalRunId: input.signalRunId,
    artifactId: "ART-" + sha(input).slice(0, 12),
    type: input.type,
    parentArtifactId: input.parent?.artifactId,
    hash: "",
    timestamp: Date.now(),
    status: "ACTIVE"
  };

  artifact.hash = sha(artifact);
  return artifact;
}

export function runOneSignalClosureProof() {
  const signalRunId = "SIGRUN-" + sha({ now: Date.now() }).slice(0, 12);

  const raw = makeArtifact({ signalRunId, type: "RAW_SIGNAL" });
  const captured = makeArtifact({ signalRunId, type: "CAPTURED_SIGNAL", parent: raw });
  const verified = makeArtifact({ signalRunId, type: "VERIFIED_OPPORTUNITY", parent: captured });
  const activated = makeArtifact({ signalRunId, type: "ACTIVATED_TRANSACTION_STATE", parent: verified });
  const live = makeArtifact({ signalRunId, type: "LIVE_SYSTEM_RECORD", parent: activated });

  const refusal = makeArtifact({
    signalRunId,
    type: "LIVE_SYSTEM_RECORD",
    parent: captured
  });

  const artifacts = [raw, captured, verified, activated, live];

  const artifactGraph = artifacts.map(a => ({
    artifactId: a.artifactId,
    type: a.type,
    parentArtifactId: a.parentArtifactId || null,
    hash: a.hash
  }));

  const rootHash = sha(artifactGraph);

  const userView = {
    signalRunId,
    source: live.artifactId,
    state: "Your record is active and traceable.",
    closureState: "CLOSED" as ClosureState
  };

  const operatorView = {
    signalRunId,
    source: live.artifactId,
    artifactGraph,
    rootHash,
    refusalTest: refusal,
    closureState: "CLOSED" as ClosureState
  };

  return {
    proof: "ONE_SIGNAL_CLOSURE_PROOF_V1",
    signalRunId,
    closureState: "CLOSED" as ClosureState,
    artifacts,
    artifactGraph,
    rootHash,
    userView,
    operatorView
  };
}
