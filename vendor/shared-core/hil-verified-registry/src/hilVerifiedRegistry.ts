import fs from "node:fs";
import path from "node:path";
import type {
  HilRegistryStatus,
  HilVerifiedModuleRecord,
  HilVerifiedRegistrySnapshot
} from "./hilRegistryContracts.js";

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function listMatchingReports(reportDir: string, regex: RegExp): string[] {
  if (!fs.existsSync(reportDir)) return [];

  return fs.readdirSync(reportDir)
    .filter((name) => regex.test(name))
    .map((name) => path.join(reportDir, name));
}

function newestExisting(paths: string[]): string | null {
  const existing = paths.filter(exists);
  if (existing.length === 0) return null;

  return existing
    .map((p) => ({ p, t: fs.statSync(p).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0]?.p ?? null;
}

function deriveStatus(
  expectedVerifiedReports: string[],
  knownFalsePassReports: string[]
): HilRegistryStatus {
  const hasVerified = expectedVerifiedReports.some(exists);
  const hasFalsePass = knownFalsePassReports.some(exists);

  if (hasVerified && hasFalsePass) return "VERIFIED_WITH_FALSE_PASS_HISTORY";
  if (hasVerified) return "VERIFIED";
  if (!hasVerified) return "MISSING_REPORT";
  return "NOT_VERIFIED";
}

export function createHilVerifiedModuleRecord(input: {
  moduleId: string;
  moduleName: string;
  moduleClass: HilVerifiedModuleRecord["moduleClass"];
  modulePath: string;
  expectedVerifiedReports: string[];
  knownFalsePassReports?: string[];
  boundaries: string[];
  nextAction: string;
}): HilVerifiedModuleRecord {
  const knownFalsePassReports = input.knownFalsePassReports ?? [];
  const status = deriveStatus(input.expectedVerifiedReports, knownFalsePassReports);
  const latestVerifiedReport = newestExisting(input.expectedVerifiedReports);

  return Object.freeze({
    moduleId: input.moduleId,
    moduleName: input.moduleName,
    moduleClass: input.moduleClass,
    modulePath: input.modulePath,
    expectedVerifiedReports: input.expectedVerifiedReports,
    knownFalsePassReports,
    status,
    verified: latestVerifiedReport !== null,
    hasFalsePassHistory: knownFalsePassReports.some(exists),
    boundaries: input.boundaries,
    latestVerifiedReport,
    nextAction: input.nextAction,
    humanFinalAuthority: true,
    finalAction: ""
  });
}

export function buildHilVerifiedRegistrySnapshot(records: HilVerifiedModuleRecord[]): HilVerifiedRegistrySnapshot {
  const verifiedCount = records.filter((record) => record.verified).length;
  const verifiedCleanCount = records.filter(
    (record) => record.verified && !record.hasFalsePassHistory
  ).length;
  const verifiedWithFalsePassHistoryCount = records.filter(
    (record) => record.verified && record.hasFalsePassHistory
  ).length;
  const falsePassCount = records.reduce(
    (count, record) => count + record.knownFalsePassReports.filter(exists).length,
    0
  );
  const missingReportCount = records.filter((record) => record.latestVerifiedReport === null).length;

  return Object.freeze({
    createdAt: new Date().toISOString(),
    registryId: "HIL_VERIFIED_MODULE_REGISTRY_PASS1_5",
    records,
    verifiedCount,
    verifiedCleanCount,
    verifiedWithFalsePassHistoryCount,
    falsePassCount,
    missingReportCount,
    allCriticalVerified: missingReportCount === 0,
    humanFinalAuthority: true,
    finalAction: ""
  });
}

export function defaultAivaHilRegistry(sharedCoreRoot = "D:\\\\DEV\\\\AIVA\\\\shared-core"): HilVerifiedRegistrySnapshot {
  const aivaRoot = path.dirname(sharedCoreRoot);
  const slimRoot = "D:\\\\DEV\\\\OLLAMA\\\\slim-paid-local";
  const aimRoot = path.join(sharedCoreRoot, "aim");
  const paiOffRoot = aivaRoot;

  const armanisReports = path.join(sharedCoreRoot, "armanis", "reports");
  const devasReports = path.join(sharedCoreRoot, "armanis", "devas", "reports");
  const neilReports = path.join(sharedCoreRoot, "neil", "reports");
  const hilReports = path.join(sharedCoreRoot, "hil-verified-registry", "reports");
  const paiOffReports = path.join(paiOffRoot, "reports");
  const vueReports = path.join(aivaRoot, "reports");
  const slimReports = path.join(slimRoot, "reports");
  const aimReports = path.join(aimRoot, "reports");

  const records = [
    createHilVerifiedModuleRecord({
      moduleId: "ARMANIS_PASS1",
      moduleName: "ARMANIS Certification Engine v0 Pass 1",
      moduleClass: "CERTIFICATION_ENGINE",
      modulePath: path.join(sharedCoreRoot, "armanis"),
      expectedVerifiedReports: listMatchingReports(armanisReports, /^armanis-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(armanisReports, /^armanis-pass1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "No live negotiation",
        "No payments",
        "No blockchain",
        "No marketplace",
        "No legal authority",
        "Human final authority"
      ],
      nextAction: "Condition normalization only; no scope expansion."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "DEVAS_PASS1",
      moduleName: "DEVAS Deal Evaluation Value Assessment Pass 1",
      moduleClass: "DEAL_VALUE_ASSESSMENT",
      modulePath: path.join(sharedCoreRoot, "armanis", "devas"),
      expectedVerifiedReports: listMatchingReports(devasReports, /^devas-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(devasReports, /^devas-pass1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "Inside ARMANIS",
        "No finance model",
        "No legal advice",
        "No investment advice",
        "No live negotiation",
        "No external APIs",
        "No final deal authority",
        "Human final authority"
      ],
      nextAction: "Use DEVAS output as bounded deal-value intelligence for later NEIL posture only."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "NEIL_PASS1",
      moduleName: "NEIL Negotiation Intelligence Layer v0 Pass 1",
      moduleClass: "NEGOTIATION_INTELLIGENCE",
      modulePath: path.join(sharedCoreRoot, "neil"),
      expectedVerifiedReports: listMatchingReports(neilReports, /^neil-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(neilReports, /^neil-pass1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "No live negotiation",
        "No payments",
        "No signature execution",
        "No legal authority",
        "Human final authority"
      ],
      nextAction: "Use only as negotiation posture preparation."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "NEIL_PASS1_1",
      moduleName: "NEIL Pass 1.1 Strategy Normalization + Primetime Safety Hardening",
      moduleClass: "NEGOTIATION_INTELLIGENCE",
      modulePath: path.join(sharedCoreRoot, "neil"),
      expectedVerifiedReports: listMatchingReports(neilReports, /^neil-pass1-1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(neilReports, /^neil-pass1-1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "No live negotiation",
        "No legal authority",
        "No payments",
        "No external APIs",
        "No autonomous agreement",
        "Human final authority"
      ],
      nextAction: "Ready for registry visibility; do not create live agent yet."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "HIL_REGISTRY_PASS1",
      moduleName: "HIL Verified Module Registry Pass 1",
      moduleClass: "READINESS_ENGINE",
      modulePath: path.join(sharedCoreRoot, "hil-verified-registry"),
      expectedVerifiedReports: listMatchingReports(hilReports, /^hil-verified-registry-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(hilReports, /^hil.*FALSE-PASS.*registry.*pass1.*\.md$/),
      boundaries: [
        "Registry only",
        "No authority mutation",
        "No launch behavior",
        "No external APIs",
        "Human final authority"
      ],
      nextAction: "Expand registry visibility only."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "PAI_OFF_PASS1",
      moduleName: "PAI-OFF Commerce Model Pass 1",
      moduleClass: "COMMERCE_MODEL",
      modulePath: path.join(aivaRoot, "src", "lib", "pai-off"),
      expectedVerifiedReports: listMatchingReports(paiOffReports, /^pai-off-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(paiOffReports, /^pai-off-pass1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "No marketplace",
        "No booking engine",
        "No supplier integrations",
        "No payment execution",
        "No autonomous purchasing",
        "TravelFlowAI remains umbrella",
        "Human final authority"
      ],
      nextAction: "If missing, run or re-lock PAI-OFF Pass 1 before UI exposure."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "VUE_PASS1",
      moduleName: "VUEⓈ Verified User Experience System Pass 1",
      moduleClass: "VERIFIED_EXPERIENCE_RAIL",
      modulePath: path.join(aivaRoot, "src", "lib", "vue"),
      expectedVerifiedReports: listMatchingReports(vueReports, /^vue-pass1-verified-\d{8}-\d{6}\.md$/),
      knownFalsePassReports: listMatchingReports(vueReports, /^vue-pass1-FALSE-PASS-\d{8}-\d{6}\.md$/),
      boundaries: [
        "Verified experience model only",
        "No UI",
        "No event platform",
        "No ticketing execution",
        "No payment execution",
        "No settlement execution",
        "No external APIs",
        "No rights claims",
        "Placeholder-only connected systems",
        "Human final authority"
      ],
      nextAction: "Use VUEⓈ as bounded verified experience rail; do not build event platform or execution flows yet."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "SLIM_WORKSPACE_V0",
      moduleName: "SLiM Workspace v0 Local Sovereign Cockpit",
      moduleClass: "LOCAL_COCKPIT",
      modulePath: slimRoot,
      expectedVerifiedReports: [
        ...listMatchingReports(slimReports, /^slim-workspace-v0-verified-\d{8}-\d{6}\.md$/),
        ...listMatchingReports(slimReports, /^slim-workspace-v0-hardening-verified-\d{8}-\d{6}\.md$/),
        ...listMatchingReports(slimReports, /^slim-context-quality-ui-pass2-verified-\d{8}-\d{6}\.md$/)
      ],
      knownFalsePassReports: listMatchingReports(slimReports, /^.*FALSE-PASS.*\.md$/),
      boundaries: [
        "Local only",
        "No cloud calls",
        "No external telemetry",
        "No Final Coder promotion authority",
        "Candidate artifacts only",
        "Human final authority"
      ],
      nextAction: "Seed governed project context; do not add promotion authority."
    }),

    createHilVerifiedModuleRecord({
      moduleId: "AIM_V01_V02_CHAIN",
      moduleName: "AIM v0.1 Core + v0.2 Local Product Demo Chain",
      moduleClass: "READINESS_ENGINE",
      modulePath: aimRoot,
      expectedVerifiedReports: [
        ...listMatchingReports(aimReports, /^aim-pass\d+.*verified-\d{8}-\d{6}\.md$/),
        ...listMatchingReports(aimReports, /^aim-v02.*verified-\d{8}-\d{6}\.md$/),
        ...listMatchingReports(aimReports, /^aim.*product.*verified-\d{8}-\d{6}\.md$/)
      ],
      knownFalsePassReports: listMatchingReports(aimReports, /^.*FALSE-PASS.*\.md$/),
      boundaries: [
        "No brokerage APIs",
        "No trade execution",
        "No financial advice authority",
        "No live market data dependency",
        "Readiness and review only",
        "Human final authority"
      ],
      nextAction: "Move toward runtime assembly and polished demo only after registry visibility."
    })
  ];

  return buildHilVerifiedRegistrySnapshot(records);
}