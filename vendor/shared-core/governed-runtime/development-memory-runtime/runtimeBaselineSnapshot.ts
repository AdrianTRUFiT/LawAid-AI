import * as fs from "node:fs";
import * as path from "node:path";
import { buildGateOverview } from "./gateOverview";
import { inspectAllActiveRootLineageHealth } from "./lineageHealth";
import { buildDerivativeFamilySnapshots } from "./derivativeFamilySnapshot";

export interface RuntimeBaselineSnapshot {
  snapshotId: string;
  createdAt: string;
  scope: "governed_runtime";
  summary: {
    candidates: number;
    acceptedNotActive: number;
    acceptedDerivativesPendingActivation: number;
    rootsNeedingHardening: number;
    activeRootsWithDescendants: number;
    retiredIds: number;
    lineageIssueRoots: number;
    derivativeFamilies: number;
  };
  gateOverview: ReturnType<typeof buildGateOverview>;
  lineageHealth: ReturnType<typeof inspectAllActiveRootLineageHealth>;
  derivativeFamilies: ReturnType<typeof buildDerivativeFamilySnapshots>;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function snapshotDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "baseline-snapshots");
  ensureDir(dir);
  return dir;
}

export function createRuntimeBaselineSnapshot(): { filePath: string; snapshot: RuntimeBaselineSnapshot } {
  const createdAt = new Date().toISOString();
  const snapshotId = `runtime_baseline_${Date.now()}`;

  const gateOverview = buildGateOverview();
  const lineageHealth = inspectAllActiveRootLineageHealth();
  const derivativeFamilies = buildDerivativeFamilySnapshots();
  const lineageIssueRoots = lineageHealth.filter((r) => r.issues.length > 0).length;

  const snapshot: RuntimeBaselineSnapshot = {
    snapshotId,
    createdAt,
    scope: "governed_runtime",
    summary: {
      candidates: gateOverview.candidates.length,
      acceptedNotActive: gateOverview.acceptedNotActive.length,
      acceptedDerivativesPendingActivation: gateOverview.acceptedDerivativesPendingActivation.length,
      rootsNeedingHardening: gateOverview.rootsNeedingHardening.length,
      activeRootsWithDescendants: gateOverview.activeRootsWithDescendants.length,
      retiredIds: gateOverview.retiredIds.length,
      lineageIssueRoots,
      derivativeFamilies: derivativeFamilies.length
    },
    gateOverview,
    lineageHealth,
    derivativeFamilies
  };

  const filePath = path.join(snapshotDir(), `${snapshotId}.baseline.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf8");

  return { filePath, snapshot };
}
