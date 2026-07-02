export type DiceSource = 'reddit' | 'qr' | 'landing_page' | 'referral';

export type DiceProblemClass = 'simple' | 'structured' | 'management_grade';
export type DiceDomain = 'legal' | 'financial' | 'wellness' | 'mixed';
export type DiceUrgency = 'low' | 'moderate' | 'high';
export type DiceBurden = 'low' | 'moderate' | 'high';

export type DiceResponseMode =
  | 'guidance'
  | 'clarification'
  | 'continuity_warning'
  | 'pressure_reduction'
  | 'system_recommendation';

export type DiceNextStep =
  | 'stop'
  | 'clarify'
  | 'continue_with_ask_lawaidai'
  | 'begin_trial';

export type DiceThreadType = 'post' | 'comment' | 'copied_prompt';

export type DiceSourceContext = {
  subreddit?: string;
  postTitle?: string;
  threadType?: DiceThreadType;
  permalink?: string;
  campaignTag?: string;
};

export type DiceCapturedSignalInput = {
  source: DiceSource;
  rawText: string;
  sourceContext?: DiceSourceContext;
  createdAt: string;
};

export type DiceClassification = {
  dominantDomain: DiceDomain;
  problemClass: DiceProblemClass;
  urgencyLevel: DiceUrgency;
  continuityBurden: DiceBurden;
  emotionalWeight: DiceBurden;
  signalConfidence: number;
  continuationLikelihood: 'low' | 'medium' | 'high';
  matchedSignals: string[];
};

export type DicePrimerResponse = {
  mode: DiceResponseMode;
  directGuidance: string[];
  problemFraming: string;
  watchOut?: string;
  continuationSuggestion: string;
  recommendedNextStep: DiceNextStep;
};

export type CapturedSignal = {
  capturedSignalId: string;
  source: DiceSource;
  rawText: string;
  normalizedQuestion: string;
  dominantDomain: DiceDomain;
  problemClass: DiceProblemClass;
  urgencyLevel: DiceUrgency;
  continuityBurden: DiceBurden;
  primerResponseMode: DiceResponseMode;
  immediateGuidance: string[];
  recommendedNextStep: DiceNextStep;
  createdAt: string;
  sourceContext?: DiceSourceContext;
};

export type DiceSessionRecord = {
  sessionId: string;
  input: DiceCapturedSignalInput;
  classification: DiceClassification;
  response: DicePrimerResponse;
  capturedSignal?: CapturedSignal;
  updatedAt: string;
};

export type DiceStoreState = {
  sessions: DiceSessionRecord[];
  updatedAt: string;
};

export const DICE_DEFAULT_STORE_STATE: DiceStoreState = {
  sessions: [],
  updatedAt: new Date().toISOString(),
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeQuestion(rawText: string): string {
  return rawText.replace(/\s+/g, ' ').trim();
}

export function createDiceInput(
  rawText: string,
  source: DiceSource = 'reddit',
  sourceContext?: DiceSourceContext
): DiceCapturedSignalInput {
  return {
    source,
    rawText: normalizeQuestion(rawText),
    sourceContext,
    createdAt: nowIso(),
  };
}

export function createCapturedSignal(
  input: DiceCapturedSignalInput,
  classification: DiceClassification,
  response: DicePrimerResponse
): CapturedSignal {
  return {
    capturedSignalId: makeId('captured_signal'),
    source: input.source,
    rawText: input.rawText,
    normalizedQuestion: normalizeQuestion(input.rawText),
    dominantDomain: classification.dominantDomain,
    problemClass: classification.problemClass,
    urgencyLevel: classification.urgencyLevel,
    continuityBurden: classification.continuityBurden,
    primerResponseMode: response.mode,
    immediateGuidance: response.directGuidance,
    recommendedNextStep: response.recommendedNextStep,
    createdAt: nowIso(),
    sourceContext: input.sourceContext,
  };
}

export function isDiceInputReady(input: DiceCapturedSignalInput): boolean {
  return Boolean(input.rawText && input.rawText.trim().length >= 6);
}