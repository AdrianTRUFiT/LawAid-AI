import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimManualIntakeUiPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimPreviewRecordViewerPacket,
  buildAimProductReadinessAuditPacket,
  buildAimRuntimeRouteRegistryPacket,
  buildAimShellAdapterPacket,
  buildAimV02FeedbackDemoAuditPacket,
  buildAimWatchlistReviewViewPacket,
  buildAimWatchlistThesisItem,
  resolveAimRuntimeRoute,
  verifyAimRuntimeRouteRegistryGovernance
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft);
const localRecord = buildAimLocalRecordPacket(flow);
const watchlistItem = buildAimWatchlistThesisItem(localRecord, 2);

const reviewA = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human confirmed this as a learning artifact.",
  "Route registry keeps runtime navigation bounded.",
  "Proceed to component mounting only after route registry verification.",
  ""
);

const reviewB = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_REVIEWED_NO_ACTION",
  "RISK_REDUCED",
  "Human reviewed and took no action.",
  "Route visibility does not create authority.",
  "Keep all route targets read-only.",
  ""
);

const feedbackSummary = buildAimFeedbackSummaryPacket([localRecord], [watchlistItem], [reviewA, reviewB]);
const productReadiness = buildAimProductReadinessAuditPacket({
  flow,
  localRecord,
  watchlistItem,
  humanReviews: [reviewA, reviewB],
  feedbackSummary
});
const shellAdapter = buildAimShellAdapterPacket({ flow, localRecord, watchlistItem, feedbackSummary });
const intakeUi = buildAimManualIntakeUiPacket(validDraft);
const previewRecordViewer = buildAimPreviewRecordViewerPacket({ flow, localRecord, shellAdapter });
const watchlistReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem,
  localRecord,
  reviewOutcome: reviewA,
  viewerPacket: previewRecordViewer
});
const feedbackDemoAudit = buildAimV02FeedbackDemoAuditPacket({
  productReadiness,
  feedbackSummary,
  shellAdapter,
  intakeUi,
  previewRecordViewer,
  watchlistReviewView
});

const registryA = buildAimRuntimeRouteRegistryPacket({
  productReadiness,
  shellAdapter,
  intakeUi,
  previewRecordViewer,
  watchlistReviewView,
  feedbackDemoAudit
});

const registryB = buildAimRuntimeRouteRegistryPacket({
  productReadiness,
  shellAdapter,
  intakeUi,
  previewRecordViewer,
  watchlistReviewView,
  feedbackDemoAudit
});

const governance = verifyAimRuntimeRouteRegistryGovernance(registryA);

assert(registryA.registryHash === registryB.registryHash, "Runtime route registry hash must be deterministic.");
assert(registryA.status === "AIM_V0_3_ROUTE_REGISTRY_READY", "Complete v0.2 demo chain should create ready route registry.");
assert(registryA.product === "AIM — AI MarketIntel", "AIM product name must remain unchanged.");
assert(registryA.version === "v0.3-runtime-route-registry-sprint1", "Runtime route registry version must be locked.");
assert(registryA.routeCount === 6, "Runtime route registry must expose six route targets.");
assert(registryA.routes.length === 6, "Runtime route count must match routes length.");
assert(registryA.readyRouteCount === 6, "All ready inputs should create six ready routes.");
assert(registryA.heldRouteCount === 0, "Ready registry should have zero held routes.");
assert(registryA.refusedRouteCount === 0, "Ready registry should have zero refused routes.");
assert(registryA.defaultRouteId === "manual_intake_ui", "Manual intake should be the default route.");

const routeIds = new Set(registryA.routes.map((route) => route.routeId));
assert(routeIds.has("manual_intake_ui"), "Manual intake UI route required.");
assert(routeIds.has("operator_shell"), "Operator shell route required.");
assert(routeIds.has("preview_record_viewer"), "Preview + record viewer route required.");
assert(routeIds.has("watchlist_human_review"), "Watchlist + human review route required.");
assert(routeIds.has("feedback_demo_audit"), "Feedback demo audit route required.");
assert(routeIds.has("product_readiness_audit"), "Product readiness audit route required.");

