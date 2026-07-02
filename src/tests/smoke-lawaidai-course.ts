import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";
import { LawAidCourseEngine } from "../lib/lawaidai-course/lawaidaiCourseEngine";

const defs = buildSoul256Definitions();
const soulEngine = new Soul256Engine(defs);
const courseEngine = new LawAidCourseEngine(192);

const soulSession = createSoul256Session({
  identityId: "user_demo_course_001",
  environmentId: "lawaidai",
  definitions: defs,
});

let course = courseEngine.createCourseSession("user_demo_course_001", soulSession);

// Advance through full chain and keep course stage synced.
for (const def of defs) {
  const result = soulEngine.advance(soulSession, {
    checkpointId: def.checkpointId,
    carrierId: soulSession.realCarrierId,
    routeId: soulSession.realRouteId,
  });

  if (!result.ok && result.reasonCode !== "ALREADY_PASSED") {
    console.error("LAW_AID_COURSE_FAILED_AT=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }

  const consequence = soulEngine.assertConsequenceAuthorized(soulSession);
  course = courseEngine.syncStage(course, def.sequence, consequence.ok);
}

const reconciliation = soulEngine.reconcile(soulSession);
if (!reconciliation.ok) {
  console.error("LAW_AID_COURSE_RECONCILIATION_FAILED");
  console.error(JSON.stringify(reconciliation, null, 2));
  process.exit(1);
}

if (!course.onboardingComplete) {
  console.error("LAW_AID_COURSE_ONBOARDING_NOT_COMPLETE");
  process.exit(1);
}

if (!course.trialStarted) {
  console.error("LAW_AID_COURSE_TRIAL_NOT_STARTED");
  process.exit(1);
}

if (!course.paidPending) {
  console.error("LAW_AID_COURSE_PAID_PENDING_NOT_REACHED");
  process.exit(1);
}

if (!course.activated) {
  console.error("LAW_AID_COURSE_NOT_ACTIVATED");
  process.exit(1);
}

if (course.stage !== "complete") {
  console.error("LAW_AID_COURSE_NOT_COMPLETE");
  console.error("ACTUAL_STAGE=", course.stage);
  process.exit(1);
}

console.log("LAW_AID_COURSE_STATUS=PASS");
console.log("COURSE_SESSION_ID=", course.courseSessionId);
console.log("SOUL_SESSION_ID=", course.soulSessionId);
console.log("FINAL_STAGE=", course.stage);
console.log("ONBOARDING_COMPLETE=", course.onboardingComplete);
console.log("TRIAL_STARTED=", course.trialStarted);
console.log("PAID_PENDING=", course.paidPending);
console.log("ACTIVATED=", course.activated);
console.log("CONSEQUENCE_CHECKPOINT_ID=", course.consequenceCheckpointId);
console.log("SOUL_COMPLETE=", soulSession.complete);
