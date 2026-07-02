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

export type DiceCapturedSignalInput = {
  source: DiceSource;
  rawText: string;
  sourceContext?: {
    subreddit?: string;
    postTitle?: string;
    threadType?: 'post' | 'comment' | 'copied_prompt';
    permalink?: string;
    campaignTag?: string;
  };
  createdAt: string;
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
};