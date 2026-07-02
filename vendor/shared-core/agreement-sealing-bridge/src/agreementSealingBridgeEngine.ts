import type {
  AgreementSealBridgeInput,
  AgreementSealingBridgeResult,
} from "./agreementSealBridgeTypes.js";
import { buildSealedAgreementArtifact } from "./artifactBuilder.js";
import { deriveAgreementSealRefusal } from "./refusalLogic.js";

export function runAgreementSealingBridge(
  input: AgreementSealBridgeInput,
): AgreementSealingBridgeResult {
  const readiness = input.normalizationResult.agreementSealReadiness;
  const context = input.normalizationResult.normalizedContext;

  const refusal = deriveAgreementSealRefusal({
    sealReady: readiness.sealReady,
    governedSecuringSourcePresent: readiness.governedSecuringSourcePresent,
    missingRequiredKeys: readiness.missingRequiredKeys,
    conflictMessages: readiness.conflictMessages,
  });

  if (refusal) {
    return {
      status: "REFUSED",
      sealedArtifact: null,
      refusal,
      inputSummary: {
        scenarioId: context.scenarioId,
        bundleId: context.bundleId,
        sealReady: readiness.sealReady,
        conflictCount: readiness.conflictMessages.length,
        normalizedFieldCount: context.normalizedFields.length,
      },
    };
  }

  const sealedArtifact = buildSealedAgreementArtifact({
    normalizationResult: input.normalizationResult,
    parties: input.parties,
  });

  return {
    status: "SEALED",
    sealedArtifact,
    refusal: null,
    inputSummary: {
      scenarioId: context.scenarioId,
      bundleId: context.bundleId,
      sealReady: readiness.sealReady,
      conflictCount: readiness.conflictMessages.length,
      normalizedFieldCount: context.normalizedFields.length,
    },
  };
}