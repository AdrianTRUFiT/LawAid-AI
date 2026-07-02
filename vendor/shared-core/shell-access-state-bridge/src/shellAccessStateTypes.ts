import type { ProvisioningEntitlementArtifact } from "../../provisioning-entitlement-bridge/src/index.js";

export type ShellAccessState =
  | "active_shell"
  | "limited_shell"
  | "blocked_shell"
  | "review_shell"
  | "revoked_shell";

export type ShellAccessMode =
  | "FULL"
  | "LIMITED"
  | "BLOCKED"
  | "REVIEW"
  | "REVOKED";

export interface ShellAccessStateInput {
  subjectId: string;
  entitlement: ProvisioningEntitlementArtifact;
}

export interface ShellAccessStateArtifact {
  shellAccessId: string;
  subjectId: string;
  customerId: string;
  subscriptionId: string | null;
  shellAccessState: ShellAccessState;
  shellAccessMode: ShellAccessMode;
  continuityEligible: boolean;
  sourceEntitlementId: string;
  reason: string;
  createdAt: string;
}

export interface ShellAccessStateRefusal {
  refusalCode:
    | "MISSING_ENTITLEMENT"
    | "SUBJECT_MISMATCH"
    | "UNSUPPORTED_ENTITLEMENT_STATE";
  refusalReason: string;
}

export interface ShellAccessStateResult {
  ok: boolean;
  artifact: ShellAccessStateArtifact | null;
  refusal: ShellAccessStateRefusal | null;
}