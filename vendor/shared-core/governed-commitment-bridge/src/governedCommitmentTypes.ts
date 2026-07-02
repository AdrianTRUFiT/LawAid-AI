import type { AgreementSealingBridgeResult } from "../../agreement-sealing-bridge/src/index.js";
import type { LogisticsBookingBridgeResult } from "../../logistics-booking-bridge/src/index.js";

export type GovernedCommitmentStatus =
  | "COMMITMENT_READY"
  | "REFUSED";

export interface CommitmentParty {
  role: "originator" | "counterparty" | "carrier" | "system";
  partyId: string;
}

export interface GovernedCommitmentArtifact {
  commitmentId: string;
  agreementId: string;
  bookingId: string;
  queryId: string;
  origin: string;
  destination: string;
  objective: "fastest" | "cheapest" | "balanced";
  selectedRouteId: string;
  selectedSlotId: string;
  selectedNodeId: string;
  selectedLaneId: string;
  slotState: string;
  authorizationRequired: boolean;
  authorizationSatisfied: boolean;
  estimatedHoursToDestination: number;
  distanceToDestinationKm: number;
  estimatedCost: number;
  currencyCode: string;
  languageCode: string;
  unitSystem: "imperial" | "metric";
  locale: string;
  agreementSealHash: string;
  bookingHash: string;
  commitmentHash: string;
  continuityHash: string;
  createdAt: string;
  parties: CommitmentParty[];
}

export interface GovernedCommitmentRefusal {
  refusalCode:
    | "AGREEMENT_MISSING"
    | "BOOKING_MISSING"
    | "AGREEMENT_NOT_SEALED"
    | "BOOKING_NOT_READY"
    | "ROUTE_MISMATCH"
    | "ORIGIN_DESTINATION_MISMATCH"
    | "AUTHORIZATION_INCOMPLETE"
    | "SLOT_STATE_INELIGIBLE";
  refusalReason: string;
}

export interface GovernedCommitmentBridgeInput {
  agreementResult: AgreementSealingBridgeResult;
  bookingResult: LogisticsBookingBridgeResult;
  parties?: CommitmentParty[];
}

export interface GovernedCommitmentBridgeResult {
  status: GovernedCommitmentStatus;
  commitmentArtifact: GovernedCommitmentArtifact | null;
  refusal: GovernedCommitmentRefusal | null;
  inputSummary: {
    agreementStatus: string;
    bookingStatus: string;
    agreementId?: string;
    bookingId?: string;
    queryId?: string;
  };
}