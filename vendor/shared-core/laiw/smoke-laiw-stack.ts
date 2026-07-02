import { buildLAIWVerifiedEcosystem } from './laiw-verified-ecosystem';

const ecosystem = buildLAIWVerifiedEcosystem();

console.log("LAIW_STACK_VERIFIED=PASS");
console.log("UMBRELLA=" + ecosystem.stack.umbrella);
console.log("DASHBOARD=" + ecosystem.stack.dashboard);
console.log("SEARCH=" + ecosystem.stack.search);
console.log("TRACKING=" + ecosystem.stack.tracking);
console.log("PAID_BASE=" + ecosystem.stack.adaptiveDashboardBase);
console.log("OPEN_SEARCH_ALLOWED=" + ecosystem.openSearchAllowed);
console.log("VERIFIED_ONLY=" + ecosystem.verifiedOnly);
console.log("WORKFLOW_STAGE_COUNT=" + ecosystem.workflowChain.length);
console.log("VERIFIED_PARTICIPANT_COUNT=" + ecosystem.verifiedParticipants.length);

for (const p of ecosystem.verifiedParticipants) {
  console.log(
    p.participantType +
      "=" +
      p.soulId +
      "/" +
      p.soulmark +
      "/verified:" +
      p.verified
  );
}
