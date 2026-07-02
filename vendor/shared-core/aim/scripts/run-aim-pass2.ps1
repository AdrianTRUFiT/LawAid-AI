# HARD 4 — AIM PASS 2: EVIDENCE INTAKE + SIGNAL NORMALIZATION

$ErrorActionPreference = "Stop"

$AimRoot = "D:\DEV\AIVA\shared-core\aim"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $AimRoot "backups\aim-pass2-$Timestamp"
$ReportPath = Join-Path $AimRoot "reports\aim-pass2-evidence-intake-verified-$Timestamp.md"
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

Write-Host "`n=== HARD 4 / AIM PASS 2 START ===" -ForegroundColor Cyan

Backup-IfExists ".\package.json"
Backup-IfExists ".\src\aimIntakeContracts.ts"
Backup-IfExists ".\src\aimSignalNormalizer.ts"
Backup-IfExists ".\src\index.ts"
Backup-IfExists ".\tests\smoke-aim-pass2.ts"
Backup-IfExists ".\scripts\run-aim-pass2.ps1"

$PackageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
$PackageJson.scripts | Add-Member -NotePropertyName "smoke:pass1" -NotePropertyValue "tsx tests/smoke-aim-pass1.ts" -Force
$PackageJson.scripts | Add-Member -NotePropertyName "smoke:pass2" -NotePropertyValue "tsx tests/smoke-aim-pass2.ts" -Force
$PackageJson.scripts | Add-Member -NotePropertyName "verify:pass2" -NotePropertyValue "npm run typecheck && npm run smoke:pass1 && npm run smoke:pass2" -Force
$PackageJson | ConvertTo-Json -Depth 20 | Set-Content ".\package.json" -Encoding UTF8

$IntakeContracts = @"
import type {
  AimChokepointControlSignalType,
  AimEvidenceLabel,
  AimInfrastructureLayer,
  AimStrategicDenialEffect,
  AimBottleneckSignalSet,
  AimPressureSignal
} from "./aimContracts.js";

export type AimManualEvidenceSourceType =
  | "public filing"
  | "company announcement"
  | "reputable report"
  | "industry inference"
  | "speculation"
  | "rumor";

export type AimIntakeStatus =
  | "NORMALIZED"
  | "HELD_FOR_MISSING_FIELDS"
  | "REFUSED_FOR_FORBIDDEN_LANGUAGE"
  | "REFUSED_FOR_TRADE_ACTION"
  | "REFUSED_FOR_INVALID_SOURCE"
  | "REFUSED_FOR_CONTRADICTION";

export interface AimManualEvidenceInput {
  inputId: string;
  observedAt: string;
  sourceType: AimManualEvidenceSourceType;
  sourceName: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyClaim: string;
  bottleneckSignals: Partial<AimBottleneckSignalSet>;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  thesisNote: string;
  contradictionNote?: string;
  operatorNote?: string;
}

export interface AimEvidenceNormalizationIssue {
  code:
    | "MISSING_INPUT_ID"
    | "MISSING_OBSERVED_AT"
    | "MISSING_SOURCE_NAME"
    | "MISSING_SIGNAL_OBSERVED"
    | "MISSING_DEPENDENCY_CLAIM"
    | "MISSING_THESIS_NOTE"
    | "FORBIDDEN_LANGUAGE"
    | "TRADE_ACTION_LANGUAGE"
    | "INVALID_SOURCE_TYPE"
    | "CONTRADICTION_PRESENT";
  field?: keyof AimManualEvidenceInput;
  message: string;
}

export interface AimEvidenceNormalizationResult {
  status: AimIntakeStatus;
  inputId: string;
  evidenceLabel: AimEvidenceLabel | null;
  normalizedSignal: AimPressureSignal | null;
  issues: AimEvidenceNormalizationIssue[];
  humanReviewRequired: true;
  finalAction: "";
}
"@
Write-NoBom "src\aimIntakeContracts.ts" $IntakeContracts

$SignalNormalizer = @"
import type {
  AimBottleneckSignalSet,
  AimEvidenceLabel,
  AimPressureSignal
} from "./aimContracts.js";
import type {
  AimEvidenceNormalizationIssue,
  AimEvidenceNormalizationResult,
  AimManualEvidenceInput,
  AimManualEvidenceSourceType
} from "./aimIntakeContracts.js";

const FORBIDDEN_LANGUAGE = [
  "guaranteed profit",
  "easy money",
  "sure winner",
  "prediction certainty",
  "investment advice",
  "trade approved"
];

