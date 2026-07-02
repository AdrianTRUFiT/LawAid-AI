import { PermissionContext, PermissionResult } from './permissionContracts';

export function evaluateUnifiedPermission(ctx: PermissionContext): PermissionResult {
  if (ctx.actor === "EXTERNAL_LLM") {
    if (
      ctx.action === "create_authority" ||
      ctx.action === "write_authoritative_record" ||
      ctx.action === "mutate_sealed_record" ||
      ctx.action === "trigger_consequence"
    ) {
      return {
        decision: "REFUSE",
        reason: "EXTERNAL_LLM_PROCESSOR_ONLY"
      };
    }

    return {
      decision: "READ_ONLY",
      reason: "EXTERNAL_LLM_MAY_PROCESS_ONLY"
    };
  }

  if (ctx.sealed && ctx.action === "mutate_sealed_record") {
    return {
      decision: "REFUSE",
      reason: "SEALED_RECORD_MUTATION_REFUSED"
    };
  }

  if (ctx.actor === "FRONTEND_SURFACE") {
    if (ctx.action === "write_authoritative_record" || ctx.action === "create_authority") {
      return {
        decision: "REFUSE",
        reason: "FRONTEND_CANNOT_CREATE_AUTHORITY"
      };
    }

    if (ctx.action === "trigger_consequence" && !ctx.backendVerified) {
      return {
        decision: "REFUSE",
        reason: "FRONTEND_CANNOT_TRIGGER_UNVERIFIED_CONSEQUENCE"
      };
    }

    if (ctx.surfaceReadOnly && ctx.action !== "display_status" && ctx.action !== "read_verified_state") {
      return {
        decision: "REFUSE",
        reason: "READ_ONLY_SURFACE_ACTION_REFUSED"
      };
    }

    return {
      decision: "ALLOW",
      reason: "FRONTEND_ACTION_ALLOWED_WITHIN_BOUNDARY"
    };
  }

  if (ctx.actor === "PING") {
    if (ctx.action === "write_authoritative_record" || ctx.action === "create_authority") {
      return {
        decision: "REFUSE",
        reason: "PING_RUNTIME_TRUTH_ONLY"
      };
    }

    return {
      decision: "ALLOW",
      reason: "PING_ALLOWED_RUNTIME_VISIBILITY"
    };
  }

  if (ctx.actor === "PONG") {
    if (ctx.action === "security_refusal") {
      return {
        decision: "REFUSE",
        reason: "PONG_GOVERNANCE_NOT_SECURITY_REFUSAL"
      };
    }

    return {
      decision: "ALLOW",
      reason: "PONG_ALLOWED_GOVERNANCE_PLACEMENT"
    };
  }

  if (ctx.actor === "MARK") {
    if (ctx.action === "security_refusal" || ctx.action === "mutate_sealed_record") {
      if (ctx.action === "mutate_sealed_record") {
        return {
          decision: "REFUSE",
          reason: "MARK_REFUSES_SEALED_MUTATION"
        };
      }

      return {
        decision: "ALLOW",
        reason: "MARK_ALLOWED_SECURITY_REFUSAL"
      };
    }

    return {
      decision: "REVIEW_REQUIRED",
      reason: "MARK_ACTION_OUTSIDE_SECURITY_LANE"
    };
  }

  if (ctx.actor === "HARD") {
    if (ctx.action === "write_authoritative_record" && !ctx.humanApproved) {
      return {
        decision: "REVIEW_REQUIRED",
        reason: "HARD_REQUIRES_AUTHORIZED_HUMAN_FOR_AUTHORITY_WRITE"
      };
    }

    if (ctx.action === "route_execution") {
      return {
        decision: "ALLOW",
        reason: "HARD_ALLOWED_FINAL_ROUTING_EXECUTION_DECISION"
      };
    }

    return {
      decision: "ALLOW",
      reason: "HARD_ALLOWED_CONVERGENCE_EXECUTION"
    };
  }

  if (ctx.actor === "AUTHORIZED_HUMAN") {
    return {
      decision: "ALLOW",
      reason: "AUTHORIZED_HUMAN_APPROVAL_BOUNDARY"
    };
  }

  if (ctx.actor === "BACKEND_MODULE") {
    if (ctx.action === "trigger_consequence" && !ctx.backendVerified) {
      return {
        decision: "REFUSE",
        reason: "BACKEND_CONSEQUENCE_REQUIRES_VERIFIED_TRUTH"
      };
    }

    return {
      decision: "ALLOW",
      reason: "BACKEND_MODULE_ALLOWED_WITH_VERIFIED_BOUNDARY"
    };
  }

  return {
    decision: "REFUSE",
    reason: "UNKNOWN_PERMISSION_CONTEXT"
  };
}
