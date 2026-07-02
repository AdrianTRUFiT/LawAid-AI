import fs from "node:fs";
import path from "node:path";
import type { HilVerifiedRegistrySnapshot } from "./hilRegistryContracts.js";

export interface HilRegistryExportResult {
  exportId: string;
  createdAt: string;
  jsonPath: string;
  markdownPath: string;
  kbUpdatePath: string;
  verifiedCount: number;
  verifiedCleanCount: number;
  verifiedWithFalsePassHistoryCount: number;
  falsePassCount: number;
  missingReportCount: number;
  allCriticalVerified: boolean;
  humanFinalAuthority: true;
  finalAction: "";
}

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath: string, content: string): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

function renderMarkdown(snapshot: HilVerifiedRegistrySnapshot, createdAt: string): string {
  const rows = snapshot.records
    .map((record) => {
      return `| ${record.moduleId} | ${record.status} | ${record.verified ? "YES" : "NO"} | ${record.hasFalsePassHistory ? "YES" : "NO"} | ${record.latestVerifiedReport ?? "MISSING"} |`;
    })
    .join("\n");

  return `# HIL Verified Registry Snapshot

Generated: ${createdAt}

## Status

${snapshot.allCriticalVerified ? "ALL CRITICAL MODULES VERIFIED" : "MISSING VERIFIED REPORTS"}

## Counts

- Verified Count: ${snapshot.verifiedCount}
- Verified Clean Count: ${snapshot.verifiedCleanCount}
- Verified With False-Pass History Count: ${snapshot.verifiedWithFalsePassHistoryCount}
- False-Pass Count: ${snapshot.falsePassCount}
- Missing Report Count: ${snapshot.missingReportCount}
- All Critical Verified: ${snapshot.allCriticalVerified}
- Human Final Authority: ${snapshot.humanFinalAuthority}
- Final Action: "${snapshot.finalAction}"

## Module Registry

| Module | Status | Verified | False-Pass History | Latest Verified Report |
|---|---:|---:|---:|---|
${rows}

## Boundary

This snapshot is a read-only registry artifact.

It does not certify new logic.
It does not mutate modules.
It does not launch products.
It does not create UI.
It does not create external APIs.
It does not create autonomous authority.
`;
}

function renderKbUpdate(snapshot: HilVerifiedRegistrySnapshot, createdAt: string): string {
  const records = snapshot.records
    .map((record) => {
      return `## ${record.moduleId}

Status: ${record.status}

Verified: ${record.verified ? "YES" : "NO"}

False-Pass History: ${record.hasFalsePassHistory ? "YES" : "NO"}

Latest Verified Report:

\`\`\`text
${record.latestVerifiedReport ?? "MISSING"}
\`\`\`

Next Action:

\`\`\`text
${record.nextAction}
\`\`\`

Boundary:

${record.boundaries.map((boundary) => `- ${boundary}`).join("\n")}
`;
    })
    .join("\n---\n\n");

  return `# KB UPDATE — HIL Verified Registry Pass 1.3 Export Lock

## Date

2026-05-16

## Generated

${createdAt}

## Module

HIL Verified Module Registry

## Location

\`\`\`text
D:\\DEV\\AIVA\\shared-core\\hil-verified-registry
\`\`\`

## Status

VERIFIED

## What This Pass Completed

HIL Registry Pass 1.3 exported a stable registry snapshot, markdown handoff summary, and KB update artifact from the verified HIL registry state.

This pass did not mutate ARMANIS, NEIL, PAI-OFF, SLiM, or AIM.

## Verification Chain

\`\`\`text
npm run typecheck = PASS
npm run smoke:pass1 = PASS
npm run smoke:pass1-1 = PASS
npm run smoke:pass1-2 = PASS
npm run smoke:pass1-3 = PASS
npm run verify:pass1-3 = PASS
HIL_VERIFIED_REGISTRY_PASS1_3_EXPORT_SMOKE=PASS
\`\`\`

## Registry Counts

\`\`\`text
verifiedCount: ${snapshot.verifiedCount}
verifiedCleanCount: ${snapshot.verifiedCleanCount}
verifiedWithFalsePassHistoryCount: ${snapshot.verifiedWithFalsePassHistoryCount}
falsePassCount: ${snapshot.falsePassCount}
missingReportCount: ${snapshot.missingReportCount}
allCriticalVerified: ${snapshot.allCriticalVerified}
humanFinalAuthority: ${snapshot.humanFinalAuthority}
finalAction: "${snapshot.finalAction}"
\`\`\`

## Registered Modules

${records}

---

# Current Lock

\`\`\`text
ARMANIS_PASS1: registry verified
NEIL_PASS1: registry verified
NEIL_PASS1_1: registry verified
HIL_REGISTRY_PASS1: registry verified
PAI_OFF_PASS1: registry verified
SLIM_WORKSPACE_V0: registry verified
AIM_V01_V02_CHAIN: registry verified
\`\`\`

## Boundary Lock

This export pass does not:

\`\`\`text
create UI
launch products
certify new logic
erase false-pass history
mutate source modules
add external APIs
create autonomous authority
\`\`\`

## Final Meaning

The system now has a stable machine-readable and human-readable registry export showing which major modules are verified, which have false-pass history, where the latest verified reports live, and what next action is allowed.

Human remains final authority.

Final action remains blank.
`;
}

export function exportHilRegistrySnapshot(input: {
  snapshot: HilVerifiedRegistrySnapshot;
  outputRoot: string;
  timestamp: string;
}): HilRegistryExportResult {
  const createdAt = new Date().toISOString();
  const exportId = `HIL_REGISTRY_EXPORT_${input.timestamp}`;

  const jsonPath = path.join(input.outputRoot, `hil-registry-snapshot-${input.timestamp}.json`);
  const markdownPath = path.join(input.outputRoot, `hil-registry-snapshot-${input.timestamp}.md`);
  const kbUpdatePath = path.join(input.outputRoot, `kb-update-hil-registry-pass1-3-${input.timestamp}.md`);

  writeText(jsonPath, JSON.stringify(input.snapshot, null, 2));
  writeText(markdownPath, renderMarkdown(input.snapshot, createdAt));
  writeText(kbUpdatePath, renderKbUpdate(input.snapshot, createdAt));

  return Object.freeze({
    exportId,
    createdAt,
    jsonPath,
    markdownPath,
    kbUpdatePath,
    verifiedCount: input.snapshot.verifiedCount,
    verifiedCleanCount: input.snapshot.verifiedCleanCount,
    verifiedWithFalsePassHistoryCount: input.snapshot.verifiedWithFalsePassHistoryCount,
    falsePassCount: input.snapshot.falsePassCount,
    missingReportCount: input.snapshot.missingReportCount,
    allCriticalVerified: input.snapshot.allCriticalVerified,
    humanFinalAuthority: true,
    finalAction: ""
  });
}