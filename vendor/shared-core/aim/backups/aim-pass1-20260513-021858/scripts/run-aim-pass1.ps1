# HARD 4 — AIM PASS 1: BOUNDED CORE INTELLIGENCE MODULE

$ErrorActionPreference = "Stop"

$AimRoot = "D:\DEV\AIVA\shared-core\aim"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $AimRoot "backups\aim-pass1-$Timestamp"
$ReportPath = Join-Path $AimRoot "reports\aim-pass1-core-verified-$Timestamp.md"
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

Write-Host "`n=== HARD 4 / AIM PASS 1 START ===" -ForegroundColor Cyan

Backup-IfExists ".\package.json"
Backup-IfExists ".\package-lock.json"
Backup-IfExists ".\tsconfig.json"
Backup-IfExists ".\README.md"
Backup-IfExists ".\src\aimContracts.ts"
Backup-IfExists ".\src\aimTaxonomy.ts"
Backup-IfExists ".\src\aimEngine.ts"
Backup-IfExists ".\src\index.ts"
Backup-IfExists ".\tests\smoke-aim-pass1.ts"
Backup-IfExists ".\scripts\run-aim-pass1.ps1"

$PackageJson = @"
{
  "name": "@aiva/aim-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "AIM — AI MarketIntel bounded core intelligence module.",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "smoke": "tsx tests/smoke-aim-pass1.ts",
    "verify": "npm run typecheck && npm run smoke"
  },
  "devDependencies": {
    "tsx": "^4.20.0",
    "typescript": "^5.9.0"
  }
}
"@
Write-NoBom "package.json" $PackageJson

$Tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false,
    "noEmit": true,
    "rootDir": "."
  },
  "include": ["src", "tests"]
}
"@
Write-NoBom "tsconfig.json" $Tsconfig

$Readme = @"
# AIM — AI MarketIntel

## Status

Bounded core intelligence module.

## Public Product Name

AIM — AI MarketIntel

## Internal Doctrine

Awareness + Infrastructure Mapping

## Public Positioning Line

AIM helps structure directional clarity before capital, resources, or action moves.

## Doctrine Line

AIM detects pressure and maps dependency before PAI-SAFE tests readiness.

## Purpose

AIM is not a stock picker, trading app, brokerage, financial advisor, or execution engine.

AIM is a governed intelligence layer for decisions under uncertainty.

## Core Loop

Pressure → Dependency → Readiness → Consequence → Review → Adaptation

## Relationship

AIM detects pressure.  
AIM maps dependency.  
PAI-SAFE tests readiness.  
TPS structures transactional movement.  
Journal preserves continuity and proof.  
Review analyzes results.  
Execution proves intelligence.  
Human remains final authority.

## Legal / Safety Boundary

This system is for research, education, market intelligence, portfolio organization, and scenario planning only. It does not provide financial advice, guarantee outcomes, or execute trades.

## Explicit Prohibitions

This module does not include UI, dashboard layout, brokerage execution, trade recommendations, buy/sell language, financial advice language, autonomous trading, portfolio automation, payment processor, wallet, custody, S:\SOUL write path, PAI-SAFE logic changes, TPS changes, external APIs, live market data integration, brokerage API integration, automatic alerts to trade, or investment committee automation.
"@
Write-NoBom "README.md" $Readme

$AimContracts = @"
export type AimProductBrand = "AIM — AI MarketIntel";
export type AimInternalDoctrine = "Awareness + Infrastructure Mapping";

export type AimInfrastructureLayer =
  | "Compute"
  | "Memory / HBM"
  | "Networking / Optical"
  | "Power / Grid"
  | "Cooling / Thermal"
  | "Fabrication / Equipment"
  | "Sovereign / Defense"
  | "Quantum / Frontier Compute"
  | "Data / Licensing"
  | "Land / Permitting"
  | "Advanced Packaging";

