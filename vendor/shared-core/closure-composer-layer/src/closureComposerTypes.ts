import type { AccessResolverArtifact } from "../../access-resolver-layer/src/index.js";
import type { LifecycleState } from "../../lifecycle-registry-layer/src/index.js";

export type ClosureMode =
  | "PERIOD_END_CLOSURE"
  | "EXPIRED_CLOSURE"
  | "ARCHIVED_CLOSURE"
  | "REACTIVATION_READY";

export interface ClosureComposerInput {
  subjectId: string;
  lifecycleState: LifecycleState;
  accessRecord: AccessResolverArtifact | null;
  accessThroughDateIso?: string | null;
  archiveAvailable?: boolean;
  exportAvailable?: boolean;
}

export interface ClosureComposerArtifact {
  closureId: string;
  subjectId: string;
  closureMode: ClosureMode;
  accessThroughDate: string | null;
  remainsVisible: string[];
  archivedAssets: string[];
  exportableAssets: string[];
  returnPathAvailable: boolean;
  returnPathType: string | null;
  reason: string;
  createdAt: string;
}

export interface ClosureComposerRefusal {
  refusalCode:
    | "MISSING_ACCESS_RECORD"
    | "SUBJECT_MISMATCH"
    | "UNSUPPORTED_LIFECYCLE_STATE";
  refusalReason: string;
}

export interface ClosureComposerResult {
  ok: boolean;
  artifact: ClosureComposerArtifact | null;
  refusal: ClosureComposerRefusal | null;
}