import {
  buildPaiSafeDisplayBinding,
  GTIS_PAI_SAFE_DISPLAY_BINDING_DOCTRINE
} from "../gtis-paisafe-display-binding";
import {
  buildFinTechionReadOnlyOversightFeed,
  FINTECHIONAI_OVERSIGHT_FEED_DOCTRINE
} from "../fintechionai-oversight-feed";
import {
  buildExternalSafeGTISDemoHarness,
  EXTERNAL_SAFE_GTIS_DEMO_HARNESS_DOCTRINE
} from "../gtis-demo-harness";
import type {
  ClaimToArtifact
} from "../gtis-demo-harness";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(GTIS_PAI_SAFE_DISPLAY_BINDING_DOCTRINE.boundary.displayIsNotAuthority === true, "PAI-SAFE doctrine locks display is not authority");
assert(FINTECHIONAI_OVERSIGHT_FEED_DOCTRINE.boundary.oversightIsReadOnly === true, "FinTechionAI doctrine locks read-only oversight");
assert(EXTERNAL_SAFE_GTIS_DEMO_HARNESS_DOCTRINE.boundary.everyClaimRequiresArtifact === true, "Demo doctrine requires artifacts for claims");

const display = buildPaiSafeDisplayBinding({
  transactionRef: "txn_phase1b_001",
  sourceRef: "ats_gate_verified_001",
  fundTrackerDecisionRef: "ft_decision_001",
  activatedTransactionStateRef: "ats_fundtracker_001",
  governedStateSource: "ATS_ARTIFACT_GATE",
  requestedStatus: "display_activated",
  rawProcessorObjectPresent: false,
  internalScoringWeightsPresent: false,
  custodyClassDetailsPresent: false,
  auditInternalsPresent: false
});

assert(display.status === "display_activated", "PAI-SAFE activated display created from sourced state");
assert(display.safeToDisplay === true, "PAI-SAFE safe to display");
assert(display.downstreamActivationEligible === true, "PAI-SAFE downstream activation eligible display true");
assert(display.boundary.displayIsNotAuthority === true, "Display is not authority");
assert(display.boundary.displayCannotBecomeTransactionTruth === true, "Display cannot become transaction truth");
assert(display.boundary.paiSafeDoesNotCreateRuntimeActivation === true, "PAI-SAFE creates no runtime activation");

const blockedDisplay = buildPaiSafeDisplayBinding({
  transactionRef: "txn_phase1b_blocked",
  governedStateSource: "ATS_ARTIFACT_GATE",
  requestedStatus: "display_activated",
  rawProcessorObjectPresent: true,
  internalScoringWeightsPresent: true,
  custodyClassDetailsPresent: false,
  auditInternalsPresent: true
});

assert(blockedDisplay.status === "display_requires_attention", "Display blocks unsafe exposure");
assert(blockedDisplay.refusalReasons.includes("SOURCE_REF_REQUIRED"), "Source ref required");
assert(blockedDisplay.refusalReasons.includes("FUNDTRACKER_DECISION_REF_REQUIRED"), "FundTracker decision ref required");
assert(blockedDisplay.refusalReasons.includes("RAW_SOURCE_DATA_REFUSED"), "Raw source data refused");
assert(blockedDisplay.refusalReasons.includes("INTERNAL_SCORE_EXPOSURE_REFUSED"), "Internal score exposure refused");
assert(blockedDisplay.refusalReasons.includes("AUDIT_INTERNALS_EXPOSURE_REFUSED"), "Audit internals exposure refused");

const oversight = buildFinTechionReadOnlyOversightFeed({
  transactionRef: "txn_phase1b_001",
  signals: [
    {
      signalId: "signal_001",
      transactionRef: "txn_phase1b_001",
      signalClass: "AUTHORITY_REFUSAL",
      severity: "HIGH",
      summary: "Authority promotion refused.",
      sourceRef: "authority_lattice_001",
      containsConsumerPII: false,
      containsRawFinancialSource: false
    },
    {
      signalId: "signal_002",
      transactionRef: "txn_phase1b_001",
      signalClass: "PAI_SAFE_DISPLAY",
      severity: "LOW",
      summary: "PAI-SAFE display state prepared.",
      sourceRef: "display_001",
      containsConsumerPII: false,
      containsRawFinancialSource: false
    }
  ]
});