export type AimBottleneckPhase =
  | "Dormant"
  | "Watch"
  | "Tightening"
  | "Confirmed Bottleneck"
  | "Momentum Expansion"
  | "Exhaustion Risk"
  | "Oversupply Risk"
  | "Thesis Broken"
  | "Narrative Only — Not Confirmed";

export type AimEvidenceLabel =
  | "Confirmed public filing"
  | "Company announcement"
  | "Reputable reporting"
  | "Industry inference"
  | "Speculation"
  | "Rumor / Ignore";

export type AimChokepointControlSignalType =
  | "supplier acquisition"
  | "long-term supply agreement"
  | "exclusive partnership"
  | "power purchase agreement"
  | "compute reservation"
  | "HBM allocation"
  | "foundry reservation"
  | "advanced packaging allocation"
  | "data licensing deal"
  | "sovereign cloud contract"
  | "fiber route control"
  | "energy infrastructure control"
  | "rare earth / metals offtake"
  | "strategic investment"
  | "talent acquisition";

export type AimStrategicDenialEffect =
  | "None"
  | "Low"
  | "Moderate"
  | "High"
  | "Critical";

export type AimPaiSafeReadinessState =
  | "Review Ready"
  | "Hold For Confirmation"
  | "Insufficient Evidence"
  | "Contradiction Detected";

export interface AimBottleneckSignalSet {
  leadTimesExpanding: boolean;
  pricingPowerIncreasing: boolean;
  capacityExpansionAnnounced: boolean;
  longTermAgreementsOrBacklogConfirmed: boolean;
}

export interface AimPressureSignal {
  signalId: string;
  observedAt: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceLabel: AimEvidenceLabel;
  bottleneckSignals: AimBottleneckSignalSet;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  thesisNote: string;
  contradictionNote?: string;
}

export interface AimDoctrineContract {
  productBrand: AimProductBrand;
  internalDoctrine: AimInternalDoctrine;
  publicPositioningLine: "AIM helps structure directional clarity before capital, resources, or action moves.";
  doctrineLine: "AIM detects pressure and maps dependency before PAI-SAFE tests readiness.";
  coreLoop: ["Pressure", "Dependency", "Readiness", "Consequence", "Review", "Adaptation"];
  legalBoundary: string;
  prohibitedBehaviors: string[];
}

export interface AimDependencyMap {
  signalId: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  pressureDetected: boolean;
  mappedAt: string;
}

export interface AimEvidenceClassification {
  label: AimEvidenceLabel;
  verifiedTruth: boolean;
  reviewEligible: boolean;
  note: string;
}

export interface AimBottleneckClassification {
  phase: AimBottleneckPhase;
  tighteningSignalCount: number;
  ruleApplied: "2-of-4 tightening rule";
}

export interface AimChokepointClassification {
  signalType: AimChokepointControlSignalType;
  descriptiveOnly: true;
}

export interface AimPaiSafeReadinessHandoffPacket {
  source: "AIM";
  destination: "PAI-SAFE";
  readinessState: AimPaiSafeReadinessState;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceLabel: AimEvidenceLabel;
  bottleneckPhase: AimBottleneckPhase;
  humanReviewRequired: boolean;
  note: string;
}

export interface AimJournalReadyDecisionRecord {
  dateTime: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceStatus: AimEvidenceLabel;
  bottleneckPhase: AimBottleneckPhase;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  paiSafeReadinessStatus: AimPaiSafeReadinessState;
  thesisNote: string;
  contradictionNote: string;
  humanReviewRequired: boolean;
  finalAction: "";
}

export interface AimOutputPacket {
  productBrand: AimProductBrand;
  internalDoctrine: AimInternalDoctrine;
  pressureSignal: AimPressureSignal;
  dependencyMap: AimDependencyMap;
  evidenceClassification: AimEvidenceClassification;
  bottleneckClassification: AimBottleneckClassification;
  chokepointClassification: AimChokepointClassification;
  paiSafeReadinessHandoff: AimPaiSafeReadinessHandoffPacket;
  journalReadyDecisionRecord: AimJournalReadyDecisionRecord;
  humanFinalAuthority: true;
  tradeRecommendation: null;
  executionAction: null;
}
"@
Write-NoBom "src\aimContracts.ts" $AimContracts

