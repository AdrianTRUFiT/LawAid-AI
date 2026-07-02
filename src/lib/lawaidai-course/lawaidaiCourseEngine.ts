import { makeId, nowIso } from "../soul256/soul256Utils";
import type { LawAidCourseSession, LawAidCourseStage } from "./lawaidaiCourseContracts";
import type { Soul256Session } from "../soul256/soul256Contracts";

export class LawAidCourseEngine {
  private readonly consequenceCheckpointSequence: number;

  constructor(consequenceCheckpointSequence = 192) {
    this.consequenceCheckpointSequence = consequenceCheckpointSequence;
  }

  createCourseSession(userId: string, soulSession: Soul256Session): LawAidCourseSession {
    return {
      courseSessionId: makeId("lac"),
      userId,
      environmentId: "lawaidai",
      stage: "onboarding",
      onboardingComplete: false,
      trialStarted: false,
      paidPending: false,
      activated: false,
      completedAt: undefined,
      soulSessionId: soulSession.sessionId,
      consequenceCheckpointId: undefined,
    };
  }

  syncStage(course: LawAidCourseSession, soulSequence: number, consequenceAuthorized: boolean): LawAidCourseSession {
    let stage: LawAidCourseStage = course.stage;

    if (soulSequence >= 1) {
      course.onboardingComplete = true;
      stage = "trial";
    }

    if (soulSequence >= 64) {
      course.trialStarted = true;
      stage = "trial";
    }

    if (soulSequence >= this.consequenceCheckpointSequence - 1) {
      course.paidPending = true;
      stage = "paid_pending";
    }

    if (consequenceAuthorized) {
      course.activated = true;
      stage = "activated";
      course.consequenceCheckpointId = `cp_${this.consequenceCheckpointSequence.toString().padStart(3, "0")}`;
    }

    if (soulSequence >= 256 && consequenceAuthorized) {
      stage = "complete";
      course.completedAt = nowIso();
    }

    course.stage = stage;
    return course;
  }
}
