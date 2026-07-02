import { buildArtifact, makeId, nowIso } from "./soul256Utils";
import type {
  Soul256Assignment,
  Soul256CheckpointDefinition,
  Soul256CheckpointState,
  Soul256Session,
} from "./soul256Contracts";

export function createSoul256Session(input: {
  identityId: string;
  environmentId: string;
  definitions: Soul256CheckpointDefinition[];
}): Soul256Session {
  const carrierPool = Array.from({ length: 256 }, (_, i) => `carrier_${(i + 1).toString().padStart(3, "0")}`);
  const routePool = Array.from({ length: 256 }, (_, i) => `route_${(i + 1).toString().padStart(3, "0")}`);

  const realCarrierId = carrierPool[Math.floor(Math.random() * carrierPool.length)];
  const realRouteId = routePool[Math.floor(Math.random() * routePool.length)];

  const decoyCarrierIds = carrierPool.filter((x) => x !== realCarrierId).slice(0, 16);
  const decoyRouteIds = routePool.filter((x) => x !== realRouteId).slice(0, 16);

  const assignment: Soul256Assignment = {
    assignmentId: makeId("asg"),
    carrierId: realCarrierId,
    routeId: realRouteId,
    issuedAt: nowIso(),
  };

  const checkpoints: Soul256CheckpointState[] = input.definitions.map((d) => ({
    checkpointId: d.checkpointId,
    status: "pending",
  }));

  const session: Soul256Session = {
    sessionId: makeId("s256"),
    identityId: input.identityId,
    environmentId: input.environmentId,
    issuedAt: nowIso(),
    assignment,
    checkpoints,
    artifacts: [],
    realCarrierId,
    realRouteId,
    decoyCarrierIds,
    decoyRouteIds,
    consequenceUnlocked: false,
    consequenceCheckpointId: undefined,
    trapped: false,
    trapCheckpointId: undefined,
    complete: false,
  };

  session.artifacts.push(
    buildArtifact("entry_artifact", {
      sessionId: session.sessionId,
      identityId: session.identityId,
      environmentId: session.environmentId,
      issuedAt: session.issuedAt,
    })
  );

  session.artifacts.push(
    buildArtifact(
      "assignment_artifact",
      {
        assignmentId: assignment.assignmentId,
        carrierId: assignment.carrierId,
        routeId: assignment.routeId,
      },
      "cp_001"
    )
  );

  return session;
}