$AimTaxonomy = @"
import type {
  AimChokepointControlSignalType,
  AimEvidenceLabel,
  AimInfrastructureLayer,
  AimStrategicDenialEffect
} from "./aimContracts.js";

export const AIM_INFRASTRUCTURE_LAYERS: AimInfrastructureLayer[] = [
  "Compute",
  "Memory / HBM",
  "Networking / Optical",
  "Power / Grid",
  "Cooling / Thermal",
  "Fabrication / Equipment",
  "Sovereign / Defense",
  "Quantum / Frontier Compute",
  "Data / Licensing",
  "Land / Permitting",
  "Advanced Packaging"
];

export const AIM_EVIDENCE_LABELS: AimEvidenceLabel[] = [
  "Confirmed public filing",
  "Company announcement",
  "Reputable reporting",
  "Industry inference",
  "Speculation",
  "Rumor / Ignore"
];

export const AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES: AimChokepointControlSignalType[] = [
  "supplier acquisition",
  "long-term supply agreement",
  "exclusive partnership",
  "power purchase agreement",
  "compute reservation",
  "HBM allocation",
  "foundry reservation",
  "advanced packaging allocation",
  "data licensing deal",
  "sovereign cloud contract",
  "fiber route control",
  "energy infrastructure control",
  "rare earth / metals offtake",
  "strategic investment",
  "talent acquisition"
];

export const AIM_STRATEGIC_DENIAL_EFFECTS: AimStrategicDenialEffect[] = [
  "None",
  "Low",
  "Moderate",
  "High",
  "Critical"
];

export const AIM_FORBIDDEN_LANGUAGE = [
  "Guaranteed profit",
  "Buy now",
  "Sell now",
  "Easy money",
  "Sure winner",
  "Automatic trade",
  "Prediction certainty",
  "Trade approved",
  "Investment advice",
  "Execute order"
] as const;
"@
Write-NoBom "src\aimTaxonomy.ts" $AimTaxonomy

$AimEngine = @"
import type {
  AimBottleneckClassification,
  AimChokepointClassification,
  AimDependencyMap,
  AimDoctrineContract,
  AimEvidenceClassification,
  AimEvidenceLabel,
  AimOutputPacket,
  AimPaiSafeReadinessHandoffPacket,
  AimPaiSafeReadinessState,
  AimPressureSignal
} from "./aimContracts.js";

export function getAimDoctrineContract(): AimDoctrineContract {
  return {
    productBrand: "AIM — AI MarketIntel",
    internalDoctrine: "Awareness + Infrastructure Mapping",
    publicPositioningLine: "AIM helps structure directional clarity before capital, resources, or action moves.",
    doctrineLine: "AIM detects pressure and maps dependency before PAI-SAFE tests readiness.",
    coreLoop: ["Pressure", "Dependency", "Readiness", "Consequence", "Review", "Adaptation"],
    legalBoundary: "This system is for research, education, market intelligence, portfolio organization, and scenario planning only. It does not provide financial advice, guarantee outcomes, or execute trades.",
    prohibitedBehaviors: [
      "trade recommendations",
      "buy/sell instructions",
      "brokerage execution",
      "financial advice",
      "autonomous trading",
      "portfolio automation",
      "external API calls",
      "payment movement",
      "custody",
      "S:\\SOUL writes"
    ]
  };
}

export function countTighteningSignals(signal: AimPressureSignal): number {
  const signals = signal.bottleneckSignals;
  return [
    signals.leadTimesExpanding,
    signals.pricingPowerIncreasing,
    signals.capacityExpansionAnnounced,
    signals.longTermAgreementsOrBacklogConfirmed
  ].filter(Boolean).length;
}

