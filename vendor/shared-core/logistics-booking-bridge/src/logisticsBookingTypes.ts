import type { LogisticsSearchResponse } from "../../logistics-search-layer/src/index.js";
import type { SlotCapacitySearchResponse } from "../../slot-capacity-orchestration-layer/src/index.js";

export type LogisticsBookingStatus =
  | "BOOKING_READY"
  | "REFUSED";

export interface BookingParty {
  role: "shipper" | "carrier" | "system";
  partyId: string;
}

export interface LogisticsBookingArtifact {
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
  estimatedHoursToDestination: number;
  distanceToDestinationKm: number;
  estimatedCost: number;
  downstreamFrictionScore: number;
  checkpointBurdenScore: number;
  resistanceScore: number;
  routeTags: string[];
  routeRankReason: string;
  bookingHash: string;
  continuityHash: string;
  createdAt: string;
  parties: BookingParty[];
}

export interface LogisticsBookingRefusal {
  refusalCode:
    | "NO_USABLE_SLOT"
    | "BLOCKED_SLOT"
    | "OCCUPIED_SLOT"
    | "AUTHORIZATION_REQUIRED"
    | "NO_ROUTE_OPTIONS";
  refusalReason: string;
  slotId?: string;
  nodeId?: string;
}

export interface LogisticsBookingBridgeInput {
  searchResponse: LogisticsSearchResponse;
  slotResponse: SlotCapacitySearchResponse;
  parties?: BookingParty[];
  authorizationGranted?: boolean;
}

export interface LogisticsBookingBridgeResult {
  status: LogisticsBookingStatus;
  bookingArtifact: LogisticsBookingArtifact | null;
  refusal: LogisticsBookingRefusal | null;
  inputSummary: {
    queryId: string;
    routeCount: number;
    slotCount: number;
    bestRouteId?: string;
    bestSlotId?: string;
  };
}