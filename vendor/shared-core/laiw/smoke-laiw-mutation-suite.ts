import crypto from 'crypto';
import { LAIW_WORKFLOW_CHAIN } from './laiw-stack-contracts';
import { buildLAIWVerifiedEcosystem } from './laiw-verified-ecosystem';

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hashObject(obj: any) {
  return sha256(JSON.stringify(obj));
}

type MutationResult = {
  test: string;
  decision: "PASS" | "BLOCKED";
  reason: string;
};

function block(test: string, reason: string): MutationResult {
  return { test, decision: "BLOCKED", reason };
}

function pass(test: string): MutationResult {
  return { test, decision: "PASS", reason: "NO_MUTATION_DETECTED" };
}

const ecosystem = buildLAIWVerifiedEcosystem();

const originalRoute = {
  routeId: "ROUTE-001",
  need: "Move verified medical device from Point A to Point B",
  workflowChain: LAIW_WORKFLOW_CHAIN,
  participants: ecosystem.verifiedParticipants,
  locked: true
};

const originalHash = hashObject(originalRoute);

function validateRouteArtifact(candidate: any): MutationResult[] {
  const results: MutationResult[] = [];

  const candidateHash = hashObject({
    routeId: candidate.routeId,
    need: candidate.need,
    workflowChain: candidate.workflowChain,
    participants: candidate.participants,
    locked: candidate.locked
  });

  if (candidate.locked !== true) {
    results.push(block("ROUTE_LOCK", "ROUTE_NOT_LOCKED"));
  }

  if (JSON.stringify(candidate.workflowChain) !== JSON.stringify(LAIW_WORKFLOW_CHAIN)) {
    results.push(block("WORKFLOW_CHAIN", "WORKFLOW_CHAIN_MUTATED"));
  }

  for (const p of candidate.participants || []) {
    if (!p.verified || !p.soulId || !p.soulmark) {
      results.push(block("PARTICIPANT_VERIFICATION", "UNVERIFIED_PARTICIPANT"));
    }
  }

  const originalSoulmarks = originalRoute.participants.map(p => p.soulmark).join("|");
  const candidateSoulmarks = (candidate.participants || []).map((p: any) => p.soulmark).join("|");

  if (originalSoulmarks !== candidateSoulmarks) {
    results.push(block("SOULMARK_CONTINUITY", "SOULMARK_OR_PARTICIPANT_SWAP"));
  }

  if (candidateHash !== originalHash) {
    results.push(block("ROUTE_HASH", "ROUTE_ARTIFACT_MUTATED"));
  }

  if (results.length === 0) {
    results.push(pass("ROUTE_ARTIFACT"));
  }

  return results;
}

const attacks = [
  {
    name: "VALID_BASELINE",
    artifact: originalRoute
  },
  {
    name: "SOULMARK_REUSE_ATTACK",
    artifact: {
      ...originalRoute,
      participants: [
        ...originalRoute.participants.slice(0, 1),
        {
          ...originalRoute.participants[1],
          soulmark: originalRoute.participants[0].soulmark
        },
        originalRoute.participants[2]
      ]
    }
  },
  {
    name: "PARTICIPANT_SWAP_ATTACK",
    artifact: {
      ...originalRoute,
      participants: [
        originalRoute.participants[1],
        originalRoute.participants[0],
        originalRoute.participants[2]
      ]
    }
  },
  {
    name: "WORKFLOW_STAGE_INJECTION",
    artifact: {
      ...originalRoute,
      workflowChain: [...originalRoute.workflowChain, "UNAUTHORIZED_STAGE"]
    }
  },
  {
    name: "ROUTE_MUTATION_AFTER_LOCK",
    artifact: {
      ...originalRoute,
      need: "Move unverified altered payload from Point A to Point B"
    }
  },
  {
    name: "UNVERIFIED_PARTICIPANT_INJECTION",
    artifact: {
      ...originalRoute,
      participants: [
        ...originalRoute.participants,
        {
          id: "FAKE-001",
          label: "Fake Vendor",
          participantType: "VENDOR",
          soulId: "",
          soulmark: "",
          verified: false
        }
      ]
    }
  }
];

console.log("LAIW_MUTATION_STRESS_SUITE=START");

for (const attack of attacks) {
  console.log("----");
  console.log("ATTACK=" + attack.name);
  const results = validateRouteArtifact(attack.artifact);
  for (const r of results) {
    console.log(r.test + "=" + r.decision + "/" + r.reason);
  }
}

console.log("----");
console.log("LAIW_MUTATION_STRESS_SUITE=COMPLETE");
