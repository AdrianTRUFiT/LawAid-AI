import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";
import type { DistrictAdapterResult, GenericDistrictPacket } from "./contracts.js";
import { validateLiveSystemRecordForDistrict } from "./validators.js";

function makePacketId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function adaptLiveRecordToGenericDistrict(input: {
  incoming: unknown;
  tags?: string[];
}): DistrictAdapterResult {
  const validation = validateLiveSystemRecordForDistrict(input.incoming);

  if (!validation.accepted || !validation.liveSystemRecord) {
    return {
      accepted: false,
      districtType: "GENERIC",
      reason: validation.reason,
      packet: null,
    };
  }

  const record: LiveSystemRecord = validation.liveSystemRecord;

  const packet: GenericDistrictPacket = {
    packetId: makePacketId("generic"),
    districtType: "GENERIC",
    sourceLiveRecordId: record.liveRecordId,
    ownerId: record.ownerId,
    merchantId: record.merchantId,
    jurisdictionCode: record.jurisdictionCode,
    receivedAt: new Date().toISOString(),
    summary: `Generic packet created from live record ${record.liveRecordId}.`,
    domainState: "active",
    tags: input.tags ?? [],
  };

  return {
    accepted: true,
    districtType: "GENERIC",
    reason: "Live system record adapted for generic district.",
    packet,
  };
}