import type {
  GovernanceClassification,
  GovernanceTrigger
} from "./governanceEngineContracts";

export function classifyTrigger(trigger: GovernanceTrigger): GovernanceClassification {
  const reasons: string[] = [];

  const incomplete =
    !trigger.triggerId ||
    !trigger.sourceRecordId ||
    !trigger.sourceParent ||
    !trigger.receivingParent ||
    !trigger.createdAt ||
    trigger.triggerKind === "UNKNOWN";

  const conflicting =
    trigger.triggerKind === "CERTIFIED_READY" &&
    trigger.hilReadyStatus === "HOLD_BEFORE_HIL";

  const deferred =
    trigger.triggerKind === "CERTIFIED_HOLD" ||
    trigger.hilReadyStatus === "HOLD_BEFORE_HIL";

  if (incomplete) {
    reasons.push("INCOMPLETE_TRIGGER");
  }

  if (conflicting) {
    reasons.push("CONFLICTING_TRIGGER");
  }

  if (deferred) {
    reasons.push("DEFERRED_TRIGGER");
  }

  if (incomplete) {
    return {
      triggerState: "TRIGGER_DETECTED",
      classificationState: "CLASSIFIED_INVALID",
      valid: false,
      deferred: false,
      conflicting,
      incomplete: true,
      reasons
    };
  }

  if (conflicting) {
    return {
      triggerState: "TRIGGER_DETECTED",
      classificationState: "CLASSIFIED_INVALID",
      valid: false,
      deferred: false,
      conflicting: true,
      incomplete: false,
      reasons
    };
  }

  if (deferred) {
    return {
      triggerState: "TRIGGER_DETECTED",
      classificationState: "CLASSIFIED_DEFERRED",
      valid: false,
      deferred: true,
      conflicting: false,
      incomplete: false,
      reasons
    };
  }

  reasons.push("VALID_TRIGGER");

  return {
    triggerState: "TRIGGER_DETECTED",
    classificationState: "CLASSIFIED_VALID",
    valid: true,
    deferred: false,
    conflicting: false,
    incomplete: false,
    reasons
  };
}
