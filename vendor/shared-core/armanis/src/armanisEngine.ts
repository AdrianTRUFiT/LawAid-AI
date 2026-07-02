import type {
  AcquirerProfile,
  AgenticReadinessAssessment,
  CompanyReadinessPacket,
  CompatibilityScore,
  DealAnswerPacket,
  ReadinessStatus,
  TargetProfile
} from "./armanisContracts.js";
import {
  averageScores,
  clampScore,
  issueCertification,
  statusFromScore
} from "./armanisCertification.js";

function requirePacket(packet: CompanyReadinessPacket | undefined | null): asserts packet is CompanyReadinessPacket {
  if (!packet) throw new Error("INCOMPLETE_PACKET_REFUSED");
}

export function refuseIncompletePacket(packet: Partial<CompanyReadinessPacket> | null | undefined): AgenticReadinessAssessment {
  const companyId = packet?.companyId || "UNKNOWN_COMPANY";
  const companyName = packet?.companyName || "Unknown Company";

  return Object.freeze({
    companyId,
    companyName,
    averageScore: 0,
    status: "REFUSED",
    certificationLevel: "LEVEL_1_VISIBILITY",
    conditions: [],
    refusedReasons: ["Incomplete readiness packet refused."],
    humanReviewRequired: true,
    legalAuthorityClaimed: false
  });
}

function assessCompanyReadiness(packet: CompanyReadinessPacket): AgenticReadinessAssessment {
  requirePacket(packet);

  const refusedReasons: string[] = [];
  const conditions: string[] = [];

  if (!packet.companyId || !packet.companyName || !packet.createdAt) {
    return refuseIncompletePacket(packet);
  }

  if (packet.externalApiUsed !== false) {
    refusedReasons.push("External APIs are not allowed in ARMANIS Pass 1.");
  }

  if (packet.legalAuthorityClaimed !== false) {
    refusedReasons.push("Legal authority claims are not allowed in ARMANIS Pass 1.");
  }

  if (!packet.humanAuthorityConfirmed) {
    conditions.push("Document human override process.");
  }

  if (!packet.auditTrailAvailable) {
    conditions.push("Verify auditability before acquisition review.");
  }

  if (!packet.proofContinuityAvailable) {
    conditions.push("Verify data custody transfer path.");
  }

  if (packet.scores.authorizationClarity < 80) {
    conditions.push("Clarify AI authorization boundaries.");
  }

  if (packet.knownGaps.length > 0) {
    conditions.push(...packet.knownGaps);
  }

  const averageScore = averageScores(packet.scores);
  const certificationLevel = issueCertification(averageScore);
  const status = statusFromScore(averageScore, refusedReasons, conditions);

  return Object.freeze({
    companyId: packet.companyId,
    companyName: packet.companyName,
    averageScore,
    status,
    certificationLevel,
    conditions: Array.from(new Set(conditions)),
    refusedReasons,
    humanReviewRequired: true,
    legalAuthorityClaimed: false
  });
}

export function assessAcquirerReadiness(acquirer: AcquirerProfile): AgenticReadinessAssessment {
  const base = assessCompanyReadiness(acquirer);
  const conditions = [...base.conditions];

  if (acquirer.integrationCapacity < 70) {
    conditions.push("Improve integration capacity before acquisition execution.");
  }

  if (acquirer.capitalReadiness < 70) {
    conditions.push("Confirm capital readiness before deal movement.");
  }

  const status: ReadinessStatus = base.status === "SAFE_TO_ACQUIRE" && conditions.length > 0
    ? "SAFE_WITH_CONDITIONS"
    : base.status;

  return Object.freeze({
    ...base,
    conditions: Array.from(new Set(conditions)),
    status
  });
}

