import { evaluateUnifiedPermission } from './unifiedPermissionEngine';

const checks = [
  {
    name: "EXTERNAL_LLM_CREATE_AUTHORITY_REFUSAL",
    ctx: {
      actor: "EXTERNAL_LLM",
      action: "create_authority",
      target: "system_law"
    }
  },
  {
    name: "FRONTEND_UNVERIFIED_CONSEQUENCE_REFUSAL",
    ctx: {
      actor: "FRONTEND_SURFACE",
      action: "trigger_consequence",
      target: "activation",
      backendVerified: false
    }
  },
  {
    name: "FRONTEND_DISPLAY_VERIFIED_STATE_ALLOWED",
    ctx: {
      actor: "FRONTEND_SURFACE",
      action: "display_status",
      target: "backend_status",
      backendVerified: true
    }
  },
  {
    name: "PING_AUTHORITY_WRITE_REFUSAL",
    ctx: {
      actor: "PING",
      action: "write_authoritative_record",
      target: "governance_record"
    }
  },
  {
    name: "PONG_SECURITY_REFUSAL_BLOCKED",
    ctx: {
      actor: "PONG",
      action: "security_refusal",
      target: "seal_breach"
    }
  },
  {
    name: "MARK_SECURITY_REFUSAL_ALLOWED",
    ctx: {
      actor: "MARK",
      action: "security_refusal",
      target: "seal_breach"
    }
  },
  {
    name: "SEALED_RECORD_MUTATION_REFUSAL",
    ctx: {
      actor: "HARD",
      action: "mutate_sealed_record",
      target: "sealed_record",
      sealed: true
    }
  },
  {
    name: "HARD_ROUTE_EXECUTION_ALLOWED",
    ctx: {
      actor: "HARD",
      action: "route_execution",
      target: "launch_path"
    }
  },
  {
    name: "BACKEND_UNVERIFIED_CONSEQUENCE_REFUSAL",
    ctx: {
      actor: "BACKEND_MODULE",
      action: "trigger_consequence",
      target: "activation",
      backendVerified: false
    }
  },
  {
    name: "AUTHORIZED_HUMAN_APPROVAL_ALLOWED",
    ctx: {
      actor: "AUTHORIZED_HUMAN",
      action: "review_acceptance",
      target: "candidate_change"
    }
  }
];

console.log("UNIFIED_PERMISSION_MATRIX_V1=START");

for (const c of checks) {
  console.log("----");
  console.log(c.name);
  console.log(evaluateUnifiedPermission(c.ctx as any));
}

console.log("UNIFIED_PERMISSION_MATRIX_V1=COMPLETE");
