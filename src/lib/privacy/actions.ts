import fs from "node:fs";
import path from "node:path";
import { getApprovedReviewRecords } from "../fundtracker/approvedReviewStore";
import { getPermanentRefusals, getReviewAuditLog } from "../fundtracker/reviewAudit";
import { getReviewQueue } from "../fundtracker/reviewQueue";
import { getDeletionPolicy } from "./deletion";
import {
  hasActiveChargebackHold,
  queuePrivacyApproval,
  recordPrivacyActionReceipt,
  type PrivacyActionType,
} from "./governance";
import { evaluateRetentionClass } from "./retention";
import { buildSubjectAccessBundle } from "./subjectAccess";

export interface PrivacyPolicyException {
  artifactType: string;
  reason: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface RetentionSweepResult {
  expired: Array<{
    artifactType: string;
    action: string;
    expiresAt: string | null;
  }>;
  exceptions: PrivacyPolicyException[];
}

const dataDir = path.resolve(process.cwd(), "records", "privacy");
const exceptionFile = path.join(dataDir, "policy-exceptions.json");
const exportDir = path.join(dataDir, "exports");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  if (!fs.existsSync(exceptionFile)) {
    fs.writeFileSync(exceptionFile, JSON.stringify([], null, 2), "utf8");
  }
}

function readExceptions(): PrivacyPolicyException[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(exceptionFile, "utf8")) as PrivacyPolicyException[];
}

function writeExceptions(items: PrivacyPolicyException[]): void {
  ensureStore();
  fs.writeFileSync(exceptionFile, JSON.stringify(items, null, 2), "utf8");
}

function nowIso(): string {
  return new Date().toISOString();
}

function redactFields<T extends Record<string, unknown>>(payload: T, fields: string[]): T {
  const clone = { ...payload };
  for (const field of fields) {
    if (field in clone) {
      clone[field as keyof T] = "[REDACTED]" as T[keyof T];
    }
  }
  return clone;
}

function queueDestructiveAction(
  actionType: PrivacyActionType,
  artifactType: string,
  payload: Record<string, unknown>,
  reason: string,
) {
  const approval = queuePrivacyApproval({
    actionType,
    artifactType,
    transactionId: typeof payload.transactionId === "string" ? payload.transactionId : undefined,
    subjectId: typeof payload.customerId === "string" ? payload.customerId : undefined,
    reason,
    payload,
  });

  const receipt = recordPrivacyActionReceipt({
    actionType,
    artifactType,
    transactionId: approval.transactionId,
    subjectId: approval.subjectId,
    status: "queued",
    reason,
    payload: {
      approvalId: approval.approvalId,
    },
  });

  return { approval, receipt };
}

export function getPrivacyPolicyExceptions(): PrivacyPolicyException[] {
  return readExceptions();
}

export function resetPrivacyPolicyExceptions(): void {
  writeExceptions([]);
}

export function queuePrivacyPolicyException(
  artifactType: string,
  reason: string,
  payload: Record<string, unknown>,
): PrivacyPolicyException {
  const items = readExceptions();
  const item: PrivacyPolicyException = {
    artifactType,
    reason,
    createdAt: nowIso(),
    payload,
  };
  items.push(item);
  writeExceptions(items);
  return item;
}

export function applyRedactionPolicy(
  artifactType: string,
  payload: Record<string, unknown>,
) {
  const policy = getDeletionPolicy(artifactType);
  const transactionId =
    typeof payload.transactionId === "string" ? payload.transactionId : undefined;

  if (hasActiveChargebackHold(transactionId, artifactType)) {
    const blocked = recordPrivacyActionReceipt({
      actionType: "redact",
      artifactType,
      transactionId,
      subjectId: typeof payload.customerId === "string" ? payload.customerId : undefined,
      status: "blocked",
      reason: "Blocked by active chargeback hold.",
      payload,
    });

    return {
      ok: false,
      blockedByChargebackHold: true,
      policy,
      payload,
      receipt: blocked,
      message: `Artifact type ${artifactType} is under active chargeback hold.`,
    };
  }

  if (policy.action !== "redact") {
    const queued = queueDestructiveAction(
      policy.action,
      artifactType,
      payload,
      `Artifact type ${artifactType} requires approval for ${policy.action}.`,
    );

    return {
      ok: false,
      policy,
      payload,
      queuedForApproval: true,
      approval: queued.approval,
      receipt: queued.receipt,
      message: `Artifact type ${artifactType} is not configured for automatic redaction.`,
    };
  }

  const result = {
    ok: true,
    policy,
    payload: redactFields(payload, policy.fieldsToRedact),
  };

  const receipt = recordPrivacyActionReceipt({
    actionType: "redact",
    artifactType,
    transactionId,
    subjectId: typeof payload.customerId === "string" ? payload.customerId : undefined,
    status: "completed",
    payload: result.payload,
  });

  return {
    ...result,
    receipt,
  };
}