export function classifyEvidence(label: AimEvidenceLabel): AimEvidenceClassification {
  if (label === "Confirmed public filing" || label === "Company announcement" || label === "Reputable reporting") {
    return { label, verifiedTruth: true, reviewEligible: true, note: "Evidence is strong enough for structured review." };
  }

  if (label === "Industry inference") {
    return { label, verifiedTruth: false, reviewEligible: true, note: "Inference may support review but must be held below verified truth." };
  }

  if (label === "Speculation") {
    return { label, verifiedTruth: false, reviewEligible: false, note: "Speculation may be tracked but cannot be treated as verified truth." };
  }

  return { label, verifiedTruth: false, reviewEligible: false, note: "Rumor / Ignore must not produce Review Ready status." };
}

export function classifyBottleneckPhase(signal: AimPressureSignal): AimBottleneckClassification {
  if (signal.contradictionNote && signal.contradictionNote.trim().length > 0) {
    return { phase: "Thesis Broken", tighteningSignalCount: countTighteningSignals(signal), ruleApplied: "2-of-4 tightening rule" };
  }

  const tighteningSignalCount = countTighteningSignals(signal);

  if (tighteningSignalCount >= 2) {
    return { phase: "Tightening", tighteningSignalCount, ruleApplied: "2-of-4 tightening rule" };
  }

  return { phase: "Narrative Only — Not Confirmed", tighteningSignalCount, ruleApplied: "2-of-4 tightening rule" };
}

export function classifyChokepointControl(signal: AimPressureSignal): AimChokepointClassification {
  return { signalType: signal.chokepointSignalType, descriptiveOnly: true };
}

export function mapDependency(signal: AimPressureSignal): AimDependencyMap {
  return {
    signalId: signal.signalId,
    infrastructureLayer: signal.infrastructureLayer,
    dependencyMapped: signal.dependencyMapped,
    pressureDetected: signal.signalObserved.trim().length > 0,
    mappedAt: signal.observedAt
  };
}

export function derivePaiSafeReadinessState(
  evidence: AimEvidenceClassification,
  bottleneck: AimBottleneckClassification,
  signal: AimPressureSignal
): AimPaiSafeReadinessState {
  if (signal.contradictionNote && signal.contradictionNote.trim().length > 0) return "Contradiction Detected";
  if (signal.evidenceLabel === "Rumor / Ignore" || signal.evidenceLabel === "Speculation") return "Insufficient Evidence";
  if (bottleneck.phase === "Narrative Only — Not Confirmed") return "Hold For Confirmation";
  if (evidence.verifiedTruth && bottleneck.phase === "Tightening") return "Review Ready";
  return "Hold For Confirmation";
}

export function buildPaiSafeReadinessHandoff(
  signal: AimPressureSignal,
  evidence: AimEvidenceClassification,
  bottleneck: AimBottleneckClassification
): AimPaiSafeReadinessHandoffPacket {
  const readinessState = derivePaiSafeReadinessState(evidence, bottleneck, signal);
  return {
    source: "AIM",
    destination: "PAI-SAFE",
    readinessState,
    infrastructureLayer: signal.infrastructureLayer,
    dependencyMapped: signal.dependencyMapped,
    evidenceLabel: signal.evidenceLabel,
    bottleneckPhase: bottleneck.phase,
    humanReviewRequired: true,
    note: readinessState === "Review Ready"
      ? "Review required before capital, resources, or action moves."
      : "Hold until evidence quality and dependency mapping support review."
  };
}

