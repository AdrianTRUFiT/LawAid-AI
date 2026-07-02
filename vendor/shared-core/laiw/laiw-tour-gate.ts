import crypto from 'crypto';
import { LAIW_WORKFLOW_CHAIN } from './laiw-stack-contracts';

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hashObject(obj: any) {
  return sha256(JSON.stringify(obj));
}

export function tourRevalidateRouteArtifact(original: any, candidate: any) {
  const failures: string[] = [];

  if (!candidate.locked) {
    failures.push("ROUTE_NOT_LOCKED");
  }

  if (JSON.stringify(candidate.workflowChain) !== JSON.stringify(LAIW_WORKFLOW_CHAIN)) {
    failures.push("WORKFLOW_CHAIN_MUTATED");
  }

  for (const p of candidate.participants || []) {
    if (!p.verified || !p.soulId || !p.soulmark) {
      failures.push("UNVERIFIED_PARTICIPANT");
    }
  }

  const originalSoulmarks = (original.participants || []).map((p: any) => p.soulmark).join("|");
  const candidateSoulmarks = (candidate.participants || []).map((p: any) => p.soulmark).join("|");

  if (originalSoulmarks !== candidateSoulmarks) {
    failures.push("SOULMARK_CONTINUITY_BROKEN");
  }

  const originalHash = hashObject({
    routeId: original.routeId,
    need: original.need,
    workflowChain: original.workflowChain,
    participants: original.participants,
    locked: original.locked
  });

  const candidateHash = hashObject({
    routeId: candidate.routeId,
    need: candidate.need,
    workflowChain: candidate.workflowChain,
    participants: candidate.participants,
    locked: candidate.locked
  });

  if (originalHash !== candidateHash) {
    failures.push("ROUTE_ARTIFACT_MUTATED");
  }

  if (failures.length > 0) {
    return {
      decision: "BLOCKED",
      reason: "TOUR_REVALIDATION_FAILED",
      failures
    };
  }

  return {
    decision: "CONTINUE",
    reason: "TOUR_REVALIDATION_PASSED",
    routeHash: candidateHash,
    revalidatedAt: Date.now()
  };
}