assert(oversight.route === "respond", "High severity oversight routes to respond");
assert(oversight.signals.length === 2, "Oversight feed contains clean signals");
assert(oversight.boundary.oversightIsReadOnly === true, "Oversight is read-only");
assert(oversight.boundary.noWritePathBackToGTISOrFundTrackerAI === true, "No write path back to GTIS or FundTrackerAI");
assert(oversight.boundary.oversightDoesNotCreateActivatedTransactionState === true, "Oversight does not create ATS");

const dirtyOversight = buildFinTechionReadOnlyOversightFeed({
  transactionRef: "txn_phase1b_dirty",
  signals: [
    {
      signalId: "dirty_001",
      transactionRef: "txn_phase1b_dirty",
      signalClass: "AUDIT_SPINE",
      severity: "CRITICAL",
      summary: "This signal contains raw source and must be filtered.",
      sourceRef: "audit_dirty",
      containsConsumerPII: false,
      containsRawFinancialSource: true
    },
    {
      signalId: "clean_001",
      transactionRef: "txn_phase1b_dirty",
      signalClass: "PROOF_HEALTH",
      severity: "MEDIUM",
      summary: "Clean proof health signal.",
      sourceRef: "proof_clean",
      containsConsumerPII: false,
      containsRawFinancialSource: false
    }
  ]
});

assert(dirtyOversight.signals.length === 1, "Oversight filters raw financial source signals");
assert(dirtyOversight.signals[0]?.signalId === "clean_001", "Only clean oversight signal remains");

const claims: ClaimToArtifact[] = [
  {
    claimId: "claim_display_only",
    claim: "PAI-SAFE remains display only.",
    artifactRefs: ["gtis-phase-1a", "gtis-phase-1b"],
    allowedForExternalDemo: true,
    boundary: {
      claimRequiresArtifactSupport: true,
      claimMustNotExceedVerifiedBuild: true,
      claimCreatesNoAuthority: true
    }
  },
  {
    claimId: "claim_oversight_readonly",
    claim: "FinTechionAI remains read-only oversight.",
    artifactRefs: ["gtis-phase-1b"],
    allowedForExternalDemo: true,
    boundary: {
      claimRequiresArtifactSupport: true,
      claimMustNotExceedVerifiedBuild: true,
      claimCreatesNoAuthority: true
    }
  },
  {
    claimId: "claim_artifact_traceability",
    claim: "Every external demo claim traces to verified artifacts.",
    artifactRefs: ["gtis-launch-review-packet"],
    allowedForExternalDemo: true,
    boundary: {
      claimRequiresArtifactSupport: true,
      claimMustNotExceedVerifiedBuild: true,
      claimCreatesNoAuthority: true
    }
  }
];

const demo = buildExternalSafeGTISDemoHarness({
  harnessId: "gtis_phase1b_demo_001",
  artifactRefs: ["gtis-phase-1a", "gtis-phase-1b", "gtis-launch-review-packet"],
  claims,
  paiSafeDisplay: display,
  oversightFeed: oversight
});

assert(demo.status === "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_READY", "External-safe demo harness ready");
assert(demo.scenariosPassed === 3, "External-safe demo passes three scenarios");
assert(demo.scenariosFailed === 0, "External-safe demo has zero failures");
assert(demo.blockedClaims.length === 0, "No demo claims blocked");
assert(demo.boundary.demoCreatesNoPaymentAuthority === true, "Demo creates no payment authority");
assert(demo.boundary.demoCreatesNoTransactionTruth === true, "Demo creates no transaction truth");
assert(demo.boundary.everyDemoClaimMustTraceToArtifact === true, "Every demo claim traces to artifact");

const badClaims: ClaimToArtifact[] = [
  {
    claimId: "claim_unbacked",
    claim: "Unsupported demo claim.",
    artifactRefs: [],
    allowedForExternalDemo: true,
    boundary: {
      claimRequiresArtifactSupport: true,
      claimMustNotExceedVerifiedBuild: true,
      claimCreatesNoAuthority: true
    }
  }
];

const blockedDemo = buildExternalSafeGTISDemoHarness({
  harnessId: "gtis_phase1b_demo_blocked",
  artifactRefs: ["gtis-phase-1b"],
  claims: badClaims,
  paiSafeDisplay: display,
  oversightFeed: oversight
});

assert(blockedDemo.status === "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_BLOCKED", "Demo blocks unsupported claim");
assert(blockedDemo.blockedClaims.includes("claim_unbacked"), "Unsupported claim identified");

console.log("");
console.log("GTIS_PHASE_1B_EXTERNAL_SURFACE_BOUNDARY_ENFORCEMENT_SMOKE=PASS");