export function analyzeAimPressureSignal(signal: AimPressureSignal): AimOutputPacket {
  const dependencyMap = mapDependency(signal);
  const evidenceClassification = classifyEvidence(signal.evidenceLabel);
  const bottleneckClassification = classifyBottleneckPhase(signal);
  const chokepointClassification = classifyChokepointControl(signal);
  const paiSafeReadinessHandoff = buildPaiSafeReadinessHandoff(signal, evidenceClassification, bottleneckClassification);

  return {
    productBrand: "AIM — AI MarketIntel",
    internalDoctrine: "Awareness + Infrastructure Mapping",
    pressureSignal: signal,
    dependencyMap,
    evidenceClassification,
    bottleneckClassification,
    chokepointClassification,
    paiSafeReadinessHandoff,
    journalReadyDecisionRecord: {
      dateTime: signal.observedAt,
      signalObserved: signal.signalObserved,
      infrastructureLayer: signal.infrastructureLayer,
      dependencyMapped: signal.dependencyMapped,
      evidenceStatus: signal.evidenceLabel,
      bottleneckPhase: bottleneckClassification.phase,
      chokepointSignalType: signal.chokepointSignalType,
      strategicDenialEffect: signal.strategicDenialEffect,
      paiSafeReadinessStatus: paiSafeReadinessHandoff.readinessState,
      thesisNote: signal.thesisNote,
      contradictionNote: signal.contradictionNote ?? "",
      humanReviewRequired: true,
      finalAction: ""
    },
    humanFinalAuthority: true,
    tradeRecommendation: null,
    executionAction: null
  };
}
"@
Write-NoBom "src\aimEngine.ts" $AimEngine

$IndexTs = @"
export * from "./aimContracts.js";
export * from "./aimTaxonomy.js";
export * from "./aimEngine.js";
"@
Write-NoBom "src\index.ts" $IndexTs