const TRADE_ACTION_LANGUAGE = [
  "buy now",
  "sell now",
  "execute order",
  "automatic trade",
  "place trade",
  "open position",
  "close position"
];

export function mapSourceTypeToEvidenceLabel(sourceType: AimManualEvidenceSourceType): AimEvidenceLabel {
  switch (sourceType) {
    case "public filing":
      return "Confirmed public filing";
    case "company announcement":
      return "Company announcement";
    case "reputable report":
      return "Reputable reporting";
    case "industry inference":
      return "Industry inference";
    case "speculation":
      return "Speculation";
    case "rumor":
      return "Rumor / Ignore";
    default: {
      const _exhaustive: never = sourceType;
      return _exhaustive;
    }
  }
}

function normalizeBottleneckSignals(partial: Partial<AimBottleneckSignalSet>): AimBottleneckSignalSet {
  return {
    leadTimesExpanding: partial.leadTimesExpanding === true,
    pricingPowerIncreasing: partial.pricingPowerIncreasing === true,
    capacityExpansionAnnounced: partial.capacityExpansionAnnounced === true,
    longTermAgreementsOrBacklogConfirmed: partial.longTermAgreementsOrBacklogConfirmed === true
  };
}

function includesAnyForbiddenLanguage(input: AimManualEvidenceInput, phrases: string[]): boolean {
  const searchable = [
    input.signalObserved,
    input.dependencyClaim,
    input.thesisNote,
    input.contradictionNote ?? "",
    input.operatorNote ?? ""
  ].join(" ").toLowerCase();

  return phrases.some((phrase) => searchable.includes(phrase));
}

export function validateManualEvidenceInput(input: AimManualEvidenceInput): AimEvidenceNormalizationIssue[] {
  const issues: AimEvidenceNormalizationIssue[] = [];

  if (!input.inputId || input.inputId.trim().length === 0) {
    issues.push({ code: "MISSING_INPUT_ID", field: "inputId", message: "Manual evidence input requires inputId." });
  }

  if (!input.observedAt || input.observedAt.trim().length === 0) {
    issues.push({ code: "MISSING_OBSERVED_AT", field: "observedAt", message: "Manual evidence input requires observedAt." });
  }

  if (!input.sourceName || input.sourceName.trim().length === 0) {
    issues.push({ code: "MISSING_SOURCE_NAME", field: "sourceName", message: "Manual evidence input requires sourceName." });
  }

  if (!input.signalObserved || input.signalObserved.trim().length === 0) {
    issues.push({ code: "MISSING_SIGNAL_OBSERVED", field: "signalObserved", message: "Manual evidence input requires signalObserved." });
  }

  if (!input.dependencyClaim || input.dependencyClaim.trim().length === 0) {
    issues.push({ code: "MISSING_DEPENDENCY_CLAIM", field: "dependencyClaim", message: "Manual evidence input requires dependencyClaim." });
  }

  if (!input.thesisNote || input.thesisNote.trim().length === 0) {
    issues.push({ code: "MISSING_THESIS_NOTE", field: "thesisNote", message: "Manual evidence input requires thesisNote." });
  }

  if (includesAnyForbiddenLanguage(input, FORBIDDEN_LANGUAGE)) {
    issues.push({ code: "FORBIDDEN_LANGUAGE", message: "Input contains forbidden certainty or advice language." });
  }

  if (includesAnyForbiddenLanguage(input, TRADE_ACTION_LANGUAGE)) {
    issues.push({ code: "TRADE_ACTION_LANGUAGE", message: "Input contains trade-action language." });
  }

  if (input.contradictionNote && input.contradictionNote.trim().length > 0) {
    issues.push({ code: "CONTRADICTION_PRESENT", field: "contradictionNote", message: "Contradiction requires refusal from normalized-ready state." });
  }

  return issues;
}

