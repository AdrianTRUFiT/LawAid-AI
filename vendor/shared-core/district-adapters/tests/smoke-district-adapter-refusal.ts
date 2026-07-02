import { adaptLiveRecordToGenericDistrict } from "../src/index.js";

const malformed = {
  liveRecordId: "bad_001",
  recordStatus: "live",
};

const adapted = adaptLiveRecordToGenericDistrict({
  incoming: malformed,
  tags: ["test"],
});

if (adapted.accepted || adapted.districtType !== "GENERIC") {
  throw new Error("Expected generic adapter refusal.");
}

console.log("SMOKE_DISTRICT_ADAPTER_REFUSAL=PASS");