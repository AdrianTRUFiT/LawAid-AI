import { ProjectBox, UtilityDecision } from './utilityContainerContracts';
import {
  SMART_CITY_SUPPLY_CHAIN_PROFILE,
  SUPPLY_CHAIN_PROFILE,
  FINANCIAL_PROFILE,
  LEGAL_PROFILE,
  SmartUtilityProfile
} from './smartUtilityProfiles';

function profileFor(box: ProjectBox): SmartUtilityProfile | null {
  if (box.domain === "SMART_CITY") return SMART_CITY_SUPPLY_CHAIN_PROFILE;
  if (box.domain === "SUPPLY_CHAIN" || box.domain === "DISTRIBUTION") return SUPPLY_CHAIN_PROFILE;
  if (box.domain === "FINANCIAL") return FINANCIAL_PROFILE;
  if (box.domain === "LEGAL") return LEGAL_PROFILE;
  return null;
}

export function evaluateSmartUtilityReadiness(box: ProjectBox): UtilityDecision {
  const profile = profileFor(box);

  if (!profile) {
    return {
      decision: "HOLD",
      nextState: "HELD",
      reason: "NO_SMART_UTILITY_PROFILE"
    };
  }

  for (const tag of profile.requiredTags) {
    if (!box.tags.includes(tag)) {
      return {
        decision: "HOLD",
        nextState: "HELD",
        reason: "SMART_UTILITY_REQUIRED_TAG_MISSING_" + tag.toUpperCase()
      };
    }
  }

  if (profile.humanOverrideRequired && !box.tags.includes("human_override")) {
    return {
      decision: "BLOCK",
      nextState: "BLOCKED",
      reason: "HUMAN_OVERRIDE_REQUIRED"
    };
  }

  if (profile.autonomousTransactionAllowed && !box.tags.includes("agent_policy")) {
    return {
      decision: "BLOCK",
      nextState: "BLOCKED",
      reason: "AUTONOMOUS_AGENT_POLICY_REQUIRED"
    };
  }

  return {
    decision: "CONTINUE",
    nextState: "HIL_READY",
    reason: "SMART_UTILITY_READY"
  };
}