const manualRoute = resolveAimRuntimeRoute(registryA, "manual_intake_ui");
const shellRoute = resolveAimRuntimeRoute(registryA, "operator_shell");
const viewerRoute = resolveAimRuntimeRoute(registryA, "preview_record_viewer");
const reviewRoute = resolveAimRuntimeRoute(registryA, "watchlist_human_review");
const demoRoute = resolveAimRuntimeRoute(registryA, "feedback_demo_audit");
const readinessRoute = resolveAimRuntimeRoute(registryA, "product_readiness_audit");

assert(manualRoute.path === "/aim/intake", "Manual intake route path must be locked.");
assert(shellRoute.path === "/aim/shell", "Operator shell route path must be locked.");
assert(viewerRoute.path === "/aim/viewer", "Preview viewer route path must be locked.");
assert(reviewRoute.path === "/aim/review", "Watchlist review route path must be locked.");
assert(demoRoute.path === "/aim/demo-audit", "Demo audit route path must be locked.");
assert(readinessRoute.path === "/aim/readiness", "Product readiness route path must be locked.");

assert(manualRoute.sourcePacketId === intakeUi.uiId, "Manual route must preserve intake UI source packet ID.");
assert(shellRoute.sourcePacketId === shellAdapter.shellAdapterId, "Shell route must preserve shell adapter source packet ID.");
assert(viewerRoute.sourcePacketId === previewRecordViewer.viewerId, "Viewer route must preserve viewer source packet ID.");
assert(reviewRoute.sourcePacketId === watchlistReviewView.viewId, "Review route must preserve review view source packet ID.");
assert(demoRoute.sourcePacketId === feedbackDemoAudit.demoAuditId, "Demo audit route must preserve demo audit source packet ID.");
assert(readinessRoute.sourcePacketId === productReadiness.auditId, "Readiness route must preserve product readiness source packet ID.");

for (const route of registryA.routes) {
  assert(route.routeStatus === "ROUTE_READY", "Ready registry route should be ROUTE_READY: " + route.routeId);
  assert(route.visible === true, "Route must be visible.");
  assert(route.navigable === true, "Ready route must be navigable.");
  assert(route.readOnly === true, "Route must be read-only.");
  assert(route.sourceOnly === true, "Route must be source-only.");
  assert(route.runtimeAssemblyOnly === true, "Route must be runtime assembly only.");
  assert(route.mayMountComponent === false, "Sprint 1 route must not mount components yet.");
  assert(route.mayMutateAimOutput === false, "Route must not mutate AIM output.");
  assert(route.mayMutateJournal === false, "Route must not mutate journal.");
  assert(route.mayCreateTruth === false, "Route must not create truth.");
  assert(route.mayGovern === false, "Route must not govern.");
  assert(route.mayApproveDecision === false, "Route must not approve decision.");
  assert(route.mayExecuteTrade === false, "Route must not execute trade.");
  assert(route.mayProvideFinancialAdvice === false, "Route must not provide financial advice.");
  assert(route.mayUseLiveData === false, "Route must not use live data.");
  assert(route.mayCallExternalApi === false, "Route must not call external API.");
  assert(route.mayWriteSoul === false, "Route must not write to S:\\SOUL.");
  assert(route.finalAction === "", "Route final action must remain blank.");
  assert(Object.isFrozen(route), "Route must be frozen.");
}

assert(registryA.readOnly === true, "Registry must be read-only.");
assert(registryA.deterministic === true, "Registry must be deterministic.");
assert(registryA.localOnly === true, "Registry must be local-only.");
assert(registryA.runtimeAssemblyOnly === true, "Registry must be runtime assembly only.");
assert(registryA.mayMountComponents === false, "Sprint 1 registry must not mount components yet.");
assert(registryA.mayRedesignUi === false, "Registry must not redesign UI.");
assert(registryA.mayMutateAimOutput === false, "Registry must not mutate AIM output.");
assert(registryA.mayMutateJournal === false, "Registry must not mutate journal.");
assert(registryA.mayCreateTruth === false, "Registry must not create truth.");
assert(registryA.mayGovern === false, "Registry must not govern.");
assert(registryA.mayApproveDecision === false, "Registry must not approve decision.");
assert(registryA.mayExecuteTrade === false, "Registry must not execute trade.");
assert(registryA.mayProvideFinancialAdvice === false, "Registry must not provide financial advice.");
assert(registryA.mayUseLiveData === false, "Registry must not use live data.");
assert(registryA.mayCallExternalApi === false, "Registry must not call external API.");
assert(registryA.mayWriteSoul === false, "Registry must not write to S:\\SOUL.");
assert(registryA.finalAuthority === "Human", "Human authority must remain final.");
assert(registryA.finalAction === "", "Registry final action must remain blank.");
assert(Object.isFrozen(registryA), "Registry packet must be frozen.");
assert(Object.isFrozen(registryA.routes), "Registry routes must be frozen.");

