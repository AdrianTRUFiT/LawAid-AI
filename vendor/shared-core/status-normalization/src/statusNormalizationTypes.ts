export type StatusDomain =
  | "slot"
  | "booking"
  | "agreement"
  | "commitment"
  | "transport"
  | "generic";

export type CanonicalStatus =
  | "OPEN"
  | "RESERVED"
  | "OCCUPIED"
  | "BLOCKED"
  | "AUTHORIZATION_REQUIRED"
  | "SEALED"
  | "BOOKING_READY"
  | "COMMITMENT_READY"
  | "IN_TRANSIT"
  | "RELEASED"
  | "REFUSED"
  | "UNKNOWN";

export interface StatusNormalizationInput {
  sourceSystem: string;
  domain: StatusDomain;
  rawStatus: string;
}

export interface StatusNormalizationOutput {
  sourceSystem: string;
  domain: StatusDomain;
  rawStatus: string;
  canonicalStatus: CanonicalStatus;
  recognized: boolean;
  reason: string;
}

export interface StatusNormalizationRefusal {
  refusalCode:
    | "INVALID_STATUS"
    | "INVALID_DOMAIN"
    | "EMPTY_STATUS";
  refusalReason: string;
}

export interface StatusNormalizationResult {
  ok: boolean;
  output: StatusNormalizationOutput | null;
  refusal: StatusNormalizationRefusal | null;
}