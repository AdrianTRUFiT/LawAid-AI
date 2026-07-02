import type {
  DiceCapturedSignalInput,
  DiceSessionRecord,
  DiceStoreState,
} from './diceContracts';
import {
  DICE_DEFAULT_STORE_STATE,
  createCapturedSignal,
  makeId,
  nowIso,
} from './diceContracts';
import { classifyDiceSignal } from './diceClassifier';
import { buildDicePrimerResponse } from './diceResponseEngine';

const STORAGE_KEY = 'lawaidai-dice-store';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function loadDiceStore(): DiceStoreState {
  if (!canUseStorage()) return DICE_DEFAULT_STORE_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DICE_DEFAULT_STORE_STATE;

    const parsed = JSON.parse(raw) as Partial<DiceStoreState>;
    return {
      sessions: parsed.sessions ?? [],
      updatedAt: parsed.updatedAt ?? nowIso(),
    };
  } catch {
    return DICE_DEFAULT_STORE_STATE;
  }
}

export function saveDiceStore(state: DiceStoreState): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDiceStore(): DiceStoreState {
  const next = { ...DICE_DEFAULT_STORE_STATE, updatedAt: nowIso() };
  saveDiceStore(next);
  return next;
}

export function runDicePrimer(
  input: DiceCapturedSignalInput
): DiceSessionRecord {
  const classification = classifyDiceSignal(input);
  const response = buildDicePrimerResponse(classification);

  const capturedSignal =
    response.recommendedNextStep === 'stop'
      ? undefined
      : createCapturedSignal(input, classification, response);

  const session: DiceSessionRecord = {
    sessionId: makeId('dice_session'),
    input,
    classification,
    response,
    capturedSignal,
    updatedAt: nowIso(),
  };

  const store = loadDiceStore();
  const next: DiceStoreState = {
    sessions: [session, ...store.sessions].slice(0, 25),
    updatedAt: nowIso(),
  };

  saveDiceStore(next);
  return session;
}