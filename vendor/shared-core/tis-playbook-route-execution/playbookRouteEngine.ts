import {
  CarrierAssignment,
  CustodyTransferReceipt,
  DefensePressure,
  FilmReviewRecord,
  PlayCall,
  PlayExecutionInput,
  PlayExecutionResult,
  PlayOutcome,
  RouteContract
} from "./playbookRouteContracts";

function makePlayCall(input: PlayExecutionInput): PlayCall {
  return {
    playCallId: `PLAY-${input.scenario.toUpperCase()}-001`,
    playName:
      input.scenario === "approved"
        ? "Verified Route Completion"
        : input.scenario === "held"
        ? "Checkpoint Hold"
        : input.scenario === "replay"
        ? "Replay Containment"
        : "Refusal Gate",
    selectedBy: "RATE",
    authorizedBy: "AIVA",
    currentStage: input.currentStage,
    objective: `Move ${input.packageId} from ${input.pointA} to ${input.pointB} without losing custody or outrunning proof.`,
    protectedLiveCall: true,
    publicPlaybookVisible: true,
    reasonCalled:
      "A governed package became active. A play must be called before movement."
  };
}

function assignCarrier(input: PlayExecutionInput): CarrierAssignment {
  return {
    carrierId: "WFC-MI-CARRIER-001",
    carrierType: "WFC_COURIER",
    carrierName: "WFCⓈ Digital Courier with Motion Intelligence",
    custodyScope: "BOUNDED_CUSTODY_ONLY",
    authorityScope: "NO_AUTHORITY",
    parentAuthority: "RATE under AIVA command authority",
    mustAcknowledge: [
      "correct package",
      "correct route",
      "correct destination",
      "no authority ownership",
      "no consequence declaration"
    ]
  };
}

function makeRouteContract(input: PlayExecutionInput, playCall: PlayCall): RouteContract {
  return {
    routeContractId: `ROUTE-${input.scenario.toUpperCase()}-001`,
    pointA: input.pointA,
    pointB: input.pointB,
    packageId: input.packageId,
    packageType: "Governed Transaction Package",
    calledPlayId: playCall.playCallId,
    assignedCarrier: assignCarrier(input),
    requiredArtifacts: [
      "Raw Signal",
      "Captured Signal",
      "Verified Opportunity",
      "Activated Transaction State when consequence is financial",
      "Live System Record when receiving is complete"
    ],
    allowedAdjustments: [
      {
        condition: "Replay pressure appears",
        allowedAdjustment: "Route converts to Replay Containment",
        expectedDestination: "Refusal Gate",
        reviewEvidenceRequired: ["freshness check", "binding check", "replay refusal receipt"]
      },
      {
        condition: "Required artifact missing",
        allowedAdjustment: "Route converts to Checkpoint Hold or Refusal Gate",
        expectedDestination: "Held or Refused Arrival Receipt",
        reviewEvidenceRequired: ["missing artifact list", "decision timestamp", "authority boundary"]
      },
      {
        condition: "All required artifacts present",
        allowedAdjustment: "Continue to Verified Arrival",
        expectedDestination: "Arrived Safely",
        reviewEvidenceRequired: ["artifact chain", "custody receipts", "TIS decision"]
      }
    ],
    prohibitedBehaviors: [
      "AI may not redefine Point B",
      "AI may not change the package",
      "AI may not declare consequence",
      "carrier may not self-authorize movement",
      "display may not become authority",
      "transport may not become truth"
    ],
    timeoutRule: "If the carrier cannot confirm route, destination, or package, hold before movement.",
    fallbackRule: "If custody cannot be verified, route to SAFE_HOLD or REFUSAL_GATE.",
    consequenceRule: "Completion is accepted only after verified arrival and proof receipt."
  };
}

function makeCustodyReceipt(input: PlayExecutionInput): CustodyTransferReceipt {
  const ok = input.custodyAcknowledged;

  return {
    transferId: `CUSTODY-${input.scenario.toUpperCase()}-001`,
    from: "RATE play-call layer",
    to: "WFCⓈ / Motion Intelligence courier",
    packageId: input.packageId,
    acknowledgedPackage: ok,
    acknowledgedRoute: ok,
    acknowledgedDestination: ok,
    custodyPreserved: ok,
    notes: ok
      ? [
          "Throw is not catch. Carrier acknowledged package, route, and destination.",
          "Bounded custody transferred. Authority did not transfer."
        ]
      : [
          "Custody was not acknowledged.",
          "Movement must hold or refuse before consequence."
        ]
  };
}

function decideOutcome(input: PlayExecutionInput): PlayOutcome {
  if (!input.custodyAcknowledged) return "FUMBLE_PREVENTED";

  if (input.defensePressure === "REPLAY_ATTEMPT") return "INTERCEPTION_BLOCKED";

  if (input.defensePressure === "INTERCEPTION_ATTEMPT") return "INTERCEPTION_BLOCKED";

  if (input.defensePressure === "FALSE_CONSEQUENCE_ATTEMPT") return "REFUSED_AT_GATE";

  if (!input.requiredArtifactsPresent && input.scenario === "held") return "HELD_AT_CHECKPOINT";

  if (!input.requiredArtifactsPresent) return "REFUSED_AT_GATE";

  return "TOUCHDOWN_VERIFIED";
}

function makeFilmReview(
  input: PlayExecutionInput,
  playCall: PlayCall,
  routeContract: RouteContract,
  custodyReceipts: CustodyTransferReceipt[],
  finalOutcome: PlayOutcome
): FilmReviewRecord {
  return {
    reviewId: `FILM-${input.scenario.toUpperCase()}-001`,
    playCall,
    routeContract,
    custodyReceipts,
    defensePressure: input.defensePressure,
    observedCondition:
      input.defensePressure === "NONE"
        ? "No adversarial pressure detected."
        : `${input.defensePressure} detected during route.`,
    finalOutcome,
    accountability: {
      whoCalledPlay: "RATE",
      whoAssignedCarrier: "RATE under AIVA authority",
      whoHeldAuthority: "AIVA / RATE / stage authority according to artifact chain",
      whoCarriedPackage: routeContract.assignedCarrier.carrierName,
      failureOwnerIfAny:
        finalOutcome === "TOUCHDOWN_VERIFIED"
          ? "None. Verified arrival completed."
          : finalOutcome === "HELD_AT_CHECKPOINT"
          ? "No failure assigned. System held due to incomplete certainty."
          : "No release failure. System blocked invalid consequence."
    },
    governingLaw: [
      "AI is not authority.",
      "No orphaned AI action.",
      "Known playbook. Protected play call. Verified execution.",
      "The route may vary. The law does not.",
      "Authority must never move faster than verification.",
      "Completion is accepted only after verified arrival."
    ]
  };
}

export function executePlay(input: PlayExecutionInput): PlayExecutionResult {
  const playCall = makePlayCall(input);
  const routeContract = makeRouteContract(input, playCall);
  const custodyReceipt = makeCustodyReceipt(input);
  const finalOutcome = decideOutcome(input);
  const filmReview = makeFilmReview(
    input,
    playCall,
    routeContract,
    [custodyReceipt],
    finalOutcome
  );

  return {
    status: finalOutcome,
    playCall,
    routeContract,
    custodyReceipts: [custodyReceipt],
    filmReview
  };
}
