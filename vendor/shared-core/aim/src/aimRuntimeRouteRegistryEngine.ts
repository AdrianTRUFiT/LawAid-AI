import type {
  AimRuntimeRouteDefinition,
  AimRuntimeRouteId,
  AimRuntimeRouteRegistryGovernancePacket,
  AimRuntimeRouteRegistryInput,
  AimRuntimeRouteRegistryPacket,
  AimRuntimeRouteRegistryStatus,
  AimRuntimeRouteStatus
} from "./aimRuntimeRouteRegistryContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "runtime_route_registry";
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
  return "aim_runtime_routes_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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

function routeStatusFromSource(sourceStatus: string): AimRuntimeRouteStatus {
  if (sourceStatus.includes("REFUSED")) return "ROUTE_REFUSED";
  if (
    sourceStatus.includes("READY") ||
    sourceStatus.includes("CONNECTED") ||
    sourceStatus.includes("LOCAL_READY")
  ) return "ROUTE_READY";
  return "ROUTE_HELD";
}

function route(
  routeId: AimRuntimeRouteId,
  path: string,
  label: string,
  description: string,
  sourcePacketId: string,
  sourceStatus: string,
  order: number
): AimRuntimeRouteDefinition {
  const routeStatus = routeStatusFromSource(sourceStatus);

  return freezeDeep({
    routeId,
    path,
    label,
    description,
    sourcePacketId,
    sourceStatus,
    routeStatus,
    order,
    visible: true,
    navigable: routeStatus === "ROUTE_READY",
    readOnly: true,
    sourceOnly: true,
    runtimeAssemblyOnly: true,
    mayMountComponent: false,
    mayMutateAimOutput: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayGovern: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimRuntimeRouteDefinition;
}

export function deriveAimRuntimeRouteRegistryStatus(routes: readonly AimRuntimeRouteDefinition[]): AimRuntimeRouteRegistryStatus {
  if (routes.some((item) => item.routeStatus === "ROUTE_REFUSED")) return "AIM_V0_3_ROUTE_REGISTRY_REFUSED";
  if (routes.every((item) => item.routeStatus === "ROUTE_READY")) return "AIM_V0_3_ROUTE_REGISTRY_READY";
  return "AIM_V0_3_ROUTE_REGISTRY_HELD";
}

export function buildAimRuntimeRouteRegistryPacket(
  input: AimRuntimeRouteRegistryInput,
  createdAt = "2026-05-14T23:30:00.000Z"
): AimRuntimeRouteRegistryPacket {
  const routes = [
    route(
      "manual_intake_ui",
      "/aim/intake",
      "Manual Intake",
      "Bounded manual evidence intake surface.",
      input.intakeUi.uiId,
      input.intakeUi.uiStatus,
      1
    ),
    route(
      "operator_shell",
      "/aim/shell",
      "Operator Shell",
      "Read-only shell visibility for verified AIM output.",
      input.shellAdapter.shellAdapterId,
      input.shellAdapter.status,
      2
    ),
    route(
      "preview_record_viewer",
      "/aim/viewer",
      "Preview + Record Viewer",
      "Read-only preview, local record, journal reference, and decision snapshot viewer.",
      input.previewRecordViewer.viewerId,
      input.previewRecordViewer.status,
      3
    ),
    route(
      "watchlist_human_review",
      "/aim/review",
      "Watchlist + Human Review",
      "Read-only thesis continuity and human review surface.",
      input.watchlistReviewView.viewId,
      input.watchlistReviewView.status,
      4
    ),
    route(
      "feedback_demo_audit",
      "/aim/demo-audit",
      "Feedback Demo Audit",
      "Read-only feedback, learning loop, and v0.2 demo audit surface.",
      input.feedbackDemoAudit.demoAuditId,
      input.feedbackDemoAudit.status,
      5
    ),
    route(
      "product_readiness_audit",
      "/aim/readiness",
      "Product Readiness Audit",
      "Read-only AIM local product readiness audit.",
      input.productReadiness.auditId,
      input.productReadiness.status,
      6
    )
  ];

  const readyRouteCount = routes.filter((item) => item.routeStatus === "ROUTE_READY").length;
  const heldRouteCount = routes.filter((item) => item.routeStatus === "ROUTE_HELD").length;
  const refusedRouteCount = routes.filter((item) => item.routeStatus === "ROUTE_REFUSED").length;
  const status = deriveAimRuntimeRouteRegistryStatus(routes);

  const registryHash = simpleDeterministicHash({
    productReadinessAuditId: input.productReadiness.auditId,
    shellAdapterId: input.shellAdapter.shellAdapterId,
    intakeUiId: input.intakeUi.uiId,
    previewRecordViewerId: input.previewRecordViewer.viewerId,
    watchlistReviewViewId: input.watchlistReviewView.viewId,
    feedbackDemoAuditId: input.feedbackDemoAudit.demoAuditId,
    routes: routes.map((item) => ({
      routeId: item.routeId,
      path: item.path,
      sourcePacketId: item.sourcePacketId,
      sourceStatus: item.sourceStatus,
      routeStatus: item.routeStatus
    })),
    status
  });

  return freezeDeep({
    registryId: "aim_runtime_route_registry_" + stableIdPart(registryHash),
    createdAt,
    title: "AIM v0.3 Local Runtime Route Registry",
    product: "AIM — AI MarketIntel",
    version: "v0.3-runtime-route-registry-sprint1",
    status,
    routes,
    routeCount: routes.length,
    readyRouteCount,
    heldRouteCount,
    refusedRouteCount,
    defaultRouteId: "manual_intake_ui",
    registryHash,
    readOnly: true,
    deterministic: true,
    localOnly: true,
    runtimeAssemblyOnly: true,
    mayMountComponents: false,
    mayRedesignUi: false,
    mayMutateAimOutput: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayGovern: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimRuntimeRouteRegistryPacket;
}

export function resolveAimRuntimeRoute(
  registry: AimRuntimeRouteRegistryPacket,
  routeId: AimRuntimeRouteId
): AimRuntimeRouteDefinition {
  const found = registry.routes.find((item) => item.routeId === routeId);
  if (!found) throw new Error("AIM runtime route not found: " + routeId);
  return found;
}

export function verifyAimRuntimeRouteRegistryGovernance(
  registry: AimRuntimeRouteRegistryPacket
): AimRuntimeRouteRegistryGovernancePacket {
  const routeIds = new Set(registry.routes.map((item) => item.routeId));
  const paths = new Set(registry.routes.map((item) => item.path));
  const expectedRouteIds: AimRuntimeRouteId[] = [
    "manual_intake_ui",
    "operator_shell",
    "preview_record_viewer",
    "watchlist_human_review",
    "feedback_demo_audit",
    "product_readiness_audit"
  ];

  const checks: Record<string, boolean> = {
    readOnly: registry.readOnly === true,
    deterministic: registry.deterministic === true,
    localOnly: registry.localOnly === true,
    runtimeAssemblyOnly: registry.runtimeAssemblyOnly === true,
    productNamePreserved: registry.product === "AIM — AI MarketIntel",
    versionLocked: registry.version === "v0.3-runtime-route-registry-sprint1",
    routeCountCorrect: registry.routeCount === 6 && registry.routes.length === 6,
    allRequiredRoutesPresent: expectedRouteIds.every((item) => routeIds.has(item)),
    uniqueRouteIds: routeIds.size === registry.routes.length,
    uniquePaths: paths.size === registry.routes.length,
    defaultRouteValid: routeIds.has(registry.defaultRouteId),
    readyCountsMatch: registry.readyRouteCount === registry.routes.filter((item) => item.routeStatus === "ROUTE_READY").length,
    heldCountsMatch: registry.heldRouteCount === registry.routes.filter((item) => item.routeStatus === "ROUTE_HELD").length,
    refusedCountsMatch: registry.refusedRouteCount === registry.routes.filter((item) => item.routeStatus === "ROUTE_REFUSED").length,
    noComponentMountingYet: registry.mayMountComponents === false,
    noUiRedesign: registry.mayRedesignUi === false,
    noAimOutputMutation: registry.mayMutateAimOutput === false,
    noJournalMutation: registry.mayMutateJournal === false,
    noTruthCreation: registry.mayCreateTruth === false,
    noGovernanceAuthority: registry.mayGovern === false,
    noDecisionApproval: registry.mayApproveDecision === false,
    noTradeExecution: registry.mayExecuteTrade === false,
    noFinancialAdvice: registry.mayProvideFinancialAdvice === false,
    noLiveData: registry.mayUseLiveData === false,
    noExternalApi: registry.mayCallExternalApi === false,
    noSoulWrite: registry.mayWriteSoul === false,
    humanAuthorityFinal: registry.finalAuthority === "Human",
    finalActionBlank: registry.finalAction === "",
    routesGoverned: registry.routes.every((item) =>
      item.visible === true &&
      item.readOnly === true &&
      item.sourceOnly === true &&
      item.runtimeAssemblyOnly === true &&
      item.mayMountComponent === false &&
      item.mayMutateAimOutput === false &&
      item.mayMutateJournal === false &&
      item.mayCreateTruth === false &&
      item.mayGovern === false &&
      item.mayApproveDecision === false &&
      item.mayExecuteTrade === false &&
      item.mayProvideFinancialAdvice === false &&
      item.mayUseLiveData === false &&
      item.mayCallExternalApi === false &&
      item.mayWriteSoul === false &&
      item.finalAction === ""
    )
  };

  const refusalReasons = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  return freezeDeep({
    governanceId: "aim_runtime_route_registry_governance_" + stableIdPart(registry.registryId),
    createdAt: "2026-05-14T23:35:00.000Z",
    sourceRegistryId: registry.registryId,
    checks,
    status: refusalReasons.length === 0 ? "ROUTE_REGISTRY_GOVERNANCE_VERIFIED" : "ROUTE_REGISTRY_GOVERNANCE_REFUSED",
    refusalReasons,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimRuntimeRouteRegistryGovernancePacket;
}