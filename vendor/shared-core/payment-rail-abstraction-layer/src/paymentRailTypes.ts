export type PaymentRailType =
  | "card"
  | "bank"
  | "crypto"
  | "stablecoin";

export interface PaymentRailRequest {
  subjectId: string;
  railType: PaymentRailType | string;
  provider: string;
  asset: string;
  amount: number;
  currency: string;
  region: string;
  environment: "sandbox" | "production";
  enabled?: boolean;
  metadata?: Record<string, string>;
}

export interface NormalizedPaymentRailArtifact {
  paymentRailId: string;
  subjectId: string;
  railType: PaymentRailType;
  provider: string;
  asset: string;
  amount: number;
  currency: string;
  region: string;
  environment: "sandbox" | "production";
  routeClass: "traditional" | "digital_asset";
  sourceRequestAccepted: boolean;
  reason: string;
  createdAt: string;
}

export interface PaymentRailRefusal {
  refusalCode:
    | "UNSUPPORTED_RAIL"
    | "DISABLED_RAIL"
    | "INVALID_AMOUNT"
    | "MISSING_PROVIDER";
  refusalReason: string;
}

export interface PaymentRailResult {
  ok: boolean;
  artifact: NormalizedPaymentRailArtifact | null;
  refusal: PaymentRailRefusal | null;
}