import { executePlay } from "../playbookRouteEngine";

const approved = executePlay({
  scenario: "approved",
  packageId: "TXN-PACKAGE-001",
  pointA: "Verified Opportunity",
  pointB: "Live System Record",
  currentStage: "FUNDTRACKER_TRANSACT",
  requiredArtifactsPresent: true,
  custodyAcknowledged: true,
  defensePressure: "NONE"
});

const replay = executePlay({
  scenario: "replay",
  packageId: "TXN-PACKAGE-REPLAY-001",
  pointA: "Demo Authorization Signal",
  pointB: "Consequence Gate",
  currentStage: "FUNDTRACKER_TRANSACT",
  requiredArtifactsPresent: false,
  custodyAcknowledged: true,
  defensePressure: "REPLAY_ATTEMPT"
});

const fumble = executePlay({
  scenario: "refused",
  packageId: "TXN-PACKAGE-FUMBLE-001",
  pointA: "Captured Signal",
  pointB: "Activated Transaction State",
  currentStage: "AIOP_ACQUIRE",
  requiredArtifactsPresent: false,
  custodyAcknowledged: false,
  defensePressure: "FORCED_FUMBLE_ATTEMPT"
});

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(approved.status === "TOUCHDOWN_VERIFIED", "approved should score verified touchdown");
assert(approved.routeContract.assignedCarrier.authorityScope === "NO_AUTHORITY", "carrier must not receive authority");
assert(replay.status === "INTERCEPTION_BLOCKED", "replay must be blocked");
assert(fumble.status === "FUMBLE_PREVENTED", "bad custody must prevent fumble before consequence");
assert(approved.filmReview.governingLaw.includes("No orphaned AI action."), "film review must preserve no orphaned AI law");

console.log("TIS_PLAYBOOK_ROUTE_EXECUTION_LAYER_SMOKE_PASS");
console.log(JSON.stringify({
  approved: approved.status,
  replay: replay.status,
  fumble: fumble.status,
  carrierAuthority: approved.routeContract.assignedCarrier.authorityScope,
  protectedLiveCall: approved.playCall.protectedLiveCall
}, null, 2));
