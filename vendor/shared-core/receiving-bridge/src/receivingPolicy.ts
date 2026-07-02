import type { ReceivingPolicy } from "./contracts.js";

export function createDefaultReceivingPolicy(): ReceivingPolicy {
  return {
    requiredActivationStatus: "activated",
    requiredComplianceStatus: "compliant",
    trustScope: "receiving",
    artifactType: "LiveSystemRecord",
    receivingEnvironment: "generic-receiving-environment",
  };
}