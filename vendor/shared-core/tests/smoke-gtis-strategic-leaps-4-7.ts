import {
  evaluateAuthorityCommand,
  AUTHORITY_LATTICE_LOCK_DOCTRINE
} from "../authority-lattice-lock";
import {
  buildTransactionTruthWarRoomDeck,
  TRANSACTION_TRUTH_WAR_ROOM_DOCTRINE
} from "../transaction-truth-war-room";
import {
  appendSovereignAuditEvent,
  verifySovereignAuditSpine,
  SOVEREIGN_AUDIT_SPINE_DOCTRINE
} from "../sovereign-audit-spine";
import {
  buildGTISLaunchIntegrationPacket,
  GTIS_LAUNCH_PACKET_DOCTRINE
} from "../gtis-launch-integration-packet";

type SovereignAuditEvent = Awaited<ReturnType<typeof appendSovereignAuditEvent>>;

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

async function main() {
  assert(AUTHORITY_LATTICE_LOCK_DOCTRINE.boundary.noSurfaceToTruthPromotion === true, "Leap 4 doctrine locks surface-to-truth refusal");
  assert(TRANSACTION_TRUTH_WAR_ROOM_DOCTRINE.boundary.visibilityIsNotAuthority === true, "Leap 5 doctrine locks visibility is not authority");
  assert(SOVEREIGN_AUDIT_SPINE_DOCTRINE.boundary.auditVerifierIsReadOnly === true, "Leap 6 doctrine locks read-only audit verifier");
  assert(GTIS_LAUNCH_PACKET_DOCTRINE.boundary.packetIsReviewEvidenceNotAuthority === true, "Leap 7 doctrine locks packet as review evidence");

  const paiSafeTruthAttempt = evaluateAuthorityCommand({
    commandId: "cmd_001",
    actor: "PAI_SAFE",
    command: "CREATE_TRANSACTION_TRUTH",
    transactionRef: "txn_gtis_001",
    sourceRef: "pai_safe_surface_001",
    requiredArtifacts: []
  });

  assert(paiSafeTruthAttempt.status === "AUTHORITY_COMMAND_REFUSED", "PAI-SAFE truth command refused");
  assert(paiSafeTruthAttempt.refusalReasons.includes("NON_FUNDTRACKER_TRUTH_COMMAND_REFUSED"), "Non-FundTracker truth refusal present");
  assert(paiSafeTruthAttempt.refusalReasons.includes("DISPLAY_ONLY_BOUNDARY_ENFORCED"), "PAI-SAFE display-only boundary enforced");

  const finTechionActivationAttempt = evaluateAuthorityCommand({
    commandId: "cmd_002",
    actor: "FINTECHION_AI",
    command: "CREATE_ACTIVATED_TRANSACTION_STATE",
    transactionRef: "txn_gtis_001",
    sourceRef: "fintechionai_oversight_001",
    requiredArtifacts: ["FundTrackerDecision", "VerifiedOpportunity"]
  });

  assert(finTechionActivationAttempt.status === "AUTHORITY_COMMAND_REFUSED", "FinTechionAI activation command refused");
  assert(finTechionActivationAttempt.refusalReasons.includes("NON_FUNDTRACKER_TRUTH_COMMAND_REFUSED"), "FinTechionAI cannot create truth");
  assert(finTechionActivationAttempt.refusalReasons.includes("OVERSIGHT_ONLY_BOUNDARY_ENFORCED"), "FinTechionAI oversight-only boundary enforced");

  const fundTrackerActivation = evaluateAuthorityCommand({
    commandId: "cmd_003",
    actor: "FUNDTRACKER_AI",
    command: "CREATE_ACTIVATED_TRANSACTION_STATE",
    transactionRef: "txn_gtis_001",
    sourceRef: "fundtracker_decision_001",
    requiredArtifacts: ["FundTrackerDecision", "VerifiedOpportunity"]
  });

  assert(fundTrackerActivation.status === "AUTHORITY_COMMAND_ALLOWED", "FundTrackerAI activation command allowed only with required artifacts");
  assert(fundTrackerActivation.allowed === true, "FundTrackerAI allowed true");

  const surfacePromotion = evaluateAuthorityCommand({
    commandId: "cmd_004",
    actor: "HUMAN_REVIEW",
    command: "PROMOTE_SURFACE_TO_TRUTH",
    transactionRef: "txn_gtis_001",
    sourceRef: "review_receipt_001",
    requiredArtifacts: ["ReviewReceipt"]
  });

  assert(surfacePromotion.status === "AUTHORITY_COMMAND_REFUSED", "Surface-to-truth promotion refused");
  assert(surfacePromotion.refusalReasons.includes("SURFACE_TO_TRUTH_PROMOTION_REFUSED"), "Surface promotion refusal present");

  const warRoom = buildTransactionTruthWarRoomDeck({
    transactionRef: "txn_gtis_001",
    authorityDecisions: [paiSafeTruthAttempt, finTechionActivationAttempt, fundTrackerActivation, surfacePromotion],
    tripwireRoute: "CRITICAL_ESCALATION",
    fraudPressureActive: true,
    proofHealthClean: true,
    launchMode: "LAUNCH_REVIEW"
  });

  assert(warRoom.route === "ESCALATE", "War Room escalates critical pressure");
  assert(warRoom.blockedCommands.length === 3, "War Room records three blocked commands");
  assert(warRoom.allowedCommands.length === 1, "War Room records one allowed command");
  assert(warRoom.boundary.warRoomIsNotTransactionTruth === true, "War Room is not transaction truth");
  assert(warRoom.boundary.operatorVisibilityIsNotAuthority === true, "War Room visibility is not authority");

  const ledger: SovereignAuditEvent[] = [];
  const event1 = await appendSovereignAuditEvent(ledger, "AUTHORITY_COMMAND", "txn_gtis_001", paiSafeTruthAttempt, "2026-04-28T16:00:00.000Z");
  ledger.push(event1);
  const event2 = await appendSovereignAuditEvent(ledger, "WAR_ROOM_DECK", "txn_gtis_001", warRoom, "2026-04-28T16:00:01.000Z");
  ledger.push(event2);
  const event3 = await appendSovereignAuditEvent(ledger, "LAUNCH_PACKET", "txn_gtis_001", { checkpoint: "prelaunch" }, "2026-04-28T16:00:02.000Z");
  ledger.push(event3);

  const auditVerify = await verifySovereignAuditSpine(ledger);

  assert(auditVerify.verified === true, "Sovereign audit spine verifies clean chain");
  assert(auditVerify.inspectedEvents === 3, "Audit verifier inspected three events");
  assert(auditVerify.boundary.verifierIsReadOnly === true, "Audit verifier is read only");

  const tamperedLedger = ledger.map((event) => ({ ...event }));
  tamperedLedger[1] = {
    ...tamperedLedger[1]!,
    payloadHash: "0".repeat(64)
  };

  const tamperVerify = await verifySovereignAuditSpine(tamperedLedger);

  assert(tamperVerify.verified === false, "Sovereign audit spine detects tamper");
  assert(tamperVerify.refusalReasons.includes("EVENT_HASH_MISMATCH"), "Audit tamper mismatch detected");

  const launchPacket = buildGTISLaunchIntegrationPacket({
    leap1Ready: true,
    leap2Ready: true,
    leap3Ready: true,
    leap4Ready: true,
    leap5Ready: true,
    leap6Ready: true,
    auditVerified: auditVerify.verified,
    noPaymentAuthorityCreated: true,
    noTransactionTruthCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true
  });

  assert(launchPacket.status === "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY", "GTIS launch candidate ready");
  assert(launchPacket.ready === true, "Launch packet ready true");
  assert(launchPacket.missing.length === 0, "Launch packet has no missing checks");
  assert(launchPacket.boundary.launchPacketIsNotPaymentAuthority === true, "Launch packet is not payment authority");
  assert(launchPacket.boundary.launchPacketIsNotTransactionTruth === true, "Launch packet is not transaction truth");
  assert(launchPacket.boundary.launchPacketRequiresHumanAcceptance === true, "Launch packet requires human acceptance");

  const blockedPacket = buildGTISLaunchIntegrationPacket({
    leap1Ready: true,
    leap2Ready: true,
    leap3Ready: true,
    leap4Ready: true,
    leap5Ready: true,
    leap6Ready: false,
    auditVerified: false,
    noPaymentAuthorityCreated: true,
    noTransactionTruthCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true
  });

  assert(blockedPacket.status === "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_BLOCKED", "Blocked launch packet refuses incomplete readiness");
  assert(blockedPacket.ready === false, "Blocked packet ready false");
  assert(blockedPacket.missing.includes("Strategic Leap 6 — Sovereign Audit Spine"), "Blocked packet identifies missing Leap 6");

  const allBoundariesHold =
    paiSafeTruthAttempt.boundary.authorityLatticeIsNotPaymentAuthority === true &&
    warRoom.boundary.warRoomIsNotPaymentAuthority === true &&
    auditVerify.boundary.auditSpineIsNotPaymentAuthority === true &&
    launchPacket.boundary.launchPacketIsNotPaymentAuthority === true &&
    launchPacket.boundary.launchPacketIsNotRuntimeActivation === true;

  assert(allBoundariesHold === true, "All Leap 4-7 boundaries preserve non-authority state");

  console.log("");
  console.log("GTIS_STRATEGIC_LEAPS_4_7_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});


