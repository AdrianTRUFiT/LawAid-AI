import type {
  ClosureComposerArtifact,
  ClosureComposerInput,
  ClosureComposerResult,
} from "./closureComposerTypes.js";
import { makeClosureId, nowIso } from "./closureComposerUtils.js";

export function runClosureComposer(
  input: ClosureComposerInput,
): ClosureComposerResult {
  if (!input.accessRecord) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_ACCESS_RECORD",
        refusalReason: "Closure composer refused because access record is missing.",
      },
    };
  }

  if (input.subjectId !== input.accessRecord.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Closure composer refused because subjectId does not match access record subjectId.",
      },
    };
  }

  let closureMode:
    | "PERIOD_END_CLOSURE"
    | "EXPIRED_CLOSURE"
    | "ARCHIVED_CLOSURE"
    | "REACTIVATION_READY";

  let accessThroughDate: string | null = input.accessThroughDateIso ?? null;
  let remainsVisible: string[] = [];
  let archivedAssets: string[] = [];
  let exportableAssets: string[] = [];
  let returnPathAvailable = false;
  let returnPathType: string | null = null;
  let reason = "";

  if (input.lifecycleState === "CANCELED_PERIOD_END") {
    closureMode = "PERIOD_END_CLOSURE";
    remainsVisible = ["continuity_summary", "billing_history"];
    archivedAssets = input.archiveAvailable === false ? [] : ["workspace_archive"];
    exportableAssets = input.exportAvailable === false ? [] : ["account_export"];
    returnPathAvailable = true;
    returnPathType = "reactivation_before_or_after_period_end";
    reason = "Canceled-period-end lifecycle resolved into governed period-end closure.";
  } else if (input.lifecycleState === "EXPIRED") {
    closureMode = "EXPIRED_CLOSURE";
    remainsVisible = ["continuity_summary"];
    archivedAssets = input.archiveAvailable === false ? [] : ["workspace_archive"];
    exportableAssets = input.exportAvailable === false ? [] : ["summary_export"];
    returnPathAvailable = true;
    returnPathType = "renewal_or_reactivation";
    reason = "Expired lifecycle resolved into governed expired closure.";
  } else if (input.lifecycleState === "ARCHIVED") {
    closureMode = "ARCHIVED_CLOSURE";
    remainsVisible = input.accessRecord.archivedVisibility ? ["archived_visibility"] : [];
    archivedAssets = input.archiveAvailable === false ? [] : ["workspace_archive", "history_record"];
    exportableAssets = input.exportAvailable === false ? [] : ["archive_export"];
    returnPathAvailable = true;
    returnPathType = "reactivation_with_continuity";
    reason = "Archived lifecycle resolved into governed archive-preserving closure.";
  } else if (input.lifecycleState === "REACTIVATED") {
    closureMode = "REACTIVATION_READY";
    remainsVisible = ["continuity_summary", "return_path_ready"];
    archivedAssets = [];
    exportableAssets = [];
    returnPathAvailable = true;
    returnPathType = "resume_active_access";
    reason = "Reactivated lifecycle resolved into return-path-ready closure artifact.";
  } else {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "UNSUPPORTED_LIFECYCLE_STATE",
        refusalReason: `Closure composer refused because lifecycle state '${input.lifecycleState}' is unsupported for closure composition.`,
      },
    };
  }

  const artifact: ClosureComposerArtifact = {
    closureId: makeClosureId(input.subjectId, input.lifecycleState),
    subjectId: input.subjectId,
    closureMode,
    accessThroughDate,
    remainsVisible,
    archivedAssets,
    exportableAssets,
    returnPathAvailable,
    returnPathType,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}