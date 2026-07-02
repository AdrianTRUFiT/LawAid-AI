export type UtilityDomain =
  | "SMART_CITY"
  | "SMALL_TOWN"
  | "SUPPLY_CHAIN"
  | "DISTRIBUTION"
  | "LEGAL"
  | "FINANCIAL"
  | "TRAVEL"
  | "MEDICAL"
  | "CONSTRUCTION"
  | "GENERAL";

export type BoxState =
  | "CREATED"
  | "TAGGED"
  | "ROUTED"
  | "SCHEDULED"
  | "TRANSACTION_READY"
  | "HIL_READY"
  | "HELD"
  | "BLOCKED";

export type ProjectBox = {
  boxId: string;
  domain: UtilityDomain;
  category: string;
  tags: string[];
  artifactId: string;
  custodyRequired: boolean;
  routingRequired: boolean;
  schedulingRequired: boolean;
  transactionRequired: boolean;
  verified: boolean;
  state: BoxState;
  createdAt: number;
};

export type UtilityDecision = {
  decision: "CONTINUE" | "HOLD" | "BLOCK";
  nextState: BoxState;
  reason: string;
};