for (const [check, passed] of Object.entries(governance.checks)) {
  assert(passed === true, "Route registry governance check failed: " + check);
}

assert(governance.status === "ROUTE_REGISTRY_GOVERNANCE_VERIFIED", "Route registry governance must verify.");
assert(governance.refusalReasons.length === 0, "Route registry governance should have no refusal reasons.");

const heldDraft = {
  ...validDraft,
  draftId: "draft_route_registry_held_001",
  evidenceStrength: "Moderate" as const
};

const heldFlow = buildAimOperatorEndToEndLocalFlow(heldDraft);
const heldRecord = buildAimLocalRecordPacket(heldFlow);
const heldWatchlist = buildAimWatchlistThesisItem(heldRecord, 0);
const heldReview = buildAimHumanReviewOutcomePacket(
  heldRecord,
  "HUMAN_DEFERRED",
  "INSUFFICIENT_DATA",
  "Human deferred review pending stronger evidence.",
  "Held routes should remain visible without navigation escalation.",
  "Require more confirmation.",
  ""
);
const heldFeedback = buildAimFeedbackSummaryPacket([heldRecord], [heldWatchlist], [heldReview]);
const heldReadiness = buildAimProductReadinessAuditPacket({
  flow: heldFlow,
  localRecord: heldRecord,
  watchlistItem: heldWatchlist,
  humanReviews: [heldReview],
  feedbackSummary: heldFeedback
});
const heldShell = buildAimShellAdapterPacket({ flow: heldFlow, localRecord: heldRecord, watchlistItem: heldWatchlist, feedbackSummary: heldFeedback });
const heldIntake = buildAimManualIntakeUiPacket(heldDraft);
const heldViewer = buildAimPreviewRecordViewerPacket({ flow: heldFlow, localRecord: heldRecord, shellAdapter: heldShell });
const heldReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem: heldWatchlist,
  localRecord: heldRecord,
  reviewOutcome: heldReview,
  viewerPacket: heldViewer
});
const heldDemo = buildAimV02FeedbackDemoAuditPacket({
  productReadiness: heldReadiness,
  feedbackSummary: heldFeedback,
  shellAdapter: heldShell,
  intakeUi: heldIntake,
  previewRecordViewer: heldViewer,
  watchlistReviewView: heldReviewView
});
const heldRegistry = buildAimRuntimeRouteRegistryPacket({
  productReadiness: heldReadiness,
  shellAdapter: heldShell,
  intakeUi: heldIntake,
  previewRecordViewer: heldViewer,
  watchlistReviewView: heldReviewView,
  feedbackDemoAudit: heldDemo
});
const heldGovernance = verifyAimRuntimeRouteRegistryGovernance(heldRegistry);

assert(heldRegistry.status === "AIM_V0_3_ROUTE_REGISTRY_HELD", "Held chain should create held route registry.");
assert(heldRegistry.heldRouteCount > 0, "Held registry should include held routes.");
assert(heldRegistry.mayApproveDecision === false, "Held registry must not approve decision.");
assert(heldRegistry.finalAction === "", "Held registry final action must remain blank.");
assert(heldGovernance.status === "ROUTE_REGISTRY_GOVERNANCE_VERIFIED", "Held route registry governance must verify.");

const refusedDraft = {
  ...validDraft,
  draftId: "draft_route_registry_refused_001",
  proposedAction: "Buy now and execute trade immediately."
};

