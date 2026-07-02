import { AnalogCustodyRecord, AnalogObservation } from "./hybridContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createAnalogCustodyRecord(input: {
  observation: AnalogObservation;
  createdBy: string;
  sourceReference: string;
  storageLocation?: string;
  possessionState?: AnalogCustodyRecord["possessionState"];
  sourceDescription: string;
}): AnalogCustodyRecord {
  const limitations: string[] = [];

  if (!input.observation.observationId) limitations.push("OBSERVATION_ID_REQUIRED");
  if (!input.createdBy) limitations.push("CUSTODY_CREATOR_REQUIRED");
  if (!input.sourceReference || input.sourceReference.trim().length < 3) limitations.push("SOURCE_REFERENCE_REQUIRED");
  if (!input.sourceDescription || input.sourceDescription.trim().length < 8) limitations.push("SOURCE_DESCRIPTION_REQUIRED");
  if (!input.observation.humanPresent) limitations.push("HUMAN_CUSTODIAN_REQUIRED");

  const custodyComplete = limitations.length === 0;

  return {
    custodyId: id("analog-custody"),
    observationId: input.observation.observationId,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    sourceType: input.observation.realitySource === "physical_document"
      ? "physical_document"
      : input.observation.realitySource === "image"
        ? "image"
        : input.observation.realitySource === "spoken_statement"
          ? "spoken_statement"
          : input.observation.realitySource === "environmental_signal"
            ? "environmental_signal"
            : "other",
    sourceReference: input.sourceReference,
    storageLocation: input.storageLocation,
    possessionState: input.possessionState || "held_for_review",
    custodyStatus: custodyComplete ? "custody_recorded" : "custody_incomplete",
    humanCustodianPresent: input.observation.humanPresent,
    sourceDescription: input.sourceDescription,
    limitations,
    authorityBoundary: {
      custodyRecordIsNotTruth: true,
      sourceReferenceIsNotAuthority: true,
      humanCustodyRequired: true,
      aiDoesNotOwnSource: true
    }
  };
}

export function custodyAllowsSourceReference(custody: AnalogCustodyRecord) {
  return custody.custodyStatus === "custody_recorded" && custody.humanCustodianPresent === true;
}
