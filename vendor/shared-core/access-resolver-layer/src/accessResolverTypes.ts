import type { EntitlementPackageArtifact } from "../../offer-to-entitlement-matrix/src/index.js";
import type { ShellAccessStateArtifact } from "../../shell-access-state-bridge/src/index.js";
import type { LifecycleState } from "../../lifecycle-registry-layer/src/index.js";

export type AccessMode =
  | "FULL_ACCESS"
  | "TRIAL_ACCESS"
  | "LIMITED_ACCESS"
  | "ARCHIVED_ACCESS";

export interface AccessResolverInput {
  subjectId: string;
  identityActive: boolean;
  entitlementPackage: EntitlementPackageArtifact | null;
  lifecycleState: LifecycleState;
  shellAccess: ShellAccessStateArtifact;
  policyFlags?: {
    archiveVisible?: boolean;
    allowGraceLimitedAccess?: boolean;
  };
}

export interface AccessResolverArtifact {
  accessResolverId: string;
  subjectId: string;
  accessMode: AccessMode;
  availableRights: string[];
  blockedRights: string[];
  archivedVisibility: boolean;
  returnPathEligible: boolean;
  reason: string;
  createdAt: string;
}

export interface AccessResolverRefusal {
  refusalCode:
    | "NO_ENTITLEMENT"
    | "SUBJECT_MISMATCH"
    | "IDENTITY_INACTIVE"
    | "UNSUPPORTED_ACCESS_COMBINATION";
  refusalReason: string;
}

export interface AccessResolverResult {
  ok: boolean;
  artifact: AccessResolverArtifact | null;
  refusal: AccessResolverRefusal | null;
}