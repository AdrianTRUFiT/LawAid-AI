import express from "express";
import {
  createTransactionIntentApi,
} from "../api/fundtracker/createTransactionIntent";
import {
  recordProcessorEventApi,
} from "../api/fundtracker/recordProcessorEvent";
import {
  verifyCommitmentApi,
} from "../api/fundtracker/verifyCommitment";
import {
  getTransactionStateApi,
} from "../api/fundtracker/getTransactionState";
import {
  assessRiskApi,
} from "../api/fundtracker/assessRisk";
import {
  getMerchantPolicyApi,
  listMerchantPoliciesApi,
  upsertMerchantPolicyApi,
} from "../api/fundtracker/merchantPolicies";
import {
  listStoredMerchantPoliciesApi,
  upsertStoredMerchantPolicyApi,
} from "../api/fundtracker/merchantPolicyPersistence";
import {
  getReviewQueueItemApi,
  listReviewQueueApi,
  updateReviewQueueStatusApi,
} from "../api/fundtracker/reviewQueue";
import {
  approveReviewQueueItemApi,
  rejectReviewQueueItemApi,
  listReviewAuditLogApi,
  listPermanentRefusalsApi,
} from "../api/fundtracker/reviewResolution";
import {
  getReviewGovernanceStateApi,
  resetReviewGovernanceStateApi,
} from "../api/fundtracker/reviewPersistence";
import {
  listApprovedReviewsApi,
  listPendingReviewsApi,
  listRejectedReviewsApi,
  listReviewEventHistoryApi,
  listReviewerPoliciesApi,
} from "../api/fundtracker/reviewAdmin";
import {
  getAdminSnapshotApi,
  getReviewsByMerchantApi,
  getReviewsByStatusApi,
  getReviewerActivityApi,
} from "../api/fundtracker/adminSearch";
import {
  getMerchantTimelineApi,
  getTransactionTimelineApi,
} from "../api/fundtracker/timeline";
import {
  getPrivacyInventoryApi,
  classifyArtifactApi,
  sanitizeArtifactPreviewApi,
} from "../api/privacy/inventory";
import {
  getDeletionPolicyApi,
  getRetentionEvaluationApi,
  getRoleAssignmentApi,
  getSubjectAccessBundleApi,
} from "../api/privacy/subjectAccess";
import {
  applyRedactionPolicyApi,
  createChargebackHoldApi,
  exportSubjectAccessBundleToFileApi,
  getChargebackHoldsApi,
  getPrivacyActionReceiptsApi,
  getPrivacyApprovalQueueApi,
  getPrivacyDashboardSnapshotApi,
  getPrivacyPolicyExceptionsApi,
  releaseChargebackHoldApi,
  resetChargebackHoldsApi,
  resetPrivacyActionReceiptsApi,
  resetPrivacyApprovalQueueApi,
  resetPrivacyPolicyExceptionsApi,
  runRetentionSweepApi,
  updatePrivacyApprovalStatusApi,
} from "../api/privacy/actions";
import {
  ingestTransactionSummaryApi,
} from "../api/fintechion/ingestTransactionSummary";
import {
  buildOversightStateApi,
} from "../api/fintechion/buildOversightState";
import {
  createPaymentObligationApi,
  getInstructionGuardApi,
  listConsumedInstructionGuardsApi,
  listGuardVerificationResultsApi,
  listInstructionGuardsApi,
  listPaymentObligationsApi,
  listProcessorSubmissionsApi,
  mintPaymentInstructionGuardApi,
  submitProcessorEventApi,
  verifyInstructionGuardApi,
} from "../api/fundtracker/obligation";
import {
  getOversightStateApi,
} from "../api/fintechion/getOversightState";
import {
  buildOversightEnforcementApi,
} from "../api/fintechion/enforcement";

const app = express();
app.use(express.json());

