import { ProjectBox, UtilityDecision } from './utilityContainerContracts';

export function evaluateProjectBox(box: ProjectBox): UtilityDecision {
  if (!box.category || box.tags.length === 0) {
    return {
      decision: "BLOCK",
      nextState: "BLOCKED",
      reason: "CATEGORY_OR_TAGS_MISSING"
    };
  }

  if (box.custodyRequired && !box.tags.includes("custody")) {
    return {
      decision: "HOLD",
      nextState: "HELD",
      reason: "CUSTODY_TAG_REQUIRED"
    };
  }

  if (box.routingRequired && !box.tags.includes("routing")) {
    return {
      decision: "HOLD",
      nextState: "HELD",
      reason: "ROUTING_TAG_REQUIRED"
    };
  }

  if (box.schedulingRequired && !box.tags.includes("schedule")) {
    return {
      decision: "HOLD",
      nextState: "HELD",
      reason: "SCHEDULE_TAG_REQUIRED"
    };
  }

  if (box.transactionRequired && !box.tags.includes("transaction")) {
    return {
      decision: "HOLD",
      nextState: "HELD",
      reason: "TRANSACTION_TAG_REQUIRED"
    };
  }

  return {
    decision: "CONTINUE",
    nextState: "HIL_READY",
    reason: "UTILITY_CONTAINER_READY"
  };
}
