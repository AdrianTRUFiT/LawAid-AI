import {
  AiopInsight,
  AiopInterpretation,
  AiopResponse,
  AiopSessionState,
  PaymentReadiness,
  PostureState,
  PressureCategory,
  ReadinessState,
} from "./aiopContracts";

function normalizePressure(value?: string): PressureCategory {
  switch (value) {
    case "deadline":
    case "communication":
    case "money":
    case "missing_access":
    case "uncertainty":
    case "evidence":
      return value;
    default:
      return "other";
  }
}

function normalizePosture(value?: string): PostureState {
  switch (value) {
    case "solo":
    case "represented":
    case "transitioning":
      return value;
    default:
      return "uncertain";
  }
}

function deriveUrgency(
  pressure: PressureCategory,
  risk?: string
): "low" | "medium" | "high" {
  if (pressure === "deadline" || risk === "timeline") return "high";
  if (pressure === "money" || pressure === "missing_access" || risk === "position") {
    return "medium";
  }
  return "low";
}

function deriveRiskSignals(
  pressure: PressureCategory,
  risk?: string,
  posture?: PostureState
): string[] {
  const signals = new Set<string>();

  if (pressure === "deadline") signals.add("timeline_instability");
  if (pressure === "communication") signals.add("communication_exposure");
  if (pressure === "evidence") signals.add("record_disorder");
  if (pressure === "uncertainty") signals.add("decision_fog");
  if (risk === "documentation") signals.add("documentation_gap");
  if (risk === "misunderstanding") signals.add("narrative_exposure");
  if (risk === "position") signals.add("position_weakness");
  if (posture === "transitioning") signals.add("support_transition");

  return Array.from(signals);
}

function deriveReadiness(
  posture: PostureState,
  urgency: "low" | "medium" | "high"
): ReadinessState {
  if (urgency === "high") return "ready_to_continue";
  if (posture === "uncertain") return "clarifying";
  if (posture === "solo" || posture === "transitioning") return "ready_to_continue";
  return "needs_review";
}

function derivePaymentReadiness(readiness: ReadinessState): PaymentReadiness {
  return readiness === "ready_to_continue" ? "save_gate_ready" : "preview_only";
}

function deriveRoutingDecision(pressure: PressureCategory): string {
  switch (pressure) {
    case "deadline":
      return "timeline_and_deadline_path";
    case "communication":
      return "communication_record_path";
    case "money":
      return "financial_position_path";
    case "missing_access":
      return "missing_access_path";
    case "evidence":
      return "evidence_organization_path";
    case "uncertainty":
      return "decision_clarity_path";
    default:
      return "general_intake_path";
  }
}

