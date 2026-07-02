import { LAIW_WORKFLOW_CHAIN } from './laiw-stack-contracts';
import { buildLAIWVerifiedEcosystem } from './laiw-verified-ecosystem';
import { tourRevalidateRouteArtifact } from './laiw-tour-gate';

const ecosystem = buildLAIWVerifiedEcosystem();

const originalRoute = {
  routeId: "ROUTE-001",
  need: "Move verified medical device from Point A to Point B",
  workflowChain: LAIW_WORKFLOW_CHAIN,
  participants: ecosystem.verifiedParticipants,
  locked: true
};

const validCandidate = {
  ...originalRoute
};

const mutatedCandidate = {
  ...originalRoute,
  need: "Move altered object from Point A to Point B"
};

const injectedStageCandidate = {
  ...originalRoute,
  workflowChain: [...originalRoute.workflowChain, "UNAUTHORIZED_STAGE"]
};

const unverifiedParticipantCandidate = {
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
};

function run(name: string, candidate: any) {
  console.log("----");
  console.log("TOUR_TEST=" + name);
  console.log(tourRevalidateRouteArtifact(originalRoute, candidate));
}

console.log("LAIW_TOUR_GATE=START");
run("VALID_EXECUTION", validCandidate);
run("MUTATED_EXECUTION", mutatedCandidate);
run("STAGE_INJECTION_EXECUTION", injectedStageCandidate);
run("UNVERIFIED_PARTICIPANT_EXECUTION", unverifiedParticipantCandidate);
console.log("LAIW_TOUR_GATE=COMPLETE");
