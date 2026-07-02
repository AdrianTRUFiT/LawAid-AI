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

  if (hasVerified && hasFalsePass) return "FALSE_PASS_PRESENT";
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
    boundaries: input.boundaries,
    latestVerifiedReport,
    nextAction: input.nextAction,
    humanFinalAuthority: true,
    finalAction: ""
  });
}

export function buildHilVerifiedRegistrySnapshot(records: HilVerifiedModuleRecord[]): HilVerifiedRegistrySnapshot {
  const verifiedCount = records.filter((record) => record.verified).length;
  const falsePassCount = records.reduce(
    (count, record) => count + record.knownFalsePassReports.filter(exists).length,
    0
  );
  const missingReportCount = records.filter((record) => record.latestVerifiedReport === null).length;

  return Object.freeze({
    createdAt: new Date().toISOString(),
    registryId: "HIL_VERIFIED_MODULE_REGISTRY_PASS1",
    records,
    verifiedCount,
    falsePassCount,
    missingReportCount,
    allCriticalVerified: missingReportCount === 0,
    humanFinalAuthority: true,
    finalAction: ""
  });
}

export function defaultAivaHilRegistry(sharedCoreRoot = "D:\\\\DEV\\\\AIVA\\\\shared-core"): HilVerifiedRegistrySnapshot {
  const records = [
    createHilVerifiedModuleRecord({
      moduleId: "ARMANIS_PASS1",
      moduleName: "ARMANIS Certification Engine v0 Pass 1",
      moduleClass: "CERTIFICATION_ENGINE",
      modulePath: path.join(sharedCoreRoot, "armanis"),
      expectedVerifiedReports: [
        path.join(sharedCoreRoot, "armanis", "reports", "armanis-pass1-verified-20260516-110318.md")
      ],
      knownFalsePassReports: [
        path.join(sharedCoreRoot, "armanis", "reports", "armanis-pass1-FALSE-PASS-20260516-110059.md"),
        path.join(sharedCoreRoot, "armanis", "reports", "armanis-pass1-FALSE-PASS-20260516-110229.md")
      ],
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
      moduleId: "NEIL_PASS1",
      moduleName: "NEIL Negotiation Intelligence Layer v0 Pass 1",
      moduleClass: "NEGOTIATION_INTELLIGENCE",
      modulePath: path.join(sharedCoreRoot, "neil"),
      expectedVerifiedReports: [
        path.join(sharedCoreRoot, "neil", "reports", "neil-pass1-verified-20260516-111204.md")
      ],
      knownFalsePassReports: [
        path.join(sharedCoreRoot, "neil", "reports", "neil-pass1-FALSE-PASS-20260516-111048.md")
      ],
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
      expectedVerifiedReports: [
        path.join(sharedCoreRoot, "neil", "reports", "neil-pass1-1-verified-20260516-111746.md")
      ],
      knownFalsePassReports: [],
      boundaries: [
        "No live negotiation",
        "No legal authority",
        "No payments",
        "No external APIs",
        "No autonomous agreement",
        "Human final authority"
      ],
      nextAction: "Ready for registry visibility; do not create live agent yet."
    })
  ];

  return buildHilVerifiedRegistrySnapshot(records);
}