export function normalizeManualEvidenceInput(input: AimManualEvidenceInput): AimEvidenceNormalizationResult {
  const issues = validateManualEvidenceInput(input);
  const evidenceLabel = mapSourceTypeToEvidenceLabel(input.sourceType);

  if (issues.some((issue) => issue.code === "FORBIDDEN_LANGUAGE")) {
    return {
      status: "REFUSED_FOR_FORBIDDEN_LANGUAGE",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.some((issue) => issue.code === "TRADE_ACTION_LANGUAGE")) {
    return {
      status: "REFUSED_FOR_TRADE_ACTION",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.some((issue) => issue.code === "CONTRADICTION_PRESENT")) {
    return {
      status: "REFUSED_FOR_CONTRADICTION",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.length > 0) {
    return {
      status: "HELD_FOR_MISSING_FIELDS",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  const normalizedSignal: AimPressureSignal = {
    signalId: input.inputId,
    observedAt: input.observedAt,
    signalObserved: input.signalObserved.trim(),
    infrastructureLayer: input.infrastructureLayer,
    dependencyMapped: input.dependencyClaim.trim(),
    evidenceLabel,
    bottleneckSignals: normalizeBottleneckSignals(input.bottleneckSignals),
    chokepointSignalType: input.chokepointSignalType,
    strategicDenialEffect: input.strategicDenialEffect,
    thesisNote: input.thesisNote.trim()
  };

  return {
    status: "NORMALIZED",
    inputId: input.inputId,
    evidenceLabel,
    normalizedSignal,
    issues: [],
    humanReviewRequired: true,
    finalAction: ""
  };
}
"@
Write-NoBom "src\aimSignalNormalizer.ts" $SignalNormalizer

$IndexTs = @"
export * from "./aimContracts.js";
export * from "./aimTaxonomy.js";
export * from "./aimEngine.js";
export * from "./aimIntakeContracts.js";
export * from "./aimSignalNormalizer.js";
"@
Write-NoBom "src\index.ts" $IndexTs

$SmokeTest = @"
import {
  analyzeAimPressureSignal,
  normalizeManualEvidenceInput,
  type AimManualEvidenceInput
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const validInput: AimManualEvidenceInput = {
  inputId: "manual_hbm_001",
  observedAt: "2026-05-13T02:25:00.000Z",
  sourceType: "company announcement",
  sourceName: "Manual research note",
  signalObserved: "Signal detected: HBM allocation pressure is increasing across AI infrastructure demand.",
  infrastructureLayer: "Memory / HBM",
  dependencyClaim: "AI compute expansion depends on constrained HBM supply and advanced packaging availability.",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: true,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: true
  },
  chokepointSignalType: "HBM allocation",
  strategicDenialEffect: "High",
  thesisNote: "Thesis strengthening only after review: memory capacity may govern AI infrastructure throughput."
};

const normalized = normalizeManualEvidenceInput(validInput);

assert(normalized.status === "NORMALIZED", "Valid manual input should normalize.");
assert(normalized.normalizedSignal !== null, "Normalized signal missing.");
assert(normalized.evidenceLabel === "Company announcement", "Evidence label mapping failed.");
assert(normalized.finalAction === "", "Final action must remain blank.");
assert(normalized.humanReviewRequired === true, "Human review required must remain true.");

const analyzed = analyzeAimPressureSignal(normalized.normalizedSignal!);

assert(analyzed.paiSafeReadinessHandoff.readinessState === "Review Ready", "Normalized valid input should be Review Ready after Pass 1 analysis.");
assert(analyzed.tradeRecommendation === null, "AIM must not recommend trades.");
assert(analyzed.executionAction === null, "AIM must not execute action.");
assert(analyzed.journalReadyDecisionRecord.finalAction === "", "Journal final action must remain blank.");

const missingFieldInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_missing_001",
  sourceName: "",
  thesisNote: ""
};

const missingResult = normalizeManualEvidenceInput(missingFieldInput);

assert(missingResult.status === "HELD_FOR_MISSING_FIELDS", "Missing fields should produce hold.");
assert(missingResult.normalizedSignal === null, "Missing fields must not produce normalized signal.");
assert(missingResult.issues.some((issue) => issue.code === "MISSING_SOURCE_NAME"), "Missing source issue not detected.");
assert(missingResult.issues.some((issue) => issue.code === "MISSING_THESIS_NOTE"), "Missing thesis issue not detected.");

const speculationInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_speculation_001",
  sourceType: "speculation",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: false,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: false
  },
  thesisNote: "Speculative signal only. Hold for confirmation."
};

const speculationResult = normalizeManualEvidenceInput(speculationInput);

assert(speculationResult.status === "NORMALIZED", "Speculation may normalize for tracking.");
assert(speculationResult.evidenceLabel === "Speculation", "Speculation evidence mapping failed.");

const speculationAnalyzed = analyzeAimPressureSignal(speculationResult.normalizedSignal!);

assert(speculationAnalyzed.evidenceClassification.verifiedTruth === false, "Speculation must not become verified truth.");
assert(speculationAnalyzed.paiSafeReadinessHandoff.readinessState === "Insufficient Evidence", "Speculation must produce Insufficient Evidence.");

const rumorInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_rumor_001",
  sourceType: "rumor",
  signalObserved: "Rumor only about compute shortage.",
  thesisNote: "Ignore until confirmed."
};

const rumorResult = normalizeManualEvidenceInput(rumorInput);
assert(rumorResult.status === "NORMALIZED", "Rumor may normalize only for tracking boundary.");
assert(rumorResult.evidenceLabel === "Rumor / Ignore", "Rumor evidence mapping failed.");

const rumorAnalyzed = analyzeAimPressureSignal(rumorResult.normalizedSignal!);
assert(rumorAnalyzed.paiSafeReadinessHandoff.readinessState !== "Review Ready", "Rumor must not produce Review Ready.");

const forbiddenInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_forbidden_001",
  thesisNote: "This is a guaranteed profit and sure winner."
};

