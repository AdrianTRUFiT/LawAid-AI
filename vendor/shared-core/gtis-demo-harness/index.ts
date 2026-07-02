import type { PaiSafeDisplayState } from "../gtis-paisafe-display-binding";
import type { FinTechionOversightFeed } from "../fintechionai-oversight-feed";

export type DemoScenarioStatus =
  | "DEMO_SCENARIO_PASS"
  | "DEMO_SCENARIO_FAIL";

export interface ClaimToArtifact {
  claimId: string;
  claim: string;
  artifactRefs: string[];
  allowedForExternalDemo: boolean;
  boundary: {
    claimRequiresArtifactSupport: true;
    claimMustNotExceedVerifiedBuild: true;
    claimCreatesNoAuthority: true;
  };
}

export interface DemoScenarioResult {
  scenarioId: string;
  label: string;
  status: DemoScenarioStatus;
  claimId: string;
  proof: string;
}

export interface ExternalSafeGTISDemoHarnessInput {
  harnessId: string;
  artifactRefs: string[];
  claims: ClaimToArtifact[];
  paiSafeDisplay: PaiSafeDisplayState;
  oversightFeed: FinTechionOversightFeed;
}

export interface ExternalSafeGTISDemoHarnessResult {
  harnessId: string;
  status: "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_READY" | "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_BLOCKED";
  scenariosPassed: number;
  scenariosFailed: number;
  scenarioResults: DemoScenarioResult[];
  blockedClaims: string[];
  boundary: {
    demoIsNotProductionDeployment: true;
    demoCreatesNoPaymentAuthority: true;
    demoCreatesNoTransactionTruth: true;
    demoCreatesNoCustodyTransfer: true;
    demoCreatesNoRuntimeActivation: true;
    everyDemoClaimMustTraceToArtifact: true;
    displayStateIsNotAuthority: true;
    oversightStateIsNotCommand: true;
  };
}

function claimSupported(claim: ClaimToArtifact): boolean {
  return claim.allowedForExternalDemo === true && claim.artifactRefs.length > 0;
}

export function buildExternalSafeGTISDemoHarness(
  input: ExternalSafeGTISDemoHarnessInput
): ExternalSafeGTISDemoHarnessResult {
  const blockedClaims = input.claims
    .filter((claim) => !claimSupported(claim))
    .map((claim) => claim.claimId);

  const scenarioResults: DemoScenarioResult[] = [
    {
      scenarioId: "scenario_display_boundary",
      label: "PAI-SAFE display state remains display only",
      status:
        input.paiSafeDisplay.boundary.displayIsNotAuthority === true &&
        input.paiSafeDisplay.boundary.displayCannotBecomeTransactionTruth === true
          ? "DEMO_SCENARIO_PASS"
          : "DEMO_SCENARIO_FAIL",
      claimId: "claim_display_only",
      proof: input.paiSafeDisplay.status
    },
    {
      scenarioId: "scenario_oversight_boundary",
      label: "FinTechionAI oversight feed remains read-only",
      status:
        input.oversightFeed.boundary.oversightIsReadOnly === true &&
        input.oversightFeed.boundary.noWritePathBackToGTISOrFundTrackerAI === true
          ? "DEMO_SCENARIO_PASS"
          : "DEMO_SCENARIO_FAIL",
      claimId: "claim_oversight_readonly",
      proof: input.oversightFeed.route
    },
    {
      scenarioId: "scenario_claim_artifacts",
      label: "Every external demo claim traces to verified artifacts",
      status: blockedClaims.length === 0 ? "DEMO_SCENARIO_PASS" : "DEMO_SCENARIO_FAIL",
      claimId: "claim_artifact_traceability",
      proof: `${input.claims.length - blockedClaims.length}/${input.claims.length} claims supported`
    }
  ];

  const scenariosFailed = scenarioResults.filter((scenario) => scenario.status === "DEMO_SCENARIO_FAIL").length;
  const scenariosPassed = scenarioResults.filter((scenario) => scenario.status === "DEMO_SCENARIO_PASS").length;

  return {
    harnessId: input.harnessId,
    status: scenariosFailed === 0
      ? "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_READY"
      : "EXTERNAL_SAFE_GTIS_DEMO_HARNESS_BLOCKED",
    scenariosPassed,
    scenariosFailed,
    scenarioResults,
    blockedClaims,
    boundary: {
      demoIsNotProductionDeployment: true,
      demoCreatesNoPaymentAuthority: true,
      demoCreatesNoTransactionTruth: true,
      demoCreatesNoCustodyTransfer: true,
      demoCreatesNoRuntimeActivation: true,
      everyDemoClaimMustTraceToArtifact: true,
      displayStateIsNotAuthority: true,
      oversightStateIsNotCommand: true
    }
  };
}

export const EXTERNAL_SAFE_GTIS_DEMO_HARNESS_DOCTRINE = {
  name: "External-Safe GTIS Demo Harness",
  class: "CLAIM_TO_ARTIFACT_DEMO_GOVERNANCE_LAYER",
  purpose:
    "Allow external demonstration only when every claim traces to verified artifacts and no display or oversight surface becomes authority.",
  boundary: {
    demoIsNotProduction: true,
    everyClaimRequiresArtifact: true,
    noAuthorityCreatedByDemo: true,
    noRuntimeActivationCreatedByDemo: true
  }
} as const;
