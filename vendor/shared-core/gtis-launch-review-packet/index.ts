export type GTISReviewStatus =
  | "GTIS_LAUNCH_CANDIDATE_REVIEW_READY"
  | "GTIS_LAUNCH_CANDIDATE_REVIEW_BLOCKED";

export interface VerifiedGTISArtifact {
  artifactId: string;
  label: string;
  path: string;
  status: string;
  scopedCompile: "PASS";
  smoke: "PASS";
}

export interface GTISVerifiedClaim {
  claimId: string;
  claim: string;
  allowedInDemo: boolean;
  allowedInInvestorNarrative: boolean;
  supportingArtifactIds: string[];
  boundary: {
    claimRequiresArtifactSupport: true;
    claimMustNotExceedVerifiedBuild: true;
    claimCreatesNoAuthority: true;
  };
}

export interface GTISLaunchReviewPacket {
  status: GTISReviewStatus;
  ready: boolean;
  categoryPosition: "Transaction Truth Governance";
  artifacts: VerifiedGTISArtifact[];
  verifiedClaims: GTISVerifiedClaim[];
  prohibitedClaims: string[];
  finalLaunchCandidateStatus: string;
  boundary: {
    reviewPacketIsNotPaymentAuthority: true;
    reviewPacketIsNotTransactionTruth: true;
    reviewPacketIsNotCustodyTransfer: true;
    reviewPacketIsNotRuntimeActivation: true;
    fundTrackerAIRemainsTransactionTruth: true;
    paiSafeRemainsDisplayOnly: true;
    finTechionAIRemainsOversightOnly: true;
    launchRequiresHumanAcceptance: true;
  };
}

export function buildGTISLaunchReviewPacket(
  artifacts: VerifiedGTISArtifact[]
): GTISLaunchReviewPacket {
  const allPass = artifacts.every(
    (artifact) => artifact.scopedCompile === "PASS" && artifact.smoke === "PASS"
  );

  const artifactIds = artifacts.map((artifact) => artifact.artifactId);

  const verifiedClaims: GTISVerifiedClaim[] = [
    {
      claimId: "claim_001",
      claim: "A governed transaction intelligence stack exists across consequence scoring, predictive mutation preparation, live tripwire correlation, authority lattice refusal, operator war room visibility, sovereign audit continuity, and launch review packaging.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: artifactIds,
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    },
    {
      claimId: "claim_002",
      claim: "FundTrackerAI remains the transaction truth authority throughout the GTIS lane.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: artifactIds,
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    },
    {
      claimId: "claim_003",
      claim: "PAI-SAFE remains a consumer-facing display surface and does not create transaction truth.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: ["leaps_4_7"],
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    },
    {
      claimId: "claim_004",
      claim: "FinTechionAI remains operator oversight and does not create Activated Transaction State.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: ["leaps_4_7"],
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    },
    {
      claimId: "claim_005",
      claim: "Forecast informs policy, but forecast is not evidence and prediction alone cannot refuse a transaction.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: ["strategic_leap_2", "strategic_leap_3"],
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    },
    {
      claimId: "claim_006",
      claim: "Audit continuity is tamper-evident and read-only proof support, not authority.",
      allowedInDemo: true,
      allowedInInvestorNarrative: true,
      supportingArtifactIds: ["leaps_4_7"],
      boundary: {
        claimRequiresArtifactSupport: true,
        claimMustNotExceedVerifiedBuild: true,
        claimCreatesNoAuthority: true
      }
    }
  ];

  return {
    status: allPass
      ? "GTIS_LAUNCH_CANDIDATE_REVIEW_READY"
      : "GTIS_LAUNCH_CANDIDATE_REVIEW_BLOCKED",
    ready: allPass,
    categoryPosition: "Transaction Truth Governance",
    artifacts,
    verifiedClaims,
    prohibitedClaims: [
      "Do not claim GTIS is a payment processor.",
      "Do not claim PAI-SAFE verifies transaction truth.",
      "Do not claim FinTechionAI governs FundTrackerAI.",
      "Do not claim forecast is evidence.",
      "Do not claim the launch packet creates runtime activation.",
      "Do not claim payment authority was created.",
      "Do not claim custody transfer was created.",
      "Do not claim production deployment is completed by this packet."
    ],
    finalLaunchCandidateStatus: allPass
      ? "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY"
      : "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_BLOCKED",
    boundary: {
      reviewPacketIsNotPaymentAuthority: true,
      reviewPacketIsNotTransactionTruth: true,
      reviewPacketIsNotCustodyTransfer: true,
      reviewPacketIsNotRuntimeActivation: true,
      fundTrackerAIRemainsTransactionTruth: true,
      paiSafeRemainsDisplayOnly: true,
      finTechionAIRemainsOversightOnly: true,
      launchRequiresHumanAcceptance: true
    }
  };
}
