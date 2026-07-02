export type RateStage =
  | "DICE_RECRUIT"
  | "AIOP_ACQUIRE"
  | "FUNDTRACKER_TRANSACT"
  | "RECEIVING_ENVIRONMENT";

export type PlayOutcome =
  | "TOUCHDOWN_VERIFIED"
  | "HELD_AT_CHECKPOINT"
  | "REFUSED_AT_GATE"
  | "FUMBLE_PREVENTED"
  | "INTERCEPTION_BLOCKED";

export type CarrierType =
  | "WFC_COURIER"
  | "SLIM_CARRIER"
  | "LLM_PROCESSOR"
  | "HUMAN_OPERATOR"
  | "RATE_STAGE";

export type DefensePressure =
  | "NONE"
  | "REPLAY_ATTEMPT"
  | "INTERCEPTION_ATTEMPT"
  | "MISROUTE_ATTEMPT"
  | "FALSE_CONSEQUENCE_ATTEMPT"
  | "FORCED_FUMBLE_ATTEMPT";

export type RouteAdjustment = {
  condition: string;
  allowedAdjustment: string;
  expectedDestination: string;
  reviewEvidenceRequired: string[];
};

export type RouteContract = {
  routeContractId: string;
  pointA: string;
  pointB: string;
  packageId: string;
  packageType: string;
  calledPlayId: string;
  assignedCarrier: CarrierAssignment;
  requiredArtifacts: string[];
  allowedAdjustments: RouteAdjustment[];
  prohibitedBehaviors: string[];
  timeoutRule: string;
  fallbackRule: string;
  consequenceRule: string;
};

export type CarrierAssignment = {
  carrierId: string;
  carrierType: CarrierType;
  carrierName: string;
  custodyScope: "BOUNDED_CUSTODY_ONLY";
  authorityScope: "NO_AUTHORITY";
  parentAuthority: string;
  mustAcknowledge: string[];
};

export type PlayCall = {
  playCallId: string;
  playName: string;
  selectedBy: "RATE";
  authorizedBy: "AIVA";
  currentStage: RateStage;
  objective: string;
  protectedLiveCall: boolean;
  publicPlaybookVisible: boolean;
  reasonCalled: string;
};

export type CustodyTransferReceipt = {
  transferId: string;
  from: string;
  to: string;
  packageId: string;
  acknowledgedPackage: boolean;
  acknowledgedRoute: boolean;
  acknowledgedDestination: boolean;
  custodyPreserved: boolean;
  notes: string[];
};

export type FilmReviewRecord = {
  reviewId: string;
  playCall: PlayCall;
  routeContract: RouteContract;
  custodyReceipts: CustodyTransferReceipt[];
  defensePressure: DefensePressure;
  observedCondition: string;
  finalOutcome: PlayOutcome;
  accountability: {
    whoCalledPlay: string;
    whoAssignedCarrier: string;
    whoHeldAuthority: string;
    whoCarriedPackage: string;
    failureOwnerIfAny: string;
  };
  governingLaw: string[];
};

export type PlayExecutionInput = {
  scenario: "approved" | "held" | "refused" | "replay";
  packageId: string;
  pointA: string;
  pointB: string;
  currentStage: RateStage;
  requiredArtifactsPresent: boolean;
  custodyAcknowledged: boolean;
  defensePressure: DefensePressure;
};

export type PlayExecutionResult = {
  status: PlayOutcome;
  playCall: PlayCall;
  routeContract: RouteContract;
  custodyReceipts: CustodyTransferReceipt[];
  filmReview: FilmReviewRecord;
};
