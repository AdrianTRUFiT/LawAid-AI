import {
  GovernedAutomationRequest,
  GovernedAutomationReadinessPacket,
  GovernedState
} from "./governedAutomationContracts";
import { GOVERNED_AUTOMATION_CATEGORY, GOVERNED_AUTOMATION_DOCTRINE } from "./governedAutomationDefinitions";
import { getMissingGovernanceRequirements } from "./governedAutomationReadiness";
import { isCapabilityLayer } from "./governedAutomationLayerMap";

export function evaluateGovernedAutomation(request: GovernedAutomationRequest): GovernedAutomationReadinessPacket {
  const refusalCodes: string[] = [];

  if (isCapabilityLayer(request.actorLayer) && request.requestedConsequenceExecution) {
    refusalCodes.push(`${request.actorLayer}_CANNOT_AUTHORIZE_CONSEQUENCE`);
  }

  if (request.actorLayer === "GEL" && !request.ariReady) refusalCodes.push("GEL_WITHOUT_ARI_READY");
  if (request.actorLayer === "GEL" && !request.tisAuthority) refusalCodes.push("GEL_WITHOUT_TIS_AUTHORITY");
  if (request.actorLayer === "GEL" && !request.vapProofReady) refusalCodes.push("GEL_WITHOUT_VAP_PROOF");
  if (request.humanCustodyRequired && !request.humanCustodyPresent) refusalCodes.push("HUMAN_CUSTODY_REQUIRED_ABSENT");

  const missingGovernanceRequirements = getMissingGovernanceRequirements(request);

  let state: GovernedState = "SAFE";

  if (refusalCodes.length > 0) {
    state = "REFUSED";
  } else if (missingGovernanceRequirements.length > 0) {
    state = "HOLD";
  }

  return {
    state,
    category: GOVERNED_AUTOMATION_CATEGORY,
    layerStatus: {
      actorLayer: request.actorLayer,
      ariReady: request.ariReady,
      tisAuthority: request.tisAuthority,
      vapProofReady: request.vapProofReady,
      humanCustodyPresent: request.humanCustodyPresent
    },
    missingGovernanceRequirements,
    consequenceEligible: state === "SAFE",
    proofRequired: true,
    humanCustodyRequired: request.humanCustodyRequired,
    refusalCodes,
    doctrine: GOVERNED_AUTOMATION_DOCTRINE
  };
}
