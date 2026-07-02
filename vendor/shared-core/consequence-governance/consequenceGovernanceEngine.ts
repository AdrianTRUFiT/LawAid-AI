import {
  ConsequenceGovernanceInput,
  ConsequenceGovernanceDecision,
  ConsequenceGovernanceOutput
} from "./consequenceGovernanceTypes";

function output(
  decision: ConsequenceGovernanceOutput["decision"],
  reason: string,
  requiresApproval: boolean,
  approvalAuthority: ConsequenceGovernanceOutput["approvalAuthority"]
): ConsequenceGovernanceOutput {
  return {
    decision,
    reason,
    requiresApproval,
    approvalAuthority,
    governedAt: new Date().toISOString()
  };
}

export function governConsequence(input: ConsequenceGovernanceInput): ConsequenceGovernanceDecision {
  const mainOverrideActive = Boolean(input.contextOverride && input.overrideAuthority === "MAIN");

  if (input.adpResult === "MISSING" && !mainOverrideActive) {
    return {
      input,
      output: output(
        "REFUSED",
        "ADP=MISSING. Required asset state is missing. Consequence cannot proceed without MAIN override.",
        true,
        "Adrian"
      )
    };
  }

  if (input.airResult === "REFUSED" && !mainOverrideActive) {
    return {
      input,
      output: output(
        "REFUSED",
        "AIR=REFUSED. Downstream consequence path is refused by verified asset intelligence.",
        true,
        "Adrian"
      )
    };
  }

  if (input.adpResult === "INCOMPLETE") {
    return {
      input,
      output: output(
        "HOLD",
        "ADP=INCOMPLETE. Asset state is incomplete and requires confirmation before consequence movement.",
        true,
        "Adrian"
      )
    };
  }

  if (input.airResult === "HOLD") {
    return {
      input,
      output: output(
        "HOLD",
        "AIR=HOLD. Asset intelligence requires human confirmation before consequence movement.",
        true,
        "Adrian"
      )
    };
  }

  if (input.airResult === "SAFE" && input.adpResult === "PRESENT") {
    return {
      input,
      output: output(
        "PROCEED",
        "AIR=SAFE and ADP=PRESENT. Consequence may proceed under system authority.",
        false,
        "System"
      )
    };
  }

  if (mainOverrideActive) {
    return {
      input,
      output: output(
        "HOLD",
        "MAIN override present. Consequence requires Adrian approval before proceeding.",
        true,
        "Adrian"
      )
    };
  }

  return {
    input,
    output: output(
      "HOLD",
      "Unhandled governance combination. Defaulting to HOLD.",
      true,
      "Adrian"
    )
  };
}
