# HARD 4 — AIM PASS 3: DECISION QUEUE + PAI-SAFE REVIEW CONTRACT

$ErrorActionPreference = "Stop"

$AimRoot = "D:\DEV\AIVA\shared-core\aim"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $AimRoot "backups\aim-pass3-decision-queue-$Timestamp"
$ReportPath = Join-Path $AimRoot "reports\aim-pass3-decision-queue-verified-$Timestamp.md"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Set-Location $AimRoot

function Backup-IfExists {
  param([Parameter(Mandatory=$true)][string]$Path)

  if (Test-Path $Path) {
    $Resolved = Resolve-Path $Path
    $Relative = $Resolved.Path.Replace($AimRoot, "").TrimStart("\")
    $Dest = Join-Path $BackupRoot $Relative
    $DestDir = Split-Path $Dest -Parent

    if (!(Test-Path $DestDir)) {
      New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    }

    Copy-Item $Path $Dest -Force
  }
}

function Write-NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )

  $FullPath = Join-Path $AimRoot $Path
  $Dir = Split-Path $FullPath -Parent

  if ($Dir -and !(Test-Path $Dir)) {
    New-Item -ItemType Directory -Path $Dir -Force | Out-Null
  }

  [System.IO.File]::WriteAllText($FullPath, $Content, $Utf8NoBom)
}

function Run-OrFail {
  param([Parameter(Mandatory=$true)][string]$Command)

  Write-Host "`n=== $Command ===" -ForegroundColor Cyan
  cmd /c $Command

  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $Command"
  }
}

Write-Host "`n=== HARD 4 / AIM PASS 3 START ===" -ForegroundColor Cyan

Backup-IfExists ".\package.json"
Backup-IfExists ".\src\aimDecisionQueueContracts.ts"
Backup-IfExists ".\src\aimDecisionQueueEngine.ts"
Backup-IfExists ".\src\index.ts"
Backup-IfExists ".\tests\smoke-aim-pass3-decision-queue.ts"
Backup-IfExists ".\scripts\run-aim-pass3-decision-queue.ps1"

$PackageJsonRaw = Get-Content ".\package.json" -Raw
$PackageJson = $PackageJsonRaw | ConvertFrom-Json

if (-not $PackageJson.scripts) {
  $PackageJson | Add-Member -NotePropertyName "scripts" -NotePropertyValue ([pscustomobject]@{}) -Force
}

$PackageJson.scripts | Add-Member -NotePropertyName "smoke:pass1" -NotePropertyValue "tsx tests/smoke-aim-pass1.ts" -Force
$PackageJson.scripts | Add-Member -NotePropertyName "smoke:pass2" -NotePropertyValue "tsx tests/smoke-aim-pass2.ts" -Force
$PackageJson.scripts | Add-Member -NotePropertyName "smoke:pass3" -NotePropertyValue "tsx tests/smoke-aim-pass3-decision-queue.ts" -Force
$PackageJson.scripts | Add-Member -NotePropertyName "verify:pass3" -NotePropertyValue "npm run typecheck && npm run smoke:pass1 && npm run smoke:pass2 && npm run smoke:pass3" -Force

$PackageJsonOut = $PackageJson | ConvertTo-Json -Depth 30
[System.IO.File]::WriteAllText((Join-Path $AimRoot "package.json"), $PackageJsonOut, $Utf8NoBom)

node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('PACKAGE_JSON_PARSE=PASS')"

$DecisionContracts = @"
export type AimDepartmentOrigin =
  | "Research"
  | "Market Intelligence"
  | "Portfolio Learning"
  | "Capital Planning"
  | "Infrastructure Mapping"
  | "Risk Review"
  | "Strategy";

export type AimAgentOrigin =
  | "Data Developer AI"
  | "Strategic Thinker AI"
  | "Critical Thinker AI"
  | "Intelligent Processor AI"
  | "Brand Intelligence AI"
  | "Dispatcher AI"
  | "Manual Operator";

export type AimDecisionSignalType =
  | "market research"
  | "infrastructure pressure"
  | "dependency shift"
  | "timing intelligence"
  | "opportunity detection"
  | "capital planning"
  | "contradiction surfacing"
  | "portfolio learning";

export type AimEvidenceStrength =
  | "Strong"
  | "Moderate"
  | "Weak"
  | "Insufficient"
  | "Contradicted"
  | "Undocumented";

export type AimRiskClass =
  | "Low"
  | "Moderate"
  | "Elevated"
  | "Excessive";

export type AimTimingContext =
  | "Dormant"
  | "Watch"
  | "Developing"
  | "Time Sensitive"
  | "Too Early"
  | "Too Late"
  | "Unknown";

