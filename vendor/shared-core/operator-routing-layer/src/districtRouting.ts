import {
  adaptLiveRecordToGenericDistrict,
  adaptLiveRecordToLawAidAI,
  adaptLiveRecordToTravelFlow,
  type DistrictAdapterResult,
  type DistrictType,
} from "../../district-adapters/src/index.js";
import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";

export function routeLiveRecordToDistrict(input: {
  districtType: DistrictType;
  liveSystemRecord: LiveSystemRecord;
  evidenceAnchorIds?: string[];
  bookingAnchorIds?: string[];
  genericTags?: string[];
}): DistrictAdapterResult {
  if (input.districtType === "LAWAIDAI") {
    return adaptLiveRecordToLawAidAI({
      incoming: input.liveSystemRecord,
      evidenceAnchorIds: input.evidenceAnchorIds,
    });
  }

  if (input.districtType === "TRAVELFLOW") {
    return adaptLiveRecordToTravelFlow({
      incoming: input.liveSystemRecord,
      bookingAnchorIds: input.bookingAnchorIds,
    });
  }

  return adaptLiveRecordToGenericDistrict({
    incoming: input.liveSystemRecord,
    tags: input.genericTags,
  });
}