import type {
  AgreementSealRefusal,
} from "./agreementSealBridgeTypes.js";

export function deriveAgreementSealRefusal(input: {
  sealReady: boolean;
  governedSecuringSourcePresent: boolean;
  missingRequiredKeys: string[];
  conflictMessages: string[];
}): AgreementSealRefusal | null {
  if (input.sealReady) {
    return null;
  }

  if (input.conflictMessages.length > 0) {
    return {
      refusalCode: "CONFLICT_PRESENT",
      refusalReason: "Agreement sealing refused because normalized inputs conflict.",
      missingRequiredKeys: input.missingRequiredKeys,
      conflictMessages: input.conflictMessages,
    };
  }

  if (!input.governedSecuringSourcePresent) {
    return {
      refusalCode: "NO_GOVERNED_SECURING_SOURCE",
      refusalReason: "Agreement sealing refused because no governed securing source exists.",
      missingRequiredKeys: input.missingRequiredKeys,
      conflictMessages: input.conflictMessages,
    };
  }

  if (input.missingRequiredKeys.length > 0) {
    return {
      refusalCode: "MISSING_REQUIRED_FIELDS",
      refusalReason: "Agreement sealing refused because required normalized fields are missing.",
      missingRequiredKeys: input.missingRequiredKeys,
      conflictMessages: input.conflictMessages,
    };
  }

  return {
    refusalCode: "SEAL_NOT_READY",
    refusalReason: "Agreement sealing refused because seal readiness was not satisfied.",
    missingRequiredKeys: input.missingRequiredKeys,
    conflictMessages: input.conflictMessages,
  };
}