export type AimUrgencyLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Immediate Review";

export type AimPaiSafeDecisionReviewStatus =
  | "SAFE TO REVIEW"
  | "HOLD FOR CONFIRMATION"
  | "REFUSED — INSUFFICIENT SIGNAL"
  | "REFUSED — THESIS CONTRADICTION"
  | "REFUSED — RISK TOO HIGH"
  | "REFUSED — UNDOCUMENTED ACTION";

export type AimFinalAuthority = "Human";

export interface AimStructuredDecisionInput {
  sourceInputs: string[];
  departmentOrigin: AimDepartmentOrigin;
  agentOrigin: AimAgentOrigin;
  signalType: AimDecisionSignalType;
  assetOrSubject: string;
  thesisReference: string;
  evidenceSummary: string;
  evidenceStrength: AimEvidenceStrength;
  contradictionFlags: string[];
  riskClass: AimRiskClass;
  timingContext: AimTimingContext;
  urgencyLevel: AimUrgencyLevel;
  proposedAction: string;
  documentationRefs: string[];
  nextStep?: string;
}

export interface AimPaiSafeReviewPacket {
  decisionId: string;
  status: AimPaiSafeDecisionReviewStatus;
  reasons: string[];
  readyForHumanReview: boolean;
  mayApproveInvestment: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  humanAuthorityRequired: true;
}

export interface AimDecisionItem {
  decisionId: string;
  createdAt: string;
  sourceInputs: string[];
  departmentOrigin: AimDepartmentOrigin;
  agentOrigin: AimAgentOrigin;
  signalType: AimDecisionSignalType;
  assetOrSubject: string;
  thesisReference: string;
  evidenceSummary: string;
  evidenceStrength: AimEvidenceStrength;
  contradictionFlags: string[];
  riskClass: AimRiskClass;
  timingContext: AimTimingContext;
  urgencyLevel: AimUrgencyLevel;
  proposedAction: string;
  prohibitedActionFlag: boolean;
  paiSafeStatus: AimPaiSafeDecisionReviewStatus;
  humanReviewRequired: true;
  journalRequired: true;
  finalAuthority: AimFinalAuthority;
  nextStep: string;
  paiSafeReviewPacket: AimPaiSafeReviewPacket;
}
"@
Write-NoBom "src\aimDecisionQueueContracts.ts" $DecisionContracts

$DecisionEngine = @"
import type {
  AimDecisionItem,
  AimPaiSafeDecisionReviewStatus,
  AimPaiSafeReviewPacket,
  AimStructuredDecisionInput
} from "./aimDecisionQueueContracts.js";

const PROHIBITED_ACTION_PHRASES = [
  "buy now",
  "sell now",
  "execute trade",
  "execute order",
  "place trade",
  "open position",
  "close position",
  "trade approved",
  "investment approved",
  "guaranteed profit",
  "sure winner",
  "automatic trade"
];

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "decision";
}

export function createAimDecisionId(input: AimStructuredDecisionInput): string {
  return `aim_decision_${stableIdPart(input.assetOrSubject)}_${stableIdPart(input.signalType)}`;
}

