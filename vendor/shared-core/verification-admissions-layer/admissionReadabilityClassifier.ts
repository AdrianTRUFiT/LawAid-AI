import type { AdmissionReadabilityState, AdmissionReasonCode } from "./admissionReadabilityContracts";
import { buildAdmissionFingerprint } from "./admissionFingerprint";

export function classifyAdmissionReadability(rawText: string, normalizedText: string): {
  readabilityState: AdmissionReadabilityState;
  reasonCodes: AdmissionReasonCode[];
} {
  const fp = buildAdmissionFingerprint(rawText, normalizedText);
  const reasonCodes: AdmissionReasonCode[] = [];

  if (fp.visibleCharCount < 12) {
    reasonCodes.push("VISIBLE_TEXT_MISSING");
    return {
      readabilityState: "ADMISSION_UNREADABLE",
      reasonCodes
    };
  }

  if (fp.printableRatio < 0.7) {
    reasonCodes.push("PRINTABLE_RATIO_TOO_LOW");
    return {
      readabilityState: "ADMISSION_UNREADABLE",
      reasonCodes
    };
  }

  reasonCodes.push("VISIBLE_TEXT_PRESENT");
  return {
    readabilityState: "ADMISSION_READABLE",
    reasonCodes
  };
}
