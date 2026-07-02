export type SimulationArtifactType =
  | "RAW_SIGNAL"
  | "CAPTURED_SIGNAL"
  | "VERIFIED_OPPORTUNITY"
  | "ACTIVATED_TRANSACTION_STATE"
  | "LIVE_SYSTEM_RECORD"
  | "CLOSURE_RECORD";

export type SimulationNode =
  | "IDENTITY"
  | "CREATOR_VENDOR"
  | "OFFER"
  | "SIGNAL"
  | "INTAKE"
  | "QUALIFICATION"
  | "TRANSACTION"
  | "ACCESS"
  | "FULFILLMENT"
  | "COMMUNICATION"
  | "USER_VISIBILITY"
  | "OPERATOR_VISIBILITY"
  | "CLOSURE"
  | "AUDIT";

export type SimulationArtifact = {
  artifactId: string;
  type: SimulationArtifactType;
  node: SimulationNode;
  parentArtifactId?: string;
  status: "ACTIVE" | "REFUSED";
  reason?: string;
  createdAt: number;
};

export const ARTIFACT_ORDER: SimulationArtifactType[] = [
  "RAW_SIGNAL",
  "CAPTURED_SIGNAL",
  "VERIFIED_OPPORTUNITY",
  "ACTIVATED_TRANSACTION_STATE",
  "LIVE_SYSTEM_RECORD",
  "CLOSURE_RECORD"
];
