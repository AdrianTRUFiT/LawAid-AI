import type {
  Soul256AdvanceInput,
  Soul256AdvanceResult,
  Soul256CheckpointDefinition,
  Soul256ReconciliationResult,
  Soul256Session,
} from "./soul256Contracts";
import { buildArtifact, nowIso } from "./soul256Utils";

export class Soul256Engine {
  private readonly definitions: Soul256CheckpointDefinition[];
  private readonly defsById: Map<string, Soul256CheckpointDefinition>;

  constructor(definitions: Soul256CheckpointDefinition[]) {
    this.definitions = definitions;
    this.defsById = new Map(definitions.map((d) => [d.checkpointId, d]));
  }

  advance(session: Soul256Session, input: Soul256AdvanceInput): Soul256AdvanceResult {
    const def = this.defsById.get(input.checkpointId);
    const state = session.checkpoints.find((c) => c.checkpointId === input.checkpointId);

    if (!def || !state) {
      return {
        ok: false,
        checkpointId: input.checkpointId,
        status: "failed",
        reasonCode: "CHECKPOINT_NOT_FOUND",
      };
    }

    if (session.trapped && def.kind !== "reconciliation_gate") {
      state.status = "blocked";
      state.reasonCode = "SESSION_TRAPPED";
      return {
        ok: false,
        checkpointId: input.checkpointId,
        status: state.status,
        reasonCode: state.reasonCode,
      };
    }

    if (state.status === "passed") {
      return {
        ok: true,
        checkpointId: input.checkpointId,
        status: state.status,
        reasonCode: "ALREADY_PASSED",
        artifactId: state.artifactId,
      };
    }

    for (const depId of def.dependsOn) {
      const dep = session.checkpoints.find((c) => c.checkpointId === depId);
      if (!dep || dep.status !== "passed") {
        state.status = "blocked";
        state.reasonCode = "DEPENDENCY_NOT_SATISFIED";
        return {
          ok: false,
          checkpointId: input.checkpointId,
          status: state.status,
          reasonCode: state.reasonCode,
        };
      }
    }

    const carrierMatches = input.carrierId === session.realCarrierId;
    const routeMatches = input.routeId === session.realRouteId;
    const decoyCarrierMatches = session.decoyCarrierIds.includes(input.carrierId);
    const decoyRouteMatches = session.decoyRouteIds.includes(input.routeId);

    const isAssignmentGate = def.kind === "assignment_gate";
    const isDecoyGate = def.kind === "decoy_gate";
    const isSinkGate = def.kind === "sink_gate";

    if (isAssignmentGate && (!carrierMatches || !routeMatches)) {
      state.status = "failed";
      state.reasonCode = "ASSIGNMENT_MISMATCH";
      const artifact = buildArtifact(
        "refusal_artifact",
        { checkpointId: def.checkpointId, carrierId: input.carrierId, routeId: input.routeId },
        def.checkpointId
      );
      state.artifactId = artifact.artifactId;
      state.verifiedAt = nowIso();
      session.artifacts.push(artifact);

      return {
        ok: false,
        checkpointId: def.checkpointId,
        status: state.status,
        reasonCode: state.reasonCode,
        artifactId: artifact.artifactId,
      };
    }

    if (isDecoyGate) {
      const decoyAccept = (decoyCarrierMatches && routeMatches) || (carrierMatches && decoyRouteMatches) || (carrierMatches && routeMatches);

      if (!decoyAccept) {
        state.status = "failed";
        state.reasonCode = "DECOY_REJECTED";
        const artifact = buildArtifact(
          "refusal_artifact",
          { checkpointId: def.checkpointId, carrierId: input.carrierId, routeId: input.routeId },
          def.checkpointId
        );
        state.artifactId = artifact.artifactId;
        state.verifiedAt = nowIso();
        session.artifacts.push(artifact);

        return {
          ok: false,
          checkpointId: def.checkpointId,
          status: state.status,
          reasonCode: state.reasonCode,
          artifactId: artifact.artifactId,
        };
      }

      state.status = "passed";
      state.reasonCode = decoyCarrierMatches || decoyRouteMatches ? "DECOY_DIVERTED" : "DECOY_VALID";
      state.verifiedAt = nowIso();

      const artifact = buildArtifact(
        "decoy_artifact",
        {
          checkpointId: def.checkpointId,
          sequence: def.sequence,
          kind: def.kind,
          intelligenceDepth: def.intelligenceDepth,
          decoyCarrierMatches,
          decoyRouteMatches,
        },
        def.checkpointId
      );

      state.artifactId = artifact.artifactId;
      session.artifacts.push(artifact);

      return {
        ok: true,
        checkpointId: def.checkpointId,
        status: state.status,
        reasonCode: state.reasonCode,
        artifactId: artifact.artifactId,
      };
    }

    if (isSinkGate && (!carrierMatches || !routeMatches)) {
      state.status = "failed";
      state.reasonCode = "SINK_TRIGGERED";
      state.verifiedAt = nowIso();
      const artifact = buildArtifact(
        "sink_artifact",
        {
          checkpointId: def.checkpointId,
          sequence: def.sequence,
          carrierId: input.carrierId,
          routeId: input.routeId,
        },
        def.checkpointId
      );
      state.artifactId = artifact.artifactId;
      session.artifacts.push(artifact);
      session.trapped = true;
      session.trapCheckpointId = def.checkpointId;
      session.consequenceUnlocked = false;
      session.consequenceCheckpointId = undefined;

      return {
        ok: false,
        checkpointId: def.checkpointId,
        status: state.status,
        reasonCode: state.reasonCode,
        artifactId: artifact.artifactId,
      };
    }

    if (!carrierMatches || !routeMatches) {
      state.status = "failed";
      state.reasonCode = "CHAIN_CONTINUITY_MISMATCH";
      const artifact = buildArtifact(
        "refusal_artifact",
        { checkpointId: def.checkpointId, carrierId: input.carrierId, routeId: input.routeId },
        def.checkpointId
      );
      state.artifactId = artifact.artifactId;
      state.verifiedAt = nowIso();
      session.artifacts.push(artifact);

      return {
        ok: false,
        checkpointId: def.checkpointId,
        status: state.status,
        reasonCode: state.reasonCode,
        artifactId: artifact.artifactId,
      };
    }

    state.status = "passed";
    state.reasonCode = "VALID";
    state.verifiedAt = nowIso();

    const artifactType = def.consequenceBearing ? "consequence_artifact" : "checkpoint_artifact";

    const artifact = buildArtifact(
      artifactType,
      {
        checkpointId: def.checkpointId,
        sequence: def.sequence,
        kind: def.kind,
        intelligenceDepth: def.intelligenceDepth,
        consequenceBearing: def.consequenceBearing,
        decoyOnly: def.decoyOnly,
      },
      def.checkpointId
    );

    state.artifactId = artifact.artifactId;
    session.artifacts.push(artifact);

    if (def.kind === "consequence_gate" && def.consequenceBearing) {
      session.consequenceUnlocked = true;
      session.consequenceCheckpointId = def.checkpointId;
    }

    return {
      ok: true,
      checkpointId: input.checkpointId,
      status: state.status,
      reasonCode: state.reasonCode,
      artifactId: artifact.artifactId,
    };
  }