const forbiddenResult = normalizeManualEvidenceInput(forbiddenInput);

assert(forbiddenResult.status === "REFUSED_FOR_FORBIDDEN_LANGUAGE", "Forbidden language must be refused.");
assert(forbiddenResult.normalizedSignal === null, "Forbidden language must not normalize.");

const tradeInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_trade_001",
  operatorNote: "Buy now and execute order."
};

const tradeResult = normalizeManualEvidenceInput(tradeInput);

assert(tradeResult.status === "REFUSED_FOR_TRADE_ACTION", "Trade-action language must be refused.");
assert(tradeResult.normalizedSignal === null, "Trade-action language must not normalize.");

const contradictionInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_contradiction_001",
  contradictionNote: "Contradictory source undermines the dependency thesis."
};

const contradictionResult = normalizeManualEvidenceInput(contradictionInput);

assert(contradictionResult.status === "REFUSED_FOR_CONTRADICTION", "Contradiction must refuse normalized-ready state.");
assert(contradictionResult.normalizedSignal === null, "Contradiction must not produce normalized signal in Pass 2.");

console.log("AIM_PASS_2_EVIDENCE_INTAKE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "manual evidence input normalized",
      "source type mapped to evidence label",
      "normalized signal feeds Pass 1 analyzer",
      "missing fields held",
      "speculation not verified truth",
      "rumor not Review Ready",
      "forbidden certainty language refused",
      "trade-action language refused",
      "contradiction refused",
      "final action remains blank",
      "human authority remains final"
    ]
  },
  null,
  2
));
"@
Write-NoBom "tests\smoke-aim-pass2.ts" $SmokeTest

Run-OrFail "npm run typecheck"
Run-OrFail "npm run smoke:pass1"
Run-OrFail "npm run smoke:pass2"
Run-OrFail "npm run verify:pass2"

$Report = @"
# AIM Pass 2 — Evidence Intake + Signal Normalization

Generated: $Timestamp

## Status

VERIFIED PASS

## Module Location

$AimRoot

## Verified Chain

- AIM Pass 1 smoke passed
- AIM Pass 2 smoke passed
- TypeScript passed
- verify:pass2 passed

## Files Touched

- package.json
- src/aimIntakeContracts.ts
- src/aimSignalNormalizer.ts
- src/index.ts
- tests/smoke-aim-pass2.ts
- scripts/run-aim-pass2.ps1

## Backups

$BackupRoot

## Commands Passed

- npm run typecheck
- npm run smoke:pass1
- npm run smoke:pass2
- npm run verify:pass2

## Confirmed

- Manual evidence intake contract exists
- Manual research inputs normalize into AIM pressure signals
- Source types map to evidence labels
- Missing fields produce HELD_FOR_MISSING_FIELDS
- Speculation does not become verified truth
- Rumor / Ignore does not produce Review Ready
- Forbidden certainty language is refused
- Trade-action language is refused
- Contradiction refuses normalized-ready state
- Normalized signals feed AIM Pass 1 analysis
- Final action remains blank
- Human review remains required
- No trade recommendation created
- No execution action created

## Boundary Preserved

No UI.
No dashboard layout.
No live market data.
No external APIs.
No brokerage execution.
No trade recommendations.
No buy/sell instructions.
No financial advice language.
No autonomous trading.
No portfolio automation.
No payment processor.
No wallet.
No custody.
No S:\SOUL write path.
No PAI-SAFE logic changes.
No TPS changes.

## Final Rule

AIM detects pressure.
AIM maps dependency.
AIM normalizes evidence.
PAI-SAFE tests readiness later.
Human remains final authority.
"@

New-Item -ItemType Directory -Path ".\reports" -Force | Out-Null
[System.IO.File]::WriteAllText($ReportPath, $Report, $Utf8NoBom)

Write-Host "`n=== AIM PASS 2 VERIFIED ===" -ForegroundColor Green
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