$SmokeTest = @"
import {
  AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES,
  AIM_EVIDENCE_LABELS,
  AIM_FORBIDDEN_LANGUAGE,
  AIM_INFRASTRUCTURE_LAYERS,
  AIM_STRATEGIC_DENIAL_EFFECTS,
  analyzeAimPressureSignal,
  getAimDoctrineContract,
  type AimPressureSignal
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const doctrine = getAimDoctrineContract();

assert(doctrine.productBrand === "AIM — AI MarketIntel", "AIM product brand changed.");
assert(doctrine.internalDoctrine === "Awareness + Infrastructure Mapping", "AIM doctrine changed.");
assert(doctrine.legalBoundary.includes("does not provide financial advice"), "Legal boundary missing financial advice prohibition.");
assert(doctrine.legalBoundary.includes("execute trades"), "Legal boundary missing trade execution prohibition.");

const requiredLayers = [
  "Compute",
  "Memory / HBM",
  "Networking / Optical",
  "Power / Grid",
  "Cooling / Thermal",
  "Fabrication / Equipment",
  "Sovereign / Defense",
  "Quantum / Frontier Compute",
  "Data / Licensing",
  "Land / Permitting",
  "Advanced Packaging"
];

for (const layer of requiredLayers) {
  assert(AIM_INFRASTRUCTURE_LAYERS.includes(layer as never), "Missing infrastructure layer: " + layer);
}

const requiredEvidence = [
  "Confirmed public filing",
  "Company announcement",
  "Reputable reporting",
  "Industry inference",
  "Speculation",
  "Rumor / Ignore"
];

for (const evidence of requiredEvidence) {
  assert(AIM_EVIDENCE_LABELS.includes(evidence as never), "Missing evidence label: " + evidence);
}

const requiredSignalTypes = [
  "supplier acquisition",
  "long-term supply agreement",
  "exclusive partnership",
  "power purchase agreement",
  "compute reservation",
  "HBM allocation",
  "foundry reservation",
  "advanced packaging allocation",
  "data licensing deal",
  "sovereign cloud contract",
  "fiber route control",
  "energy infrastructure control",
  "rare earth / metals offtake",
  "strategic investment",
  "talent acquisition"
];

for (const signalType of requiredSignalTypes) {
  assert(AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES.includes(signalType as never), "Missing chokepoint signal type: " + signalType);
}

for (const effect of ["None", "Low", "Moderate", "High", "Critical"]) {
  assert(AIM_STRATEGIC_DENIAL_EFFECTS.includes(effect as never), "Missing strategic denial effect: " + effect);
}

const reviewReadySignal: AimPressureSignal = {
  signalId: "aim_signal_hbm_001",
  observedAt: "2026-05-11T20:00:00.000Z",
  signalObserved: "Signal detected: HBM allocation pressure is increasing across AI infrastructure demand.",
  infrastructureLayer: "Memory / HBM",
  dependencyMapped: "AI compute expansion depends on constrained HBM supply and advanced packaging availability.",
  evidenceLabel: "Company announcement",
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

const reviewReadyOutput = analyzeAimPressureSignal(reviewReadySignal);

assert(reviewReadyOutput.dependencyMap.pressureDetected === true, "AIM did not detect pressure.");
assert(reviewReadyOutput.dependencyMap.infrastructureLayer === "Memory / HBM", "AIM did not map infrastructure layer.");
assert(reviewReadyOutput.evidenceClassification.label === "Company announcement", "AIM did not classify evidence strength.");
assert(reviewReadyOutput.evidenceClassification.verifiedTruth === true, "Company announcement should be verified evidence.");
assert(reviewReadyOutput.bottleneckClassification.tighteningSignalCount === 3, "2-of-4 tightening count failed.");
assert(reviewReadyOutput.bottleneckClassification.phase === "Tightening", "2-of-4 tightening rule failed.");
assert(reviewReadyOutput.chokepointClassification.signalType === "HBM allocation", "Chokepoint control classification failed.");
assert(reviewReadyOutput.chokepointClassification.descriptiveOnly === true, "Chokepoint effect must remain descriptive only.");
assert(reviewReadyOutput.paiSafeReadinessHandoff.destination === "PAI-SAFE", "PAI-SAFE handoff destination missing.");
assert(reviewReadyOutput.paiSafeReadinessHandoff.readinessState === "Review Ready", "Review Ready state not produced.");
assert(reviewReadyOutput.journalReadyDecisionRecord.finalAction === "", "Final action must remain blank.");
assert(reviewReadyOutput.journalReadyDecisionRecord.humanReviewRequired === true, "Human review must be required.");
assert(reviewReadyOutput.humanFinalAuthority === true, "Human final authority missing.");
assert(reviewReadyOutput.tradeRecommendation === null, "AIM must not recommend trades.");
assert(reviewReadyOutput.executionAction === null, "AIM must not execute action.");

const narrativeSignal: AimPressureSignal = {
  signalId: "aim_signal_compute_002",
  observedAt: "2026-05-11T20:05:00.000Z",
  signalObserved: "Narrative forming around compute scarcity without confirming evidence.",
  infrastructureLayer: "Compute",
  dependencyMapped: "Compute capacity may depend on future GPU availability, but evidence is insufficient.",
  evidenceLabel: "Speculation",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: false,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: false
  },
  chokepointSignalType: "compute reservation",
  strategicDenialEffect: "Moderate",
  thesisNote: "Hold for confirmation."
};

const narrativeOutput = analyzeAimPressureSignal(narrativeSignal);

assert(narrativeOutput.bottleneckClassification.phase === "Narrative Only — Not Confirmed", "Fewer than 2 signals must not mark tightening.");
assert(narrativeOutput.paiSafeReadinessHandoff.readinessState === "Insufficient Evidence", "Speculation must produce Insufficient Evidence.");
assert(narrativeOutput.evidenceClassification.verifiedTruth === false, "Speculation must not be verified truth.");

const rumorSignal: AimPressureSignal = {
  ...narrativeSignal,
  signalId: "aim_signal_compute_003",
  evidenceLabel: "Rumor / Ignore",
  signalObserved: "Rumor about supply constraint.",
  thesisNote: "Ignore until confirmed."
};

const rumorOutput = analyzeAimPressureSignal(rumorSignal);
assert(rumorOutput.paiSafeReadinessHandoff.readinessState !== "Review Ready", "Rumor / Ignore must not produce Review Ready.");

const contradictionSignal: AimPressureSignal = {
  ...reviewReadySignal,
  signalId: "aim_signal_hbm_004",
  contradictionNote: "Contradictory filing undermines the pressure thesis."
};

const contradictionOutput = analyzeAimPressureSignal(contradictionSignal);
assert(contradictionOutput.paiSafeReadinessHandoff.readinessState === "Contradiction Detected", "Contradiction must be detected.");
assert(contradictionOutput.bottleneckClassification.phase === "Thesis Broken", "Contradiction should break the thesis.");

const serialized = JSON.stringify({ reviewReadyOutput, narrativeOutput, rumorOutput, contradictionOutput }).toLowerCase();

for (const phrase of AIM_FORBIDDEN_LANGUAGE) {
  assert(!serialized.includes(phrase.toLowerCase()), "Forbidden language present: " + phrase);
}

console.log("AIM_PASS_1_CORE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    productBrand: reviewReadyOutput.productBrand,
    internalDoctrine: reviewReadyOutput.internalDoctrine,
    tested: [
      "AIM detects a pressure signal",
      "AIM maps infrastructure layer",
      "AIM classifies evidence strength",
      "AIM classifies bottleneck phase",
      "AIM enforces 2-of-4 tightening rule",
      "AIM classifies chokepoint control signal type",
      "AIM maps strategic dependency",
      "AIM produces PAI-SAFE readiness handoff packet",
      "AIM produces journal-ready decision record",
      "AIM does not recommend trades",
      "AIM does not execute action",
      "human authority remains final",
      "speculation is not verified truth",
      "rumor does not produce Review Ready",
      "contradiction detected"
    ],
    status: "PASS"
  },
  null,
  2
));
"@
Write-NoBom "tests\smoke-aim-pass1.ts" $SmokeTest

