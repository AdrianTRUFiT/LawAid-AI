import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  ActivatedTransactionState,
  ActivationOutcome,
  LiveSystemRecord,
  ReviewedShellRecord,
  Step6ActivationEnvelope,
  buildFoundationalRuntimeProof,
} from "./activationContract";

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function requiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function makeActivationKey(
  shellRecordId: string,
  transactionStateId: string,
): string {
  return crypto
    .createHash("sha256")
    .update(`${shellRecordId}::${transactionStateId}`)
    .digest("hex")
    .slice(0, 24);
}

function defaultModules(
  reviewedShell: ReviewedShellRecord,
  ats: ActivatedTransactionState,
): string[] {
  const fromEntitlement = ats.entitlement?.modules;
  if (Array.isArray(fromEntitlement) && fromEntitlement.length > 0) {
    return fromEntitlement;
  }

  const fromHints = reviewedShell.initializationHints?.modules;
  if (Array.isArray(fromHints) && fromHints.length > 0) {
    return fromHints as string[];
  }

  return ["tasks", "events", "documents", "expenses", "timeline", "evidence"];
}

function buildWorkspaceId(
  reviewedShell: ReviewedShellRecord,
  ats: ActivatedTransactionState,
): string {
  const projectId =
    reviewedShell.context?.projectId ||
    ats.context?.projectId ||
    reviewedShell.handoffId ||
    ats.handoffId ||
    "workspace";

  return `lawaid-workspace-${projectId}`;
}

function buildProjectId(
  reviewedShell: ReviewedShellRecord,
  ats: ActivatedTransactionState,
): string {
  return (
    reviewedShell.context?.projectId ||
    ats.context?.projectId ||
    reviewedShell.context?.matterId ||
    ats.context?.matterId ||
    reviewedShell.handoffId ||
    ats.handoffId ||
    "unscoped-project"
  );
}

function refusalOutcome(
  refusalReason: ActivationOutcome extends infer T ? string : string,
  sourceArtifacts: string[],
): ActivationOutcome {
  return {
    accepted: false,
    refusalReason: refusalReason as
      | "MISSING_REVIEWED_SHELL"
      | "MISSING_ACTIVATED_TRANSACTION_STATE"
      | "WRONG_TARGET"
      | "UNAPPROVED_REVIEW_STATE"
      | "STATE_CONTRADICTION"
      | "MISSING_REQUIRED_FIELD"
      | "DUPLICATE_ACTIVATION",
    proof: buildFoundationalRuntimeProof({
      sourceArtifacts,
      refusalArtifacts: [refusalReason],
    }),
  };
}

export function activateReviewedShellToLiveRecord(args: {
  projectRoot: string;
  reviewedShellPath: string;
  activatedTransactionStatePath: string;
}): ActivationOutcome {
  const sourceArtifacts = [
    args.reviewedShellPath,
    args.activatedTransactionStatePath,
  ];

  const reviewedShell = readJson<ReviewedShellRecord>(args.reviewedShellPath);
  const ats = readJson<ActivatedTransactionState>(args.activatedTransactionStatePath);

  if (!reviewedShell) {
    return refusalOutcome("MISSING_REVIEWED_SHELL", sourceArtifacts);
  }

  if (!ats) {
    return refusalOutcome("MISSING_ACTIVATED_TRANSACTION_STATE", sourceArtifacts);
  }

  if (reviewedShell.targetApp !== "LawAidAI" || ats.targetApp !== "LawAidAI") {
    return refusalOutcome("WRONG_TARGET", sourceArtifacts);
  }

  if (reviewedShell.reviewStatus !== "approved") {
    return refusalOutcome("UNAPPROVED_REVIEW_STATE", sourceArtifacts);
  }

  if (ats.artifactType !== "ActivatedTransactionState" || !ats.activationPermitted) {
    return refusalOutcome("STATE_CONTRADICTION", sourceArtifacts);
  }

  if (!requiredString(reviewedShell.shellRecordId)) {
    return refusalOutcome("MISSING_REQUIRED_FIELD", sourceArtifacts);
  }

  if (!requiredString(ats.transactionStateId)) {
    return refusalOutcome("MISSING_REQUIRED_FIELD", sourceArtifacts);
  }

  const activationKey = makeActivationKey(
    reviewedShell.shellRecordId,
    ats.transactionStateId,
  );

  const activationDir = path.join(args.projectRoot, "records", "activation");
  const liveDir = path.join(args.projectRoot, "records", "live");

  ensureDir(activationDir);
  ensureDir(liveDir);

  const activationEnvelopePath = path.join(
    activationDir,
    `activation-envelope-${activationKey}.json`,
  );
  const liveRecordPath = path.join(
    liveDir,
    `live-record-${activationKey}.json`,
  );

  if (fs.existsSync(liveRecordPath)) {
    return refusalOutcome("DUPLICATE_ACTIVATION", sourceArtifacts);
  }

  const allowedModules = defaultModules(reviewedShell, ats);

  const envelope: Step6ActivationEnvelope = {
    envelopeType: "LawAidAIActivationEnvelope",
    envelopeVersion: "1.0",
    createdAt: new Date().toISOString(),
    gapStatus: "VERIFIED",
    reviewedShell,
    activatedTransactionState: ats,
    activationKey,
    allowedModules,
  };

  const liveRecord: LiveSystemRecord = {
    artifactType: "LiveSystemRecord",
    recordVersion: "1.0",
    liveRecordId: `lsr-${activationKey}`,
    activationKey,
    createdAt: new Date().toISOString(),
    source: {
      reviewedShellRecordId: reviewedShell.shellRecordId,
      transactionStateId: ats.transactionStateId,
      handoffId: reviewedShell.handoffId || ats.handoffId,
    },
    workspace: {
      workspaceId: buildWorkspaceId(reviewedShell, ats),
      projectId: buildProjectId(reviewedShell, ats),
      matterId: reviewedShell.context?.matterId || ats.context?.matterId,
      status: "active",
    },
    identity: {
      email: reviewedShell.identity?.email || ats.identity?.email,
      fullName: reviewedShell.identity?.fullName || ats.identity?.fullName,
      userId: reviewedShell.identity?.userId || ats.identity?.userId,
    },
    modules: allowedModules,
    continuity: {
      continuityStartedAt: new Date().toISOString(),
      active: true,
    },
    marks: [
      {
        type: "ACTIVATION_CONFIRMED",
        at: new Date().toISOString(),
        by: "Step6ActivationEngine",
        evidence: sourceArtifacts,
      },
    ],
  };

  writeJson(activationEnvelopePath, envelope);
  writeJson(liveRecordPath, liveRecord);

  return {
    accepted: true,
    envelope,
    liveRecord,
    filesWritten: {
      activationEnvelopePath,
      liveRecordPath,
    },
    proof: buildFoundationalRuntimeProof({
      sourceArtifacts,
      outputArtifacts: [activationEnvelopePath, liveRecordPath],
    }),
  };
}