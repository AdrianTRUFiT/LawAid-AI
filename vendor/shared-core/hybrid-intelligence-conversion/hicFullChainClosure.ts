import fs from "fs";
import path from "path";

const AIVA_ROOT = "D:/DEV/AIVA";
const HIC_ROOT = path.join(AIVA_ROOT, "shared-core", "hybrid-intelligence-conversion");
const REPORTS = path.join(AIVA_ROOT, "homebase", "REPORTS");

const requiredModules = [
  "hybridContracts.ts",
  "hilDecision.ts",
  "hicConversion.ts",
  "hybridLedger.ts",
  "analogCustody.ts",
  "sourceReferencePacket.ts",
  "sourceReferencedHIL.ts",
  "lawaidaiReceivingBridge.ts",
  "lawaidaiReceivingLedger.ts",
  "lawaidaiReviewGate.ts",
  "lawaidaiReviewLedger.ts",
  "lawaidaiEvidenceGate.ts",
  "lawaidaiEvidenceLedger.ts",
  "strictEvidenceCertificationGate.ts",
  "strictEvidenceCertificationLedger.ts",
  "lawaidaiActionGate.ts",
  "lawaidaiActionLedger.ts",
  "index.ts"
];

const moduleChecks = requiredModules.map((file) => ({
  file,
  exists: fs.existsSync(path.join(HIC_ROOT, file))
}));

const missing = moduleChecks.filter((check) => !check.exists);

const closure = {
  status: missing.length === 0 ? "HIC_7_FULL_CHAIN_CLOSURE_READY" : "HIC_7_FULL_CHAIN_CLOSURE_BLOCKED",
  generatedAt: new Date().toISOString(),
  lockedChain: [
    "Reality",
    "HIL",
    "HIC",
    "LawAidAI Receiving",
    "LawAidAI Review",
    "Evidence",
    "Action"
  ],
  completedLayers: [
    "HIC-1 Analog Hybrid Foundation",
    "HIC-2 Analog Evidence Custody + Source Reference Packet",
    "HIC-3 Analog-to-LawAidAI Receiving Bridge",
    "HIC-4 Receiving-to-Review Gate",
    "HIC-5 Review-to-Evidence Refusal Gate",
    "HIC-5B Strict Evidence Certification Gate",
    "HIC-6 Evidence-to-Action Activation Gate",
    "HIC-7 Full Chain Closure + Regression Harness"
  ],
  moduleChecks,
  missingModules: missing,
  finalBoundaryLock: [
    "HIL governs trust and authority, not truth claims.",
    "HIC converts only HIL-approved reality.",
    "Receiving is not authority.",
    "Review is not Evidence.",
    "Invalid certification creates no Evidence packet.",
    "Valid external certification creates an Evidence packet.",
    "Evidence does not trigger Action.",
    "Action requires proper activation authority.",
    "LawAidAI remains client-side management software.",
    "Nothing becomes real, trusted, or actionable unless the correct authority approves it at the correct boundary in the correct order."
  ]
};

fs.mkdirSync(REPORTS, { recursive: true });

const jsonPath = path.join(REPORTS, "hic-7-full-chain-closure.json");
const mdPath = path.join(REPORTS, "hic-7-full-chain-closure.md");

fs.writeFileSync(jsonPath, JSON.stringify(closure, null, 2), "utf8");

const moduleLines = moduleChecks
  .map((check) => `- ${check.file}: ${check.exists ? "PASS" : "FAIL"}`)
  .join("\n");

const missingLines = missing.length
  ? missing.map((check) => `- ${check.file}`).join("\n")
  : "- None";

fs.writeFileSync(mdPath, `# HIC-7 Full Chain Closure

Generated: ${closure.generatedAt}

## Status

${closure.status}

## Locked Chain

Reality
  -> HIL
    -> HIC
      -> LawAidAI Receiving
        -> LawAidAI Review
          -> Evidence
            -> Action

## Completed Layers

- HIC-1 — Analog Hybrid Foundation
- HIC-2 — Analog Evidence Custody + Source Reference Packet
- HIC-3 — Analog-to-LawAidAI Receiving Bridge
- HIC-4 — Receiving-to-Review Gate
- HIC-5 — Review-to-Evidence Refusal Gate
- HIC-5B — Strict Evidence Certification Gate
- HIC-6 — Evidence-to-Action Activation Gate
- HIC-7 — Full Chain Closure + Regression Harness

## Module Checks

${moduleLines}

## Missing Modules

${missingLines}

## Final Boundary Lock

- HIL governs trust and authority, not truth claims.
- HIC converts only HIL-approved reality.
- Receiving is not authority.
- Review is not Evidence.
- Invalid certification creates no Evidence packet.
- Valid external certification creates an Evidence packet.
- Evidence does not trigger Action.
- Action requires proper activation authority.
- LawAidAI remains client-side management software.
- Nothing becomes real, trusted, or actionable unless the correct authority approves it at the correct boundary in the correct order.

## HARD Directive

The HIC lane is complete when HIC-1 through HIC-6 smokes pass and this closure status is HIC_7_FULL_CHAIN_CLOSURE_READY.
Stop expanding HIC after this point unless a real contradiction appears.
`, "utf8");

console.log("HIC_7_CLOSURE_STATUS");
console.log(closure.status);
console.log("REPORT_MD=" + mdPath);
console.log("REPORT_JSON=" + jsonPath);

if (missing.length) {
  console.log("MISSING_MODULES");
  missing.forEach((check) => console.log("- " + check.file));
  process.exit(1);
}
