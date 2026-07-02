import { useEffect, useMemo, useState } from "react";
import {
  AiopResponse,
  AiopSessionState,
  CapturedSignal,
  AiopInterpretation,
} from "./aiopContracts";
import { trackAiopEvent } from "./aiopAnalytics";
import { interpretAiopSession } from "./aiopInterpreter";
import { createVerifiedOpportunity } from "./aiopPackaging";
import {
  canAdvanceStage,
  getNextStage,
  getStagePrompt,
} from "./aiopStageEngine";

const STORAGE_PREFIX = "aiop:session:";

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

function getStorageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function createInitialCapturedSignal(): CapturedSignal {
  return {
    signalId: makeId("signal"),
    source: "direct_intake",
    signalCategory: "guided_proof_intake",
    urgencyMarkers: [],
    routeabilityIndicators: [],
    earlyRiskMarkers: [],
  };
}

export function createInitialSession(
  capturedSignal?: CapturedSignal
): AiopSessionState {
  const sessionId = makeId("session");
  const signal = capturedSignal ?? createInitialCapturedSignal();

  return {
    sessionId,
    capturedSignal: signal,
    startedAt: new Date().toISOString(),
    currentStage: "entry",
    responses: {},
    completedStages: [],
  };
}

export function buildInitialAiopSessionFromCapturedSignal(
  capturedSignal: CapturedSignal
): AiopSessionState {
  return createInitialSession(capturedSignal);
}

export function createOnboardingAnswer(
  questionId: string,
  value: string | string[]
): AiopResponse {
  return {
    questionId,
    value,
  };
}

export function loadAiopStore(capturedSignal?: CapturedSignal): AiopSessionState {
  const seed = capturedSignal ?? createInitialCapturedSignal();

  if (typeof window === "undefined") {
    return createInitialSession(seed);
  }

  try {
    const storageKey = `${STORAGE_PREFIX}${seed.signalId}`;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return createInitialSession(seed);
    return JSON.parse(raw) as AiopSessionState;
  } catch {
    return createInitialSession(seed);
  }
}

export function saveAiopStore(state: AiopSessionState): void {
  if (typeof window === "undefined") return;

  try {
    const storageKey = `${STORAGE_PREFIX}${state.capturedSignal.signalId}`;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // no-op
  }
}

export function getCurrentStagePrompt(state: AiopSessionState): string {
  return getStagePrompt(state.currentStage);
}

function persistSession(state: AiopSessionState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(state.sessionId), JSON.stringify(state));
  saveAiopStore(state);
}

export function updateOnboardingSession(
  state: AiopSessionState,
  questionId: string,
  value: string | string[]
): AiopSessionState {
  const response: AiopResponse = createOnboardingAnswer(questionId, value);

  const nextState: AiopSessionState = {
    ...state,
    responses: {
      ...state.responses,
      [questionId]: response,
    },
  };

  trackAiopEvent(state.sessionId, "response_captured", state.currentStage, {
    questionId,
    value,
  });

  return nextState;
}

export function advanceOnboardingSession(
  state: AiopSessionState
): AiopSessionState {
  if (!canAdvanceStage(state)) return state;

  const nextStage = getNextStage(state.currentStage);
  const completed = state.completedStages.includes(state.currentStage)
    ? state.completedStages
    : [...state.completedStages, state.currentStage];

  trackAiopEvent(state.sessionId, "stage_viewed", nextStage);

  if (nextStage === "handoff") {
    const opportunity = createVerifiedOpportunity({
      ...state,
      completedStages: completed,
    });

    trackAiopEvent(state.sessionId, "verified_opportunity_emitted", "handoff", {
      opportunityId: opportunity.opportunityId,
    });

    return {
      ...state,
      currentStage: nextStage,
      completedStages: completed,
      verifiedOpportunity: opportunity,
    };
  }

  return {
    ...state,
    currentStage: nextStage,
    completedStages: completed,
  };
}

export function deriveAiopInterpretation(
  state: AiopSessionState
): AiopInterpretation {
  return interpretAiopSession(state);
}

export function resetOnboardingSession(
  capturedSignal?: CapturedSignal
): AiopSessionState {
  return createInitialSession(capturedSignal);
}

export function useAiopSession(seedSignal?: CapturedSignal) {
  const [state, setState] = useState<AiopSessionState>(() =>
    createInitialSession(seedSignal)
  );

  useEffect(() => {
    persistSession(state);
  }, [state]);

  useEffect(() => {
    trackAiopEvent(state.sessionId, "session_started", "entry", {
      signalId: state.capturedSignal.signalId,
    });
  }, [state.sessionId, state.capturedSignal.signalId]);

  const interpretation = useMemo(() => interpretAiopSession(state), [state]);

  useEffect(() => {
    setState((prev) => {
      const prevJson = JSON.stringify(prev.interpretation ?? null);
      const nextJson = JSON.stringify(interpretation);
      if (prevJson === nextJson) return prev;
      return { ...prev, interpretation };
    });
  }, [interpretation]);

  function answer(questionId: string, value: string | string[]) {
    setState((prev) => updateOnboardingSession(prev, questionId, value));
  }

  function goNext() {
    setState((prev) => advanceOnboardingSession(prev));
  }

  function reset() {
    setState(resetOnboardingSession(seedSignal));
  }

  return {
    state,
    interpretation,
    answer,
    goNext,
    reset,
  };
}