export function runRetentionSweep(referenceDate?: string): RetentionSweepResult {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const expired: RetentionSweepResult["expired"] = [];
  const exceptions: PrivacyPolicyException[] = [];

  const reviewQueue = getReviewQueue().map((item) => ({
    artifactType: "ReviewQueueItem",
    createdAt: item.createdAt,
    payload: item as unknown as Record<string, unknown>,
    retentionClass: "dispute" as const,
  }));

  const reviewAudit = getReviewAuditLog().map((item) => ({
    artifactType: "ReviewAuditRecord",
    createdAt: item.createdAt,
    payload: item as unknown as Record<string, unknown>,
    retentionClass: "compliance" as const,
  }));

  const permanentRefusals = getPermanentRefusals().map((item) => ({
    artifactType: "PermanentRefusalRecord",
    createdAt: item.refusedAt,
    payload: item as unknown as Record<string, unknown>,
    retentionClass: "dispute" as const,
  }));

  const approvedReviews = getApprovedReviewRecords().map((item) => ({
    artifactType: "ApprovedReviewRecord",
    createdAt: item.approvedAt,
    payload: item as unknown as Record<string, unknown>,
    retentionClass: "compliance" as const,
  }));

  const all = [...reviewQueue, ...reviewAudit, ...permanentRefusals, ...approvedReviews];

  for (const item of all) {
    const retention = evaluateRetentionClass(item.retentionClass, item.createdAt);
    const expiry = retention.expiresAt ? new Date(retention.expiresAt) : null;
    const transactionId =
      typeof item.payload.transactionId === "string" ? item.payload.transactionId : undefined;

    if (expiry && expiry <= now) {
      const policy = getDeletionPolicy(item.artifactType);

      expired.push({
        artifactType: item.artifactType,
        action: policy.action,
        expiresAt: retention.expiresAt,
      });

      if (hasActiveChargebackHold(transactionId, item.artifactType)) {
        const exception = queuePrivacyPolicyException(
          item.artifactType,
          "Retention expired but artifact is protected by active chargeback hold.",
          item.payload,
        );
        exceptions.push(exception);

        recordPrivacyActionReceipt({
          actionType: "retention_sweep",
          artifactType: item.artifactType,
          transactionId,
          status: "blocked",
          reason: "Blocked by active chargeback hold during retention sweep.",
          payload: item.payload,
        });

        continue;
      }

      if (policy.action === "manual_review" || policy.action === "freeze" || policy.action === "delete") {
        const exception = queuePrivacyPolicyException(
          item.artifactType,
          `Retention expired but artifact requires ${policy.action}.`,
          item.payload,
        );
        exceptions.push(exception);

        queueDestructiveAction(
          policy.action,
          item.artifactType,
          item.payload,
          `Retention sweep requires approval for ${policy.action}.`,
        );

        continue;
      }

      recordPrivacyActionReceipt({
        actionType: "retention_sweep",
        artifactType: item.artifactType,
        transactionId,
        status: "completed",
        payload: {
          expiresAt: retention.expiresAt,
          action: policy.action,
        },
      });
    }
  }

  return { expired, exceptions };
}

export function exportSubjectAccessBundleToFile(subjectId: string) {
  ensureStore();
  const bundle = buildSubjectAccessBundle(subjectId);
  const filename = `subject-access-${subjectId}-${Date.now()}.json`;
  const filepath = path.join(exportDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(bundle, null, 2), "utf8");

  const receipt = recordPrivacyActionReceipt({
    actionType: "export_subject_access",
    subjectId,
    status: "completed",
    payload: {
      filepath,
      filename,
    },
  });

  return {
    subjectId,
    filepath,
    filename,
    generatedAt: nowIso(),
    receipt,
  };
}
