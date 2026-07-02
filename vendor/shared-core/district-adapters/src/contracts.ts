import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";

export type DistrictType =
  | "LAWAIDAI"
  | "TRAVELFLOW"
  | "GENERIC";

export interface DistrictAdapterManifest {
  districtType: DistrictType;
  displayName: string;
  ownsInfrastructure: false;
  consumesLiveSystemRecord: true;
  domainFocus: string;
}

export interface DistrictRecordPacketBase {
  packetId: string;
  districtType: DistrictType;
  sourceLiveRecordId: string;
  ownerId: string;
  merchantId: string;
  jurisdictionCode: string;
  receivedAt: string;
  summary: string;
}

export interface LawAidAIPacket extends DistrictRecordPacketBase {
  districtType: "LAWAIDAI";
  matterStatus: "open";
  evidenceAnchorIds: string[];
  billingVisibility: {
    settlementCurrency: string;
    settlementAmount: number;
    displayCurrency: string;
    displayAmount: number;
  };
  intakeLane: "client_positioning";
}

export interface TravelFlowPacket extends DistrictRecordPacketBase {
  districtType: "TRAVELFLOW";
  tripStatus: "ready";
  bookingAnchorIds: string[];
  valueVisibility: {
    settlementCurrency: string;
    settlementAmount: number;
    displayCurrency: string;
    displayAmount: number;
  };
  routingLane: "travel_orchestration";
}

export interface GenericDistrictPacket extends DistrictRecordPacketBase {
  districtType: "GENERIC";
  domainState: "active";
  tags: string[];
}

export type DistrictPacket =
  | LawAidAIPacket
  | TravelFlowPacket
  | GenericDistrictPacket;

export interface DistrictAdapterResult {
  accepted: boolean;
  districtType: DistrictType;
  reason: string;
  packet: DistrictPacket | null;
}

export interface DistrictIngressValidationResult {
  accepted: boolean;
  reason: string;
  liveSystemRecord: LiveSystemRecord | null;
}