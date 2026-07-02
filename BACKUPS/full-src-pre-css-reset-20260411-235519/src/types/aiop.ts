export type OpeningState = 'new' | 'engaged' | 'activated';
export type RepresentationStatus = 'represented' | 'pro_se' | 'changing_counsel' | 'unknown';
export type PressureLevel = 'low' | 'moderate' | 'high' | 'severe';
export type ClarityState = 'clear' | 'strained' | 'fragmented' | 'flooded';
export type UrgencyLevel = 'low' | 'moderate' | 'high';
export type TaskCapacity = 'full' | 'partial' | 'low';
export type AvoidanceRisk = 'low' | 'medium' | 'high';
export type ReadinessState = 'ready' | 'needs_narrowing' | 'not_ready';
export type TrialState = 'pre_paywall' | 'trial_active' | 'trial_warning' | 'subscribed' | 'expired';

export type OnboardingSession = {
  sessionId: string;
  sourceCapturedSignalId?: string;
  openingState: OpeningState;
  dominantDomain?: 'legal' | 'financial' | 'wellness' | 'mixed';
  representationStatus?: RepresentationStatus;
  primaryPressureSource?: string;
  pressureLevel?: PressureLevel;
  clarityState?: ClarityState;
  urgencyLevel?: UrgencyLevel;
  taskCapacity?: TaskCapacity;
  avoidanceRisk?: AvoidanceRisk;
  inferredDependencies: string[];
  surfacedWarnings: string[];
  immediateReturnValues: string[];
  nextActions: string[];
  readinessState?: ReadinessState;
  trialState?: TrialState;
  knownDeadlines: Array<{
    label: string;
    date: string;
    source?: string;
    verified?: boolean;
  }>;
};