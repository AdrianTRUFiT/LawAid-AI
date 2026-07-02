import type {
  AimProductReadinessAuditInput,
  AimProductReadinessAuditPacket,
  AimProductReadinessCheckKey,
  AimProductReadinessGate,
  AimProductReadinessStatus
} from "./aimProductReadinessContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "readiness";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return "{" + entries.map(([key, item]) => JSON.stringify(key) + ":" + stableStringify(item)).join(",") + "}";
}

function simpleDeterministicHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return "aim_readiness_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
}

function freezeDeep<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) freezeDeep(child);
    }
    Object.freeze(value);
  }
  return value as Readonly<T>;
}

function gate(gateId: string, title: string, passed: boolean, notes: string[]): AimProductReadinessGate {
  return freezeDeep({ gateId, title, passed, notes }) as AimProductReadinessGate;
}

export function buildAimProductReadinessChecks(input: AimProductReadinessAuditInput): Record<AimProductReadinessCheckKey, boolean> {
  const flow = input.flow;
  const record = input.localRecord;
  const watchlist = input.watchlistItem;
  const reviews = input.humanReviews;
  const summary = input.feedbackSummary;

  return {
    manualIntakeVerified: flow.intakeScreen.status === "INTAKE_READY",
    decisionQueueVerified: Boolean(flow.decisionItem?.decisionId),
    paiSafeReviewVerified: Boolean(flow.decisionItem?.paiSafeReviewPacket) && flow.decisionItem?.paiSafeReviewPacket.humanAuthorityRequired === true,
    journalVerified: Boolean(flow.journalPacket?.journalPacketId) && flow.journalPacket?.preservationRequired === true,
    fixtureExportVerified: Boolean(flow.fixtureExport?.exportHash) && flow.fixtureExport?.readOnly === true,
    previewHarnessVerified: Boolean(flow.previewHarness?.previewHash) && flow.previewHarness?.readOnly === true,
    staticRenderVerified: Boolean(flow.staticRender?.staticRenderId) && flow.staticRender?.staticOnly === true,
    browserVerificationVerified: flow.browserVerification?.status === "BROWSER_STATIC_VERIFIED",
    localRecordVerified: record.recordStatus === "LOCAL_RECORD_READY" && record.localOnly === true,
    watchlistVerified: watchlist.status === "WATCHLIST_ACTIVE" && watchlist.localOnly === true,
    humanReviewVerified: reviews.length > 0 && reviews.every((review) => review.reviewer === "Human" && review.finalAction === ""),
    feedbackSummaryVerified: summary.reviewCount === reviews.length && summary.localOnly === true,
    readOnlyIntegrityVerified:
      flow.readOnly === true &&
      record.readOnly === true &&
      watchlist.readOnly === true &&
      reviews.every((review) => review.readOnly === true) &&
      summary.readOnly === true,
    localOnlyVerified:
      flow.localOnly === true &&
      record.localOnly === true &&
      watchlist.localOnly === true &&
      reviews.every((review) => review.localOnly === true) &&
      summary.localOnly === true,
    humanAuthorityVerified:
      flow.finalAuthority === "Human" &&
      record.finalAuthority === "Human" &&
      watchlist.finalAuthority === "Human" &&
      reviews.every((review) => review.finalAuthority === "Human") &&
      summary.finalAuthority === "Human",
    noLiveDataVerified: flow.mayUseLiveData === false,
    noExternalApiVerified: flow.mayCallExternalApi === false,
    noMutationVerified:
      flow.mayMutateState === false &&
      record.mayMutateSource === false,
    noExecutionVerified:
      flow.mayExecuteTrade === false &&
      record.mayExecuteTrade === false &&
      watchlist.mayExecuteTrade === false &&
      reviews.every((review) => review.mayExecuteTrade === false) &&
      summary.mayExecuteTrade === false,
    noInvestmentApprovalVerified:
      flow.mayApproveInvestment === false &&
      record.mayApproveInvestment === false &&
      watchlist.mayApproveInvestment === false &&
      reviews.every((review) => review.mayApproveInvestment === false) &&
      summary.mayApproveInvestment === false,
    noFinancialAdviceVerified:
      flow.mayProvideFinancialAdvice === false &&
      record.mayProvideFinancialAdvice === false &&
      watchlist.mayProvideFinancialAdvice === false &&
      reviews.every((review) => review.mayProvideFinancialAdvice === false) &&
      summary.mayProvideFinancialAdvice === false,
    noSoulWriteVerified:
      flow.mayWriteSoul === false &&
      record.mayWriteSoul === false &&
      watchlist.mayWriteSoul === false &&
      reviews.every((review) => review.mayWriteSoul === false) &&
      summary.mayWriteSoul === false,
    finalActionBlankVerified:
      flow.finalAction === "" &&
      record.finalAction === "" &&
      watchlist.finalAction === "" &&
      reviews.every((review) => review.finalAction === "") &&
      summary.finalAction === ""
  };
}