  assertConsequenceAuthorized(session: Soul256Session): {
    ok: boolean;
    checkpointId?: string;
    reasonCode?: string;
  } {
    if (session.trapped) {
      return {
        ok: false,
        reasonCode: "SESSION_TRAPPED",
      };
    }

    if (!session.consequenceUnlocked || !session.consequenceCheckpointId) {
      return {
        ok: false,
        reasonCode: "CONSEQUENCE_GATE_NOT_PASSED",
      };
    }

    const checkpoint = session.checkpoints.find(
      (c) => c.checkpointId === session.consequenceCheckpointId
    );

    if (!checkpoint || checkpoint.status !== "passed") {
      return {
        ok: false,
        reasonCode: "CONSEQUENCE_GATE_INVALID",
      };
    }

    return {
      ok: true,
      checkpointId: session.consequenceCheckpointId,
    };
  }

  reconcile(session: Soul256Session): Soul256ReconciliationResult {
    const requiredDefs = this.definitions.filter((d) => d.required);
    const requiredStates = session.checkpoints.filter((c) =>
      requiredDefs.some((d) => d.checkpointId === c.checkpointId)
    );

    const passedRequired = requiredStates.filter((c) => c.status === "passed").length;
    const totalRequired = requiredStates.length;

    const assignmentMatches =
      session.assignment.carrierId === session.realCarrierId &&
      session.assignment.routeId === session.realRouteId;

    const ok = passedRequired === totalRequired && assignmentMatches && !session.trapped;

    session.artifacts.push(
      buildArtifact(
        "reconciliation_artifact",
        {
          sessionId: session.sessionId,
          passedRequired,
          totalRequired,
          assignmentMatches,
          ok,
          trapped: session.trapped,
          trapCheckpointId: session.trapCheckpointId,
          consequenceUnlocked: session.consequenceUnlocked,
          consequenceCheckpointId: session.consequenceCheckpointId,
        },
        "cp_256"
      )
    );

    session.complete = ok;

    return {
      ok,
      reasonCode: ok ? "RECONCILED" : "RECONCILIATION_FAILED",
      passedRequired,
      totalRequired,
      assignmentMatches,
    };
  }
}
