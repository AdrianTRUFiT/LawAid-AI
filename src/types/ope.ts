export type OpeActorType = "consumer" | "merchant" | "operator";
export type OpeStage =
  | "entered"
  | "onboarded"
  | "experience_selected"
  | "purchase_approved"
  | "fulfilled"
  | "settled"
  | "exception";

export type OpeEventType =
  | "entry"
  | "onboarding"
  | "selection"
  | "approval"
  | "purchase"
  | "fulfillment"
  | "exception"
  | "fix"
  | "allocation"
  | "settlement";

export interface OpeConsumer {
  id: string;
  name: string;
  budget: number;
  remainingBudget: number;
  preferences: string[];
  status: "active" | "paused" | "completed";
}

export interface OpeMerchant {
  id: string;
  name: string;
  category: string;
  availability: string;
  riskFlags: string[];
  fulfilledCount: number;
  revenueCents: number;
}

export interface OpeOperator {
  id: string;
  name: string;
  anomalyCount: number;
  settledCents: number;
  allocationCents: number;
}

export interface OpeExperience {
  id: string;
  label: string;
  merchantId: string;
  priceCents: number;
  category: string;
  requiresApproval: boolean;
}

export interface OpeEvent {
  id: string;
  type: OpeEventType;
  stage: OpeStage;
  actorType: OpeActorType;
  actorId: string;
  subjectId: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface OpeState {
  consumer: OpeConsumer;
  merchant: OpeMerchant;
  operator: OpeOperator;
  experiences: OpeExperience[];
  selectedExperienceId?: string;
  currentStage: OpeStage;
  events: OpeEvent[];
  openException?: {
    code: string;
    message: string;
    fixMessage: string;
  };
}