export function containsProhibitedActionLanguage(value: string): boolean {
  const normalized = value.toLowerCase();
  return PROHIBITED_ACTION_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function hasDecisionDocumentation(input: AimStructuredDecisionInput): boolean {
  return (
    input.sourceInputs.length > 0 &&
    input.documentationRefs.length > 0 &&
    input.thesisReference.trim().length > 0 &&
    input.evidenceSummary.trim().length > 0 &&
    input.proposedAction.trim().length > 0
  );
}

export function evaluatePaiSafeDecisionReadiness(
  decisionId: string,
  input: AimStructuredDecisionInput
): AimPaiSafeReviewPacket {
  const reasons: string[] = [];
  const prohibitedAction = containsProhibitedActionLanguage(input.proposedAction);

  if (prohibitedAction || !hasDecisionDocumentation(input)) {
    if (prohibitedAction) {
      reasons.push("Proposed action contains prohibited trade, execution, certainty, or approval language.");
    }

    if (!hasDecisionDocumentation(input)) {
      reasons.push("Decision item is missing source input, documentation reference, thesis reference, evidence summary, or proposed action.");
    }

    return {
      decisionId,
      status: "REFUSED — UNDOCUMENTED ACTION",
      reasons,
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.contradictionFlags.length > 0 || input.evidenceStrength === "Contradicted") {
    return {
      decisionId,
      status: "REFUSED — THESIS CONTRADICTION",
      reasons: ["Decision item contains contradiction flags or contradicted evidence."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.riskClass === "Excessive") {
    return {
      decisionId,
      status: "REFUSED — RISK TOO HIGH",
      reasons: ["Risk class is excessive for readiness review."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.evidenceStrength === "Weak" || input.evidenceStrength === "Insufficient" || input.sourceInputs.length < 2) {
    return {
      decisionId,
      status: "REFUSED — INSUFFICIENT SIGNAL",
      reasons: ["Evidence strength or source count is insufficient for review readiness."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.evidenceStrength === "Moderate" || input.timingContext === "Unknown") {
    return {
      decisionId,
      status: "HOLD FOR CONFIRMATION",
      reasons: ["Decision item requires confirmation before human review readiness."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  return {
    decisionId,
    status: "SAFE TO REVIEW",
    reasons: ["Decision item is documented, non-contradicted, bounded, and ready for human review."],
    readyForHumanReview: true,
    mayApproveInvestment: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    humanAuthorityRequired: true
  };
}

export function buildAimDecisionItem(
  input: AimStructuredDecisionInput,
  createdAt = "2026-05-14T00:00:00.000Z"
): AimDecisionItem {
  const decisionId = createAimDecisionId(input);
  const prohibitedActionFlag = containsProhibitedActionLanguage(input.proposedAction);
  const paiSafeReviewPacket = evaluatePaiSafeDecisionReadiness(decisionId, input);

  const nextStep =
    input.nextStep?.trim() ||
    (paiSafeReviewPacket.status === "SAFE TO REVIEW"
      ? "Present to human authority for review. Preserve journal before any final action."
      : "Hold or refuse. Resolve readiness issue before human review.");

  return {
    decisionId,
    createdAt,
    sourceInputs: [...input.sourceInputs],
    departmentOrigin: input.departmentOrigin,
    agentOrigin: input.agentOrigin,
    signalType: input.signalType,
    assetOrSubject: input.assetOrSubject,
    thesisReference: input.thesisReference,
    evidenceSummary: input.evidenceSummary,
    evidenceStrength: input.evidenceStrength,
    contradictionFlags: [...input.contradictionFlags],
    riskClass: input.riskClass,
    timingContext: input.timingContext,
    urgencyLevel: input.urgencyLevel,
    proposedAction: input.proposedAction,
    prohibitedActionFlag,
    paiSafeStatus: paiSafeReviewPacket.status,
    humanReviewRequired: true,
    journalRequired: true,
    finalAuthority: "Human",
    nextStep,
    paiSafeReviewPacket
  };
}

export function buildAimDecisionQueue(inputs: AimStructuredDecisionInput[]): AimDecisionItem[] {
  return inputs.map((input) => buildAimDecisionItem(input));
}

export function summarizeAimDecisionQueue(queue: AimDecisionItem[]): Record<AimPaiSafeDecisionReviewStatus, number> {
  return queue.reduce(
    (summary, item) => {
      summary[item.paiSafeStatus] += 1;
      return summary;
    },
    {
      "SAFE TO REVIEW": 0,
      "HOLD FOR CONFIRMATION": 0,
      "REFUSED — INSUFFICIENT SIGNAL": 0,
      "REFUSED — THESIS CONTRADICTION": 0,
      "REFUSED — RISK TOO HIGH": 0,
      "REFUSED — UNDOCUMENTED ACTION": 0
    } satisfies Record<AimPaiSafeDecisionReviewStatus, number>
  );
}
"@
Write-NoBom "src\aimDecisionQueueEngine.ts" $DecisionEngine

$IndexTs = @"
export * from "./aimContracts.js";
export * from "./aimTaxonomy.js";
export * from "./aimEngine.js";
export * from "./aimIntakeContracts.js";
export * from "./aimSignalNormalizer.js";
export * from "./aimDecisionQueueContracts.js";
export * from "./aimDecisionQueueEngine.js";
"@
Write-NoBom "src\index.ts" $IndexTs

$SmokeTest = @"
import {
  buildAimDecisionItem,
  buildAimDecisionQueue,
  summarizeAimDecisionQueue,
  type AimStructuredDecisionInput
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const baseInput: AimStructuredDecisionInput = {
  sourceInputs: ["source_public_filing_001", "source_company_announcement_002"],
  departmentOrigin: "Infrastructure Mapping",
  agentOrigin: "Strategic Thinker AI",
  signalType: "infrastructure pressure",
  assetOrSubject: "HBM supply chain",
  thesisReference: "AIM-THESIS-HBM-001",
  evidenceSummary: "Multiple documented sources indicate HBM supply pressure and confirmed long-term allocation constraints.",
  evidenceStrength: "Strong",
  contradictionFlags: [],
  riskClass: "Moderate",
  timingContext: "Developing",
  urgencyLevel: "Medium",
  proposedAction: "Prepare human review packet for capital planning discussion.",
  documentationRefs: ["doc_hbm_001", "doc_hbm_002"],
  nextStep: "Human review only. Preserve journal before any decision."
};

const validDecision = buildAimDecisionItem(baseInput);

assert(validDecision.decisionId.length > 0, "Decision ID must exist.");
assert(validDecision.paiSafeStatus === "SAFE TO REVIEW", "Strong documented decision should be SAFE TO REVIEW.");
assert(validDecision.humanReviewRequired === true, "Human review must remain required.");
assert(validDecision.journalRequired === true, "Journal must be required.");
assert(validDecision.finalAuthority === "Human", "Human authority must remain final.");
assert(validDecision.paiSafeReviewPacket.mayApproveInvestment === false, "PAI-SAFE must not approve investments.");
assert(validDecision.paiSafeReviewPacket.mayExecuteTrade === false, "PAI-SAFE must not execute trades.");
assert(validDecision.paiSafeReviewPacket.mayProvideFinancialAdvice === false, "PAI-SAFE must not provide financial advice.");

const weakDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: ["single_unconfirmed_source"],
  evidenceStrength: "Weak"
});

assert(weakDecision.paiSafeStatus === "REFUSED — INSUFFICIENT SIGNAL", "Weak evidence should refuse for insufficient signal.");

const contradictionDecision = buildAimDecisionItem({
  ...baseInput,
  contradictionFlags: ["Source B contradicts thesis timing."],
  evidenceStrength: "Contradicted"
});

assert(contradictionDecision.paiSafeStatus === "REFUSED — THESIS CONTRADICTION", "Contradiction should refuse thesis.");

const highRiskDecision = buildAimDecisionItem({
  ...baseInput,
  riskClass: "Excessive"
});

assert(highRiskDecision.paiSafeStatus === "REFUSED — RISK TOO HIGH", "Excessive risk should refuse.");

const undocumentedDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: [],
  documentationRefs: [],
  evidenceSummary: "",
  thesisReference: ""
});

assert(undocumentedDecision.paiSafeStatus === "REFUSED — UNDOCUMENTED ACTION", "Undocumented decision should refuse.");
assert(undocumentedDecision.paiSafeReviewPacket.readyForHumanReview === false, "Undocumented decision must not be review ready.");

const prohibitedTradeDecision = buildAimDecisionItem({
  ...baseInput,
  proposedAction: "Buy now and execute trade immediately."
});

assert(prohibitedTradeDecision.prohibitedActionFlag === true, "Prohibited action language must be flagged.");
assert(prohibitedTradeDecision.paiSafeStatus === "REFUSED — UNDOCUMENTED ACTION", "Prohibited action language must be refused.");
assert(prohibitedTradeDecision.paiSafeReviewPacket.mayExecuteTrade === false, "Trade execution must remain false.");

const holdDecision = buildAimDecisionItem({
  ...baseInput,
  evidenceStrength: "Moderate"
});

assert(holdDecision.paiSafeStatus === "HOLD FOR CONFIRMATION", "Moderate evidence should hold for confirmation.");

const queue = buildAimDecisionQueue([
  baseInput,
  { ...baseInput, evidenceStrength: "Weak", sourceInputs: ["single_unconfirmed_source"] },
  { ...baseInput, contradictionFlags: ["Contradiction present."], evidenceStrength: "Contradicted" },
  { ...baseInput, riskClass: "Excessive" },
  { ...baseInput, sourceInputs: [], documentationRefs: [], evidenceSummary: "", thesisReference: "" }
]);

const summary = summarizeAimDecisionQueue(queue);

assert(summary["SAFE TO REVIEW"] === 1, "Queue summary should contain one SAFE TO REVIEW.");
assert(summary["REFUSED — INSUFFICIENT SIGNAL"] === 1, "Queue summary should contain one insufficient signal refusal.");
assert(summary["REFUSED — THESIS CONTRADICTION"] === 1, "Queue summary should contain one thesis contradiction refusal.");
assert(summary["REFUSED — RISK TOO HIGH"] === 1, "Queue summary should contain one risk refusal.");
assert(summary["REFUSED — UNDOCUMENTED ACTION"] === 1, "Queue summary should contain one undocumented action refusal.");

for (const decision of queue) {
  assert(decision.humanReviewRequired === true, "Every decision requires human review.");
  assert(decision.journalRequired === true, "Every decision requires journal preservation.");
  assert(decision.finalAuthority === "Human", "Every decision preserves human final authority.");
  assert(decision.paiSafeReviewPacket.mayApproveInvestment === false, "No decision may approve investment.");
  assert(decision.paiSafeReviewPacket.mayExecuteTrade === false, "No decision may execute trade.");
  assert(decision.paiSafeReviewPacket.mayProvideFinancialAdvice === false, "No decision may provide financial advice.");
}

console.log("AIM_PASS_3_DECISION_QUEUE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "valid decision item created",
      "strong evidence returns SAFE TO REVIEW",
      "weak evidence returns REFUSED — INSUFFICIENT SIGNAL",
      "contradiction returns REFUSED — THESIS CONTRADICTION",
      "excessive risk returns REFUSED — RISK TOO HIGH",
      "undocumented action returns REFUSED — UNDOCUMENTED ACTION",
      "prohibited trade language flagged and refused",
      "PAI-SAFE review contract does not approve investments",
      "PAI-SAFE review contract does not execute trades",
      "PAI-SAFE review contract does not provide financial advice",
      "human authority remains final",
      "journal required for every decision"
    ],
    summary
  },
  null,
  2
));
"@
Write-NoBom "tests\smoke-aim-pass3-decision-queue.ts" $SmokeTest

Run-OrFail "npm run typecheck"
Run-OrFail "npm run smoke:pass1"
Run-OrFail "npm run smoke:pass2"
Run-OrFail "npm run smoke:pass3"
Run-OrFail "npm run verify:pass3"

$Report = @"
# AIM Pass 3 — Decision Queue + PAI-SAFE Review Contract

Generated: $Timestamp

## Status

VERIFIED PASS

## Module Location

$AimRoot

## Verified Chain

- package.json parse passed
- AIM Pass 1 smoke passed
- AIM Pass 2 smoke passed
- AIM Pass 3 smoke passed
- TypeScript passed
- verify:pass3 passed

## Files Touched

- package.json
- src/aimDecisionQueueContracts.ts
- src/aimDecisionQueueEngine.ts
- src/index.ts
- tests/smoke-aim-pass3-decision-queue.ts
- scripts/run-aim-pass3-decision-queue.ps1

## Backups

$BackupRoot

## Commands Passed

- node package.json parse check
- npm run typecheck
- npm run smoke:pass1
- npm run smoke:pass2
- npm run smoke:pass3
- npm run verify:pass3

## Confirmed

- AIM Decision Item schema exists
- PAI-SAFE review contract exists
- Decision Queue engine exists
- Valid decision item can be created
- Strong evidence returns SAFE TO REVIEW
- Weak evidence returns REFUSED — INSUFFICIENT SIGNAL
- Thesis contradiction returns REFUSED — THESIS CONTRADICTION
- Excessive risk returns REFUSED — RISK TOO HIGH
- Undocumented action returns REFUSED — UNDOCUMENTED ACTION
- Prohibited trade/action language is flagged and refused
- PAI-SAFE does not approve investments
- PAI-SAFE does not execute trades
- PAI-SAFE does not provide financial advice
- Human authority remains final
- Journal preservation remains required

## Boundary Preserved

No ARI full infrastructure.
No Safe-Handoff layer.
No Narrative Engine.
No Offer Engine.
No UI redesign.
No dashboard redesign.
No brokerage API.
No live market data.
No trade recommendation.
No financial advice.
No autonomous trading.
No portfolio automation.
No PAI-SAFE transaction logic change.
No TPS change.
No FundTrackerAI bridge.
No custody.
No wallet.
No payment processor.
No S:\SOUL write path.

## Final Rule

This pass creates the decision-readiness spine.

AIM prepares decisions for governed review.
PAI-SAFE reviews readiness only.
Human authority remains final.
Journal preserves continuity.
"@

New-Item -ItemType Directory -Path ".\reports" -Force | Out-Null
[System.IO.File]::WriteAllText($ReportPath, $Report, $Utf8NoBom)

Write-Host "`n=== AIM PASS 3 VERIFIED ===" -ForegroundColor Green
Write-Host "Verified report:" -ForegroundColor Cyan
Write-Host $ReportPath -ForegroundColor Cyan

Get-ChildItem reports |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 Name, LastWriteTime

Get-ChildItem src |
  Sort-Object Name |
  Select-Object Name, LastWriteTime

Get-ChildItem tests |
  Sort-Object Name |
  Select-Object Name, LastWriteTime