const refusedFlow = buildAimOperatorEndToEndLocalFlow(refusedDraft);
const refusedRecord = buildAimLocalRecordPacket(refusedFlow);
const refusedWatchlist = buildAimWatchlistThesisItem(refusedRecord, 0);
const refusedReview = buildAimHumanReviewOutcomePacket(
  refusedRecord,
  "HUMAN_REJECTED_THESIS",
  "CONTRADICTION_CONFIRMED",
  "Human rejected prohibited action language.",
  "Refused routes must surface boundaries without inventing downstream action.",
  "Keep route visible but refused.",
  "Execution language confirmed."
);
const refusedFeedback = buildAimFeedbackSummaryPacket([refusedRecord], [refusedWatchlist], [refusedReview]);
const refusedReadiness = buildAimProductReadinessAuditPacket({
  flow: refusedFlow,
  localRecord: refusedRecord,
  watchlistItem: refusedWatchlist,
  humanReviews: [refusedReview],
  feedbackSummary: refusedFeedback
});
const refusedShell = buildAimShellAdapterPacket({ flow: refusedFlow, localRecord: refusedRecord, watchlistItem: refusedWatchlist, feedbackSummary: refusedFeedback });
const refusedIntake = buildAimManualIntakeUiPacket(refusedDraft);
const refusedViewer = buildAimPreviewRecordViewerPacket({ flow: refusedFlow, localRecord: refusedRecord, shellAdapter: refusedShell });
const refusedReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem: refusedWatchlist,
  localRecord: refusedRecord,
  reviewOutcome: refusedReview,
  viewerPacket: refusedViewer
});
const refusedDemo = buildAimV02FeedbackDemoAuditPacket({
  productReadiness: refusedReadiness,
  feedbackSummary: refusedFeedback,
  shellAdapter: refusedShell,
  intakeUi: refusedIntake,
  previewRecordViewer: refusedViewer,
  watchlistReviewView: refusedReviewView
});
const refusedRegistry = buildAimRuntimeRouteRegistryPacket({
  productReadiness: refusedReadiness,
  shellAdapter: refusedShell,
  intakeUi: refusedIntake,
  previewRecordViewer: refusedViewer,
  watchlistReviewView: refusedReviewView,
  feedbackDemoAudit: refusedDemo
});
const refusedGovernance = verifyAimRuntimeRouteRegistryGovernance(refusedRegistry);

assert(refusedRegistry.status === "AIM_V0_3_ROUTE_REGISTRY_REFUSED", "Refused chain should create refused route registry.");
assert(refusedRegistry.refusedRouteCount > 0, "Refused registry should include refused routes.");
assert(refusedRegistry.mayExecuteTrade === false, "Refused registry must not execute trade.");
assert(refusedRegistry.finalAction === "", "Refused registry final action must remain blank.");
assert(refusedGovernance.status === "ROUTE_REGISTRY_GOVERNANCE_VERIFIED", "Refused route registry governance must verify.");

console.log("AIM_V03_RUNTIME_ROUTE_REGISTRY_SPRINT1_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "runtime route registry packet created",
      "registry hash deterministic",
      "AIM product name preserved",
      "v0.3 runtime route registry version locked",
      "manual intake UI route registered",
      "operator shell route registered",
      "preview record viewer route registered",
      "watchlist human review route registered",
      "feedback demo audit route registered",
      "product readiness audit route registered",
      "route source packet IDs preserved",
      "route source statuses preserved",
      "ready route registry works",
      "held route registry works",
      "refused route registry works",
      "route resolver works",
      "route registry governance verifies",
      "registry packet frozen",
      "route definitions frozen",
      "no component mounting yet",
      "no UI redesign",
      "no AIM output mutation",
      "no journal mutation",
      "no truth creation",
      "no governance authority",
      "no decision approval",
      "no trade execution",
      "no financial advice",
      "no live data",
      "no external API",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    registryStatus: registryA.status,
    heldRegistryStatus: heldRegistry.status,
    refusedRegistryStatus: refusedRegistry.status,
    routeCount: registryA.routeCount,
    readyRouteCount: registryA.readyRouteCount,
    registryHash: registryA.registryHash
  },
  null,
  2
));