export function deriveAimProductReadinessStatus(checks: Record<AimProductReadinessCheckKey, boolean>): AimProductReadinessStatus {
  const authorityKeys: AimProductReadinessCheckKey[] = [
    "noExecutionVerified",
    "noInvestmentApprovalVerified",
    "noFinancialAdviceVerified",
    "noSoulWriteVerified",
    "finalActionBlankVerified",
    "humanAuthorityVerified"
  ];

  if (authorityKeys.some((key) => checks[key] === false)) return "AIM_V0_1_REFUSED_FOR_AUTHORITY_DRIFT";

  const allPassed = Object.values(checks).every(Boolean);
  return allPassed ? "AIM_V0_1_LOCAL_READY" : "AIM_V0_1_HELD_FOR_REPAIR";
}

export function buildAimProductReadinessGates(
  checks: Record<AimProductReadinessCheckKey, boolean>
): AimProductReadinessGate[] {
  return [
    gate("gate_01_flow", "End-to-end local flow", checks.manualIntakeVerified && checks.decisionQueueVerified && checks.paiSafeReviewVerified, [
      "manual intake",
      "decision item",
      "PAI-SAFE review"
    ]),
    gate("gate_02_surface", "Static preview surface", checks.fixtureExportVerified && checks.previewHarnessVerified && checks.staticRenderVerified && checks.browserVerificationVerified, [
      "fixture export",
      "preview harness",
      "static renderer",
      "browser verification"
    ]),
    gate("gate_03_memory", "Local memory and review", checks.localRecordVerified && checks.watchlistVerified && checks.humanReviewVerified && checks.feedbackSummaryVerified, [
      "local record",
      "watchlist",
      "human review",
      "feedback summary"
    ]),
    gate("gate_04_authority", "Authority and safety boundaries", checks.noExecutionVerified && checks.noInvestmentApprovalVerified && checks.noFinancialAdviceVerified && checks.noSoulWriteVerified && checks.finalActionBlankVerified, [
      "no execution",
      "no approval",
      "no advice",
      "no S:\\SOUL write",
      "blank final action"
    ]),
    gate("gate_05_human", "Human final authority", checks.humanAuthorityVerified && checks.readOnlyIntegrityVerified && checks.localOnlyVerified, [
      "human authority",
      "read-only integrity",
      "local-only operation"
    ])
  ];
}

export function buildAimProductReadinessAuditPacket(
  input: AimProductReadinessAuditInput,
  createdAt = "2026-05-14T18:00:00.000Z"
): AimProductReadinessAuditPacket {
  const checks = buildAimProductReadinessChecks(input);
  const gates = buildAimProductReadinessGates(checks);
  const totalCheckCount = Object.keys(checks).length;
  const passedCheckCount = Object.values(checks).filter(Boolean).length;
  const readinessScore = Math.round((passedCheckCount / totalCheckCount) * 100);
  const status = deriveAimProductReadinessStatus(checks);
  const refusalReasons = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  return freezeDeep({
    auditId: "aim_product_readiness_" + simpleDeterministicHash({
      flowHash: input.flow.flowHash,
      recordId: input.localRecord.recordId,
      watchlistId: input.watchlistItem.watchlistId,
      reviewIds: input.humanReviews.map((review) => review.reviewId),
      summaryId: input.feedbackSummary.summaryId
    }),
    createdAt,
    product: "AIM — AI MarketIntel",
    version: "v0.1-local",
    status,
    checks,
    gates,
    readinessScore,
    passedCheckCount,
    totalCheckCount,
    refusalReasons,
    nextRecommendedMove:
      status === "AIM_V0_1_LOCAL_READY"
        ? "Consolidated KB update, then connect static preview to a bounded local app shell."
        : "Repair failed readiness checks before advancing.",
    localWorkingProduct: status === "AIM_V0_1_LOCAL_READY",
    readOnly: true,
    deterministic: true,
    localOnly: true,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimProductReadinessAuditPacket;
}