import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";
import type { DistrictAdapterResult, TravelFlowPacket } from "./contracts.js";
import { validateLiveSystemRecordForDistrict } from "./validators.js";

function makePacketId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function adaptLiveRecordToTravelFlow(input: {
  incoming: unknown;
  bookingAnchorIds?: string[];
}): DistrictAdapterResult {
  const validation = validateLiveSystemRecordForDistrict(input.incoming);

  if (!validation.accepted || !validation.liveSystemRecord) {
    return {
      accepted: false,
      districtType: "TRAVELFLOW",
      reason: validation.reason,
      packet: null,
    };
  }

  const record: LiveSystemRecord = validation.liveSystemRecord;

  const packet: TravelFlowPacket = {
    packetId: makePacketId("travelflow"),
    districtType: "TRAVELFLOW",
    sourceLiveRecordId: record.liveRecordId,
    ownerId: record.ownerId,
    merchantId: record.merchantId,
    jurisdictionCode: record.jurisdictionCode,
    receivedAt: new Date().toISOString(),
    summary: `Travel packet created from live record ${record.liveRecordId}.`,
    tripStatus: "ready",
    bookingAnchorIds: input.bookingAnchorIds ?? [],
    valueVisibility: {
      settlementCurrency: record.settlementCurrency,
      settlementAmount: record.settlementAmount,
      displayCurrency: record.displayCurrency,
      displayAmount: record.displayAmount,
    },
    routingLane: "travel_orchestration",
  };

  return {
    accepted: true,
    districtType: "TRAVELFLOW",
    reason: "Live system record adapted for TravelFlow.",
    packet,
  };
}