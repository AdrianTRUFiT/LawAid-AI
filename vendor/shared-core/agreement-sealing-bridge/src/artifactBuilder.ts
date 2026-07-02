import type {
  AgreementParty,
  SealedAgreementArtifact,
} from "./agreementSealBridgeTypes.js";
import { makeId, nowIso, sha256, stableStringify } from "./agreementSealBridgeUtils.js";
import type { InputTrustNormalizationResult } from "../../input-trust-normalization-layer/src/index.js";

export function buildSealedAgreementArtifact(input: {
  normalizationResult: InputTrustNormalizationResult;
  parties?: AgreementParty[];
}): SealedAgreementArtifact {
  const context = input.normalizationResult.normalizedContext;
  const readiness = input.normalizationResult.agreementSealReadiness;

  const parties: AgreementParty[] =
    input.parties && input.parties.length > 0
      ? input.parties
      : [
          { role: "originator", partyId: "originator-default" },
          { role: "system", partyId: "aiva-system" },
        ];

  const continuityHash = sha256(
    stableStringify({
      bundleId: context.bundleId,
      scenarioId: context.scenarioId,
      origin: context.origin,
      destination: context.destination,
      localization: context.localization,
      paymentStyle: context.paymentStyle,
      normalizedFields: context.normalizedFields.map((x) => ({
        key: x.key,
        semanticType: x.semanticType,
        normalizedValue: x.normalizedValue,
        acceptedFromSourceId: x.acceptedFromSourceId,
        acceptedFromTrustLevel: x.acceptedFromTrustLevel,
      })),
      sealHash: readiness.sealHash,
      parties,
    }),
  );

  return {
    agreementId: makeId("agreement"),
    bundleId: context.bundleId,
    scenarioId: context.scenarioId,
    origin: context.origin ?? "",
    destination: context.destination ?? "",
    languageCode: context.localization.languageCode,
    currencyCode: context.localization.currencyCode,
    unitSystem: context.localization.unitSystem,
    locale: context.localization.locale,
    paymentStyle: context.paymentStyle,
    normalizedFieldCount: context.normalizedFields.length,
    securingSourcePresent: readiness.securingSourcePresent,
    governedSecuringSourcePresent: readiness.governedSecuringSourcePresent,
    sealHash: readiness.sealHash ?? "",
    continuityHash,
    createdAt: nowIso(),
    parties,
  };
}