function deriveInsight(
  pressure: PressureCategory,
  riskSignals: string[],
  posture: PostureState
): AiopInsight {
  if (pressure === "deadline") {
    return {
      pressureCenter: "Timeline instability",
      hiddenDependency: "A clean chronology is likely missing or incomplete.",
      firstProtectiveMove:
        "Anchor the next critical date and attach the most relevant supporting record now.",
      atRiskArea: "Timing and sequence clarity",
      suggestedNextModule: "Timeline Builder",
      trustSummary:
        "The fastest relief is usually not another message. It is a usable timeline.",
    };
  }

  if (pressure === "communication") {
    return {
      pressureCenter: "Communication disorder",
      hiddenDependency:
        "The real gap may be attributable sequencing, not just the last message.",
      firstProtectiveMove:
        "Bundle the last key exchanges into one attributable communication thread.",
      atRiskArea: "Message interpretation and record continuity",
      suggestedNextModule: "Communication Record Builder",
      trustSummary:
        "When communication is fragmented, position usually weakens before people notice.",
    };
  }

  if (pressure === "money") {
    return {
      pressureCenter: "Financial pressure",
      hiddenDependency:
        "The problem may be missing structure around what is owed, exposed, or undocumented.",
      firstProtectiveMove:
        "Separate pressure from proof. Create one short list of the amounts, dates, and missing items.",
      atRiskArea: "Financial clarity and proof linkage",
      suggestedNextModule: "Financial Position Map",
      trustSummary:
        "Financial stress feels broad until the system turns it into an attributable structure.",
    };
  }

  if (pressure === "evidence") {
    return {
      pressureCenter: "Evidence sprawl",
      hiddenDependency:
        "The actual weakness is likely grouping and retrieval, not volume.",
      firstProtectiveMove:
        "Create one issue bucket and place only the strongest records into it first.",
      atRiskArea: "Retrieval and issue linkage",
      suggestedNextModule: "Evidence Intake Shell",
      trustSummary:
        "Messy evidence is often not a missing-data problem. It is a missing-structure problem.",
    };
  }

  if (pressure === "missing_access") {
    return {
      pressureCenter: "Missing access",
      hiddenDependency:
        "The blocking issue may be who controls the next required record or decision path.",
      firstProtectiveMove:
        "Name the exact missing item, who controls it, and what consequence the gap creates.",
      atRiskArea: "Dependency ownership",
      suggestedNextModule: "Access Gap Mapper",
      trustSummary:
        "A hidden dependency often feels like confusion until it is named explicitly.",
    };
  }

  if (pressure === "uncertainty") {
    return {
      pressureCenter: "Decision fog",
      hiddenDependency:
        "The real issue may be not knowing the first protective move, not lacking all answers.",
      firstProtectiveMove:
        "Choose the next action that preserves position before it optimizes outcome.",
      atRiskArea: "Decision sequencing",
      suggestedNextModule: "Positioning Path",
      trustSummary:
        "Clarity often begins when the next protective move is separated from the whole problem.",
    };
  }

  return {
    pressureCenter: "General intake pressure",
    hiddenDependency:
      posture === "transitioning"
        ? "Transition itself is becoming a risk factor."
        : "The core dependency is not fully isolated yet.",
    firstProtectiveMove:
      "Capture the situation in one attributable sentence and identify the most exposed area.",
    atRiskArea: riskSignals[0] ?? "Unspecified exposure",
    suggestedNextModule: "General Intake Workspace",
    trustSummary:
      "The system is narrowing the situation into something structured enough to continue.",
  };
}

export function interpretAiopSession(state: AiopSessionState): AiopInterpretation {
  const pressure = normalizePressure(String(state.responses["pressure"]?.value ?? "other"));
  const posture = normalizePosture(String(state.responses["posture"]?.value ?? "uncertain"));
  const risk = String(state.responses["risk"]?.value ?? "");
  const urgency = deriveUrgency(pressure, risk);
  const riskSignals = deriveRiskSignals(pressure, risk, posture);
  const readinessState = deriveReadiness(posture, urgency);
  const paymentReadiness = derivePaymentReadiness(readinessState);
  const routingDecision = deriveRoutingDecision(pressure);
  const preferences: string[] = [];
  const initializationHints = [
    "seed_dashboard_preview",
    "preserve_continuity_state",
    "prepare_verified_opportunity_handoff",
  ];

  return {
    pressureCategory: pressure,
    posture,
    urgency,
    riskSignals,
    readinessState,
    paymentReadiness,
    routingDecision,
    preferences,
    initializationHints,
    insight: deriveInsight(pressure, riskSignals, posture),
  };
}

export function interpretOnboardingAnswer(
  arg1: AiopSessionState | AiopResponse,
  arg2?: AiopSessionState | AiopResponse
): AiopInterpretation {
  let session: AiopSessionState | undefined;
  let answer: AiopResponse | undefined;

  if (arg1 && typeof arg1 === "object" && "responses" in arg1) {
    session = arg1 as AiopSessionState;
  } else {
    answer = arg1 as AiopResponse;
  }

  if (arg2 && typeof arg2 === "object" && "responses" in arg2) {
    session = arg2 as AiopSessionState;
  } else if (arg2) {
    answer = arg2 as AiopResponse;
  }

  const workingSession: AiopSessionState =
    session ??
    {
      sessionId: "legacy_session",
      capturedSignal: {
        signalId: "legacy_signal",
        source: "legacy_view",
        signalCategory: "guided_proof_intake",
        urgencyMarkers: [],
        routeabilityIndicators: [],
        earlyRiskMarkers: [],
      },
      startedAt: new Date().toISOString(),
      currentStage: "entry",
      responses: {},
      completedStages: [],
    };

  const mergedSession: AiopSessionState = answer
    ? {
        ...workingSession,
        responses: {
          ...workingSession.responses,
          [answer.questionId]: answer,
        },
      }
    : workingSession;

  return interpretAiopSession(mergedSession);
}