export function assessTargetReadiness(target: TargetProfile): AgenticReadinessAssessment {
  const base = assessCompanyReadiness(target);
  const conditions = [...base.conditions];

  if (target.transferReadiness < 75) {
    conditions.push("Improve workflow transfer readiness.");
  }

  if (target.operationalDependencyRisk > 35) {
    conditions.push("Reduce operational dependency risk.");
  }

  if (target.dataRoomPreparedness < 75) {
    conditions.push("Prepare data room for agentic review.");
  }

  const status: ReadinessStatus = base.status === "SAFE_TO_ACQUIRE" && conditions.length > 0
    ? "SAFE_WITH_CONDITIONS"
    : base.status;

  return Object.freeze({
    ...base,
    conditions: Array.from(new Set(conditions)),
    status
  });
}

export function calculateCompatibility(acquirer: AcquirerProfile, target: TargetProfile): CompatibilityScore {
  const acquirerAssessment = assessAcquirerReadiness(acquirer);
  const targetAssessment = assessTargetReadiness(target);

  const integrationFit = Math.round((clampScore(acquirer.integrationCapacity) + clampScore(target.scores.integrationReadiness)) / 2);
  const transferFit = Math.round((clampScore(target.transferReadiness) + clampScore(target.scores.workflowTransferability)) / 2);
  const custodyFit = Math.round((clampScore(acquirer.scores.dataCustody) + clampScore(target.scores.dataCustody)) / 2);
  const proofFit = Math.round((clampScore(acquirer.scores.proofContinuity) + clampScore(target.scores.proofContinuity)) / 2);

  const riskPenalty = Math.round(clampScore(target.operationalDependencyRisk) * 0.2);
  const compatibilityScore = clampScore(Math.round((integrationFit + transferFit + custodyFit + proofFit) / 4) - riskPenalty);

  const conditions = Array.from(new Set([
    ...acquirerAssessment.conditions,
    ...targetAssessment.conditions
  ]));

  const status: ReadinessStatus =
    acquirerAssessment.status === "REFUSED" || targetAssessment.status === "REFUSED"
      ? "REFUSED"
      : compatibilityScore >= 85 && conditions.length === 0
        ? "SAFE_TO_ACQUIRE"
        : compatibilityScore >= 70
          ? "SAFE_WITH_CONDITIONS"
          : compatibilityScore >= 50
            ? "HOLD_REMEDIATION_REQUIRED"
            : "NOT_AGENTIC_READY";

  return Object.freeze({
    acquirerId: acquirer.companyId,
    targetId: target.companyId,
    compatibilityScore,
    status,
    conditions,
    integrationUncertainty: clampScore(100 - integrationFit),
    proofContinuityGap: clampScore(100 - proofFit)
  });
}

export function generateDealAnswerPacket(
  acquirer: AcquirerProfile,
  targets: TargetProfile[]
): DealAnswerPacket {
  const acquirerAssessment = assessAcquirerReadiness(acquirer);

  if (!targets.length) {
    throw new Error("INCOMPLETE_PACKET_REFUSED");
  }

  const ranked = targets
    .map((target) => ({
      target,
      targetAssessment: assessTargetReadiness(target),
      compatibility: calculateCompatibility(acquirer, target)
    }))
    .sort((a, b) => b.compatibility.compatibilityScore - a.compatibility.compatibilityScore);

  const best = ranked[0];
  if (!best) throw new Error("INCOMPLETE_PACKET_REFUSED");

  const certificationLevel = best.targetAssessment.certificationLevel;
  const status = best.compatibility.status;
  const compatibilityScore = best.compatibility.compatibilityScore;
  const conditions = best.compatibility.conditions;

  return Object.freeze({
    status,
    recommendedTarget: best.target.companyName,
    certificationLevel,
    compatibilityScore,
    conditions,
    decisionSummary:
      `${best.target.companyName} is the stronger acquisition candidate due to higher transfer readiness and lower integration uncertainty.`,
    acquirerAssessment,
    targetAssessment: best.targetAssessment,
    noLiveNegotiation: true,
    noPayments: true,
    noBlockchain: true,
    noExternalApis: true,
    noLegalAuthority: true,
    noMarketplace: true,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  });
}