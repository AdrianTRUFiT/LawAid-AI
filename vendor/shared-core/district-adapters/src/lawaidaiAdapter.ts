import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";
import type { DistrictAdapterResult, LawAidAIPacket } from "./contracts.js";
import { validateLiveSystemRecordForDistrict } from "./validators.js";

function makePacketId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function adaptLiveRecordToLawAidAI(input: {
  incoming: unknown;
  evidenceAnchorIds?: string[];
}): DistrictAdapterResult {
  const validation = validateLiveSystemRecordForDistrict(input.incoming);

  if (!validation.accepted || !validation.liveSystemRecord) {
    return {
      accepted: false,
      districtType: "LAWAIDAI",
      reason: validation.reason,
      packet: null,
    };
  }

  const record: LiveSystemRecord = validation.liveSystemRecord;

  const packet: LawAidAIPacket = {
    packetId: makePacketId("lawaidai"),
    districtType: "LAWAIDAI",
    sourceLiveRecordId: record.liveRecordId,
    ownerId: record.ownerId,
    merchantId: record.merchantId,
    jurisdictionCode: record.jurisdictionCode,
    receivedAt: new Date().toISOString(),
    summary: `Legal packet created from live record ${record.liveRecordId}.`,
    matterStatus: "open",
    evidenceAnchorIds: input.evidenceAnchorIds ?? [],
    billingVisibility: {
      settlementCurrency: record.settlementCurrency,
      settlementAmount: record.settlementAmount,
      displayCurrency: record.displayCurrency,
      displayAmount: record.displayAmount,
    },
    intakeLane: "client_positioning",
  };

  return {
    accepted: true,
    districtType: "LAWAIDAI",
    reason: "Live system record adapted for LawAidAI.",
    packet,
  };
}