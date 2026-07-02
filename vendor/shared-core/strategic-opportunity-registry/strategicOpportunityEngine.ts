import { StrategicOpportunityClassificationInput } from "./strategicOpportunityContracts";
import { createStrategicOpportunityRecord } from "./strategicOpportunityClassifier";
import { recordOpportunityCaptured } from "./strategicOpportunityLedger";

export function captureStrategicOpportunity(input: StrategicOpportunityClassificationInput) {
  const record = createStrategicOpportunityRecord(input);
  const ledgerEntry = recordOpportunityCaptured(record);

  return {
    record,
    ledgerEntry,
    boundary: {
      capturedSignalIsNotDoctrine: true,
      capturedSignalIsNotBuildAuthorization: true,
      capturedSignalIsNotProductCommitment: true
    }
  };
}

export function surfaceCodeNow(records: ReturnType<typeof createStrategicOpportunityRecord>[]) {
  return records.filter((record) => record.status === "CODE_NOW");
}
