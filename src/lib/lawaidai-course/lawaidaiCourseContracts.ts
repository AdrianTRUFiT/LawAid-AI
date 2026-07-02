export type LawAidCourseStage =
  | "onboarding"
  | "trial"
  | "paid_pending"
  | "activated"
  | "complete";

export interface LawAidCourseSession {
  courseSessionId: string;
  userId: string;
  environmentId: "lawaidai";
  stage: LawAidCourseStage;
  onboardingComplete: boolean;
  trialStarted: boolean;
  paidPending: boolean;
  activated: boolean;
  completedAt?: string;
  soulSessionId: string;
  consequenceCheckpointId?: string;
}
