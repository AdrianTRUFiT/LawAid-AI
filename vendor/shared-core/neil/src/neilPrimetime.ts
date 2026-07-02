import type {
  NeilPrimetimeModeState,
  NeilPrimetimeProtocol
} from "./neilContracts.js";

export const PRIMETIME_ACTIVATION_PHRASE = "You think this is a game? ...Primetime.";
export const PRIMETIME_DEACTIVATION_PHRASE = "Signal clear. Resume standard.";

export function evaluatePrimetimeMode(triggerPhrase: string | null): NeilPrimetimeModeState {
  if (!triggerPhrase || triggerPhrase.trim().length === 0) return "INACTIVE";

  const normalized = triggerPhrase.trim();

  if (normalized === PRIMETIME_DEACTIVATION_PHRASE) return "DEACTIVATED";
  if (normalized === PRIMETIME_ACTIVATION_PHRASE) return "ACTIVE";
  if (normalized.toLowerCase().includes("primetime")) return "ACTIVATION_REQUESTED";

  return "INACTIVE";
}

export function createPrimetimeProtocol(triggerPhrase: string | null): NeilPrimetimeProtocol {
  const modeState = evaluatePrimetimeMode(triggerPhrase);

  return Object.freeze({
    activationPhrase: PRIMETIME_ACTIVATION_PHRASE,
    deactivationPhrase: PRIMETIME_DEACTIVATION_PHRASE,
    modeState,
    languageProfile: "COMPRESSED_CALCULATED_LAYERED",
    toneProfile: "ASSERTIVE_NEUTRAL_STRATEGIC_SURGICAL",
    logicProfile: "ASYMMETRICAL_MULTI_THREADED_RECURSIVE",
    reactionRule: "NEVER_FIRST_ALWAYS_REAUTHORED",
    moralBoundary: "AUTHORSHIP_ADVANTAGE_WITH_HUMAN_REVIEW",
    noDeception: true,
    noCoercion: true,
    noThreats: true,
    noUnauthorizedPracticeOfLaw: true
  });
}