app.post("/api/fundtracker/create-intent", (req, res) => {
  try {
    const result = createTransactionIntentApi(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/fundtracker/record-processor-event", (req, res) => {
  try {
    const result = recordProcessorEventApi(req.body.intent, req.body.processorEvent);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/fundtracker/assess-risk", (req, res) => {
  try {
    const result = assessRiskApi(req.body.intent, req.body.processorEvent);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/fundtracker/verify", (req, res) => {
  try {
    const result = verifyCommitmentApi(req.body.intent, req.body.processorEvent);

    if (result.ok && result.payload && "transactionId" in result.payload) {
      ingestTransactionSummaryApi(result.payload);
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/transaction/:transactionId", (req, res) => {
  res.json(getTransactionStateApi(req.params.transactionId));
});

app.get("/api/fundtracker/merchant-policy/:merchantId", (req, res) => {
  res.json(getMerchantPolicyApi(req.params.merchantId));
});

app.get("/api/fundtracker/merchant-policies", (_req, res) => {
  res.json(listMerchantPoliciesApi());
});

app.post("/api/fundtracker/merchant-policy", (req, res) => {
  try {
    res.json(upsertMerchantPolicyApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/stored-merchant-policies", (_req, res) => {
  res.json(listStoredMerchantPoliciesApi());
});

app.post("/api/fundtracker/stored-merchant-policy", (req, res) => {
  try {
    res.json(upsertStoredMerchantPolicyApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/review-queue", (_req, res) => {
  res.json(listReviewQueueApi());
});

app.get("/api/fundtracker/review-queue/:reviewId", (req, res) => {
  res.json(getReviewQueueItemApi(req.params.reviewId));
});

app.post("/api/fundtracker/review-queue/:reviewId/status", (req, res) => {
  try {
    res.json(updateReviewQueueStatusApi(req.params.reviewId, req.body.status));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/fundtracker/review-queue/:reviewId/approve", (req, res) => {
  try {
    res.json(
      approveReviewQueueItemApi(
        req.params.reviewId,
        req.body.reviewerId,
        req.body.reviewerNote ?? "",
      ),
    );
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/fundtracker/review-queue/:reviewId/reject", (req, res) => {
  try {
    res.json(
      rejectReviewQueueItemApi(
        req.params.reviewId,
        req.body.reviewerId,
        req.body.reviewerNote ?? "",
      ),
    );
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/review-audit-log", (_req, res) => {
  res.json(listReviewAuditLogApi());
});

app.get("/api/fundtracker/permanent-refusals", (_req, res) => {
  res.json(listPermanentRefusalsApi());
});

app.get("/api/fundtracker/review-governance-state", (_req, res) => {
  res.json(getReviewGovernanceStateApi());
});

app.post("/api/fundtracker/review-governance-reset", (_req, res) => {
  res.json(resetReviewGovernanceStateApi());
});

app.get("/api/fundtracker/admin/reviews/pending", (_req, res) => {
  res.json(listPendingReviewsApi());
});

app.get("/api/fundtracker/admin/reviews/approved", (_req, res) => {
  res.json(listApprovedReviewsApi());
});

app.get("/api/fundtracker/admin/reviews/rejected", (_req, res) => {
  res.json(listRejectedReviewsApi());
});

app.get("/api/fundtracker/admin/review-events", (_req, res) => {
  res.json(listReviewEventHistoryApi());
});

app.get("/api/fundtracker/admin/reviewer-policies", (_req, res) => {
  res.json(listReviewerPoliciesApi());
});

app.get("/api/fundtracker/admin/snapshot", (_req, res) => {
  res.json(getAdminSnapshotApi());
});

app.get("/api/fundtracker/admin/reviews/by-merchant/:merchantId", (req, res) => {
  res.json(getReviewsByMerchantApi(req.params.merchantId));
});

app.get("/api/fundtracker/admin/reviews/by-status/:status", (req, res) => {
  res.json(
    getReviewsByStatusApi(
      req.params.status as "pending_review" | "approved" | "rejected",
    ),
  );
});

app.get("/api/fundtracker/admin/reviewer-activity/:reviewerId", (req, res) => {
  res.json(getReviewerActivityApi(req.params.reviewerId));
});

app.get("/api/fundtracker/admin/timeline/transaction/:transactionId", (req, res) => {
  res.json(getTransactionTimelineApi(req.params.transactionId));
});

app.get("/api/fundtracker/admin/timeline/merchant/:merchantId", (req, res) => {
  res.json(getMerchantTimelineApi(req.params.merchantId));
});

app.get("/api/privacy/inventory", (_req, res) => {
  res.json(getPrivacyInventoryApi());
});

app.post("/api/privacy/classify", (req, res) => {
  try {
    res.json(classifyArtifactApi(req.body.artifactType, req.body.payload ?? {}));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/privacy/sanitize-preview", (req, res) => {
  try {
    res.json(sanitizeArtifactPreviewApi(req.body.artifactType, req.body.payload ?? {}));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/privacy/subject-access/:subjectId", (req, res) => {
  res.json(getSubjectAccessBundleApi(req.params.subjectId));
});

app.get("/api/privacy/retention/:retentionClass", (req, res) => {
  res.json(
    getRetentionEvaluationApi(
      req.params.retentionClass as "ephemeral" | "operational" | "compliance" | "dispute" | "archival",
      typeof req.query.createdAt === "string" ? req.query.createdAt : undefined,
    ),
  );
});

app.get("/api/privacy/deletion/:artifactType", (req, res) => {
  res.json(getDeletionPolicyApi(req.params.artifactType));
});

app.get("/api/privacy/role-assignment/:artifactType", (req, res) => {
  res.json(getRoleAssignmentApi(req.params.artifactType));
});

app.post("/api/privacy/redact", (req, res) => {
  try {
    res.json(applyRedactionPolicyApi(req.body.artifactType, req.body.payload ?? {}));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/privacy/retention-sweep", (req, res) => {
  res.json(
    runRetentionSweepApi(
      typeof req.query.referenceDate === "string" ? req.query.referenceDate : undefined,
    ),
  );
});

app.get("/api/privacy/policy-exceptions", (_req, res) => {
  res.json(getPrivacyPolicyExceptionsApi());
});

app.post("/api/privacy/policy-exceptions/reset", (_req, res) => {
  res.json(resetPrivacyPolicyExceptionsApi());
});

app.get("/api/privacy/export-subject/:subjectId", (req, res) => {
  res.json(exportSubjectAccessBundleToFileApi(req.params.subjectId));
});

app.get("/api/privacy/action-receipts", (_req, res) => {
  res.json(getPrivacyActionReceiptsApi());
});

app.post("/api/privacy/action-receipts/reset", (_req, res) => {
  res.json(resetPrivacyActionReceiptsApi());
});

app.get("/api/privacy/approval-queue", (_req, res) => {
  res.json(getPrivacyApprovalQueueApi());
});

app.post("/api/privacy/approval-queue/reset", (_req, res) => {
  res.json(resetPrivacyApprovalQueueApi());
});

app.post("/api/privacy/approval-queue/:approvalId/status", (req, res) => {
  res.json(
    updatePrivacyApprovalStatusApi(
      req.params.approvalId,
      req.body.status as "approved" | "rejected",
    ),
  );
});

app.post("/api/privacy/chargeback-holds", (req, res) => {
  res.json(
    createChargebackHoldApi(
      req.body.transactionId,
      req.body.reason,
      req.body.artifactType,
    ),
  );
});

app.get("/api/privacy/chargeback-holds", (_req, res) => {
  res.json(getChargebackHoldsApi());
});

app.post("/api/privacy/chargeback-holds/reset", (_req, res) => {
  res.json(resetChargebackHoldsApi());
});

app.post("/api/privacy/chargeback-holds/:holdId/release", (req, res) => {
  res.json(releaseChargebackHoldApi(req.params.holdId));
});

app.get("/api/privacy/dashboard-snapshot", (_req, res) => {
  res.json(getPrivacyDashboardSnapshotApi());
});

app.post("/api/fintechion/build-oversight", (req, res) => {
  try {
    const { period, refundExposure = 0, disputeExposure = 0 } = req.body;
    const result = buildOversightStateApi(period, refundExposure, disputeExposure);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fintechion/oversight", (_req, res) => {
  res.json(getOversightStateApi());
});

app.post("/api/fintechion/enforcement", (req, res) => {
  try {
    res.json(buildOversightEnforcementApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


app.post("/api/fundtracker/obligations", (req, res) => {
  try {
    res.json(createPaymentObligationApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/obligations", (_req, res) => {
  res.json(listPaymentObligationsApi());
});

app.post("/api/fundtracker/instruction-guards", (req, res) => {
  try {
    res.json(mintPaymentInstructionGuardApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/instruction-guards", (_req, res) => {
  res.json(listInstructionGuardsApi());
});

app.get("/api/fundtracker/instruction-guards/consumed", (_req, res) => {
  res.json(listConsumedInstructionGuardsApi());
});

app.get("/api/fundtracker/instruction-guards/:instructionId", (req, res) => {
  res.json(getInstructionGuardApi(req.params.instructionId));
});

app.post("/api/fundtracker/processor-submissions", (req, res) => {
  try {
    res.json(submitProcessorEventApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/processor-submissions", (_req, res) => {
  res.json(listProcessorSubmissionsApi());
});

app.post("/api/fundtracker/instruction-guards/verify", (req, res) => {
  try {
    res.json(verifyInstructionGuardApi(req.body));
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/fundtracker/instruction-guard-results", (_req, res) => {
  res.json(listGuardVerificationResultsApi());
});
const port = Number(process.env.FINANCIAL_SERVER_PORT || 3011);

app.listen(port, () => {
  console.log(`FINANCIAL_SERVER_RUNNING=${port}`);
});





