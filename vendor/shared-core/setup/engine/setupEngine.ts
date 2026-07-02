import type {
  RawNeedSignal,
  CapturedNeedSignal,
  AiopClarificationSession,
  AidDepotItem,
  PackageAssemblyPlan,
  TransactionStatement
} from "../contracts/setupContracts";

export function diceCaptureSignal(raw: RawNeedSignal): CapturedNeedSignal {
  return {
    signalId: raw.signalId,
    capturedSignalId: `CAPTURED-${raw.signalId}`,
    source: raw.source,
    captured: true,
    createdAt: new Date().toISOString()
  };
}

export function aiopClarifySignal(
  captured: CapturedNeedSignal,
  input: Omit<AiopClarificationSession, "clarificationId" | "capturedSignalId" | "createdAt">
): AiopClarificationSession {
  return {
    clarificationId: `AIOP-${captured.capturedSignalId}`,
    capturedSignalId: captured.capturedSignalId,
    createdAt: new Date().toISOString(),
    ...input
  };
}

export function assembleFromAidDepot(
  clarification: AiopClarificationSession,
  inventory: AidDepotItem[]
): PackageAssemblyPlan {
  if (clarification.missingAnswers.length > 0) {
    return holdPlan(clarification, ["AIOP_CLARIFICATION_INCOMPLETE"]);
  }

  const matches = inventory.filter(item =>
    item.active &&
    item.allowedUserTypes.includes(clarification.userType) &&
    (!clarification.requiresTransactionProof || item.requiresProofPath)
  );

  if (matches.length === 0) {
    return {
      planId: `PLAN-${clarification.clarificationId}`,
      clarificationId: clarification.clarificationId,
      decision: "REFUSE",
      selectedDepotItems: [],
      deliverySurface: "HOLD_QUEUE",
      reasons: ["No approved depot item matches this clarified need."],
      refusalCodes: ["AID_NO_APPROVED_DEPOT_MATCH"],
      createdAt: new Date().toISOString()
    };
  }

  const selected = matches[0];

  return {
    planId: `PLAN-${clarification.clarificationId}`,
    clarificationId: clarification.clarificationId,
    decision: "ASSEMBLE",
    selectedDepotItems: [selected],
    deliverySurface: selected.deliverySurfaces[0],
    reasons: ["Clarified need matched to approved AID-S depot item."],
    refusalCodes: [],
    createdAt: new Date().toISOString()
  };
}

export function createTransactionStatement(
  plan: PackageAssemblyPlan,
  purpose: string
): TransactionStatement {
  if (plan.decision !== "ASSEMBLE") {
    throw new Error("TS_REFUSED_UNLESS_PACKAGE_ASSEMBLED");
  }

  return {
    tsId: `TS-${plan.planId}`,
    variant: "TS-GENERAL",
    planId: plan.planId,
    statementPurpose: purpose,
    proofBacked: false,
    createdBy: "SETUP_LAYER",
    createdAt: new Date().toISOString()
  };
}

function holdPlan(clarification: AiopClarificationSession, codes: string[]): PackageAssemblyPlan {
  return {
    planId: `PLAN-${clarification.clarificationId}`,
    clarificationId: clarification.clarificationId,
    decision: "HOLD",
    selectedDepotItems: [],
    deliverySurface: "HOLD_QUEUE",
    reasons: ["AIOP clarification incomplete. Setup cannot assemble package yet."],
    refusalCodes: codes,
    createdAt: new Date().toISOString()
  };
}