if (!(Test-Path ".\node_modules")) {
  Run-OrFail "npm install"
}

Run-OrFail "npm run typecheck"
Run-OrFail "npm run smoke"
Run-OrFail "npm run verify"

$Report = @"
# AIM Pass 1 — Core Intelligence Module

Generated: $Timestamp

## Status

VERIFIED PASS

## Module Location

$AimRoot

## Product Brand

AIM — AI MarketIntel

## Internal Doctrine

Awareness + Infrastructure Mapping

## Files Touched

- package.json
- tsconfig.json
- README.md
- src/aimContracts.ts
- src/aimTaxonomy.ts
- src/aimEngine.ts
- src/index.ts
- tests/smoke-aim-pass1.ts
- scripts/run-aim-pass1.ps1

## Backups

$BackupRoot

## Commands Passed

- npm run typecheck
- npm run smoke
- npm run verify

## Confirmed

- AIM core module exists
- AIM doctrine contract created
- infrastructure layer taxonomy created
- pressure signal contract created
- dependency map contract created
- evidence classification contract created
- bottleneck phase classifier created
- chokepoint control classifier created
- strategic denial effect classifier created
- AIM output packet created
- PAI-SAFE readiness handoff packet created
- journal-ready decision record created
- 2-of-4 tightening rule enforced
- Speculation is not treated as verified truth
- Rumor / Ignore does not produce Review Ready status
- Contradiction Detected state works
- Final action remains blank for human authority
- No trade recommendation created
- No execution action created

## Boundary Preserved

No UI.
No dashboard layout.
No brokerage execution.
No trade recommendations.
No buy/sell language.
No financial advice language.
No autonomous trading.
No portfolio automation.
No payment processor.
No wallet.
No custody.
No S:\SOUL write path.
No PAI-SAFE logic changes.
No TPS changes.
No external APIs.
No live market data integration.
No brokerage API integration.
No automatic alerts to trade.
No investment committee automation.

## Doctrine

AIM detects pressure.
AIM maps dependency.
PAI-SAFE tests readiness.
TPS structures transactional movement.
Journal preserves continuity and proof.
Review makes you better than yesterday.
Execution proves the intelligence.
Human remains final authority.

## Final Rule

AIM feeds PAI-SAFE.
AIM does not become PAI-SAFE.
"@

New-Item -ItemType Directory -Path ".\reports" -Force | Out-Null
[System.IO.File]::WriteAllText($ReportPath, $Report, $Utf8NoBom)

Write-Host "`n=== AIM PASS 1 VERIFIED ===" -ForegroundColor Green
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