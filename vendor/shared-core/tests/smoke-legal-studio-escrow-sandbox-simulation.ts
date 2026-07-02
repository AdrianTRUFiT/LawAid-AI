import {
  buildLegalStudioEscrowSandboxSimulation,
  LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE
} from "../legal-studio-escrow-sandbox-simulation";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.persistentSandboxIndicatorRequired === true, "Doctrine requires persistent sandbox indicator");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noRealFundsMoved === true, "Doctrine moves no real funds");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noRealEscrowCreated === true, "Doctrine creates no real escrow");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noLegalAuthorityCreated === true, "Doctrine creates no legal authority");
assert(LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE.boundary.noFinancialAuthorityCreated === true, "Doctrine creates no financial authority");

const simulation = buildLegalStudioEscrowSandboxSimulation();

assert(simulation.status === "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_READY", "Simulation ready");
assert(simulation.sharedIdentity.matterId === "LA-2026-0012", "Shared matter ID present");
assert(simulation.sharedIdentity.transactionId === "TRUTH-00045", "Shared transaction ID present");
assert(simulation.sharedIdentity.environment === "SANDBOX", "Shared environment sandbox");

assert(simulation.sandboxIndicator.visibleOnDashboardHeader === true, "Sandbox indicator visible on dashboard header");
assert(simulation.sandboxIndicator.visibleOnClientView === true, "Sandbox indicator visible on client view");
assert(simulation.sandboxIndicator.visibleOnLawStudioView === true, "Sandbox indicator visible on law studio view");
assert(simulation.sandboxIndicator.visibleOnFinancialInstitutionView === true, "Sandbox indicator visible on FI view");

assert(simulation.clientView.matterId === simulation.sharedIdentity.matterId, "Client view uses same matter ID");
assert(simulation.lawStudioView.matterId === simulation.sharedIdentity.matterId, "Law studio view uses same matter ID");
assert(simulation.financialInstitutionView.matterId === simulation.sharedIdentity.matterId, "FI view uses same matter ID");

assert(simulation.clientView.transactionId === simulation.sharedIdentity.transactionId, "Client view uses same transaction ID");
assert(simulation.lawStudioView.transactionId === simulation.sharedIdentity.transactionId, "Law studio view uses same transaction ID");
assert(simulation.financialInstitutionView.transactionId === simulation.sharedIdentity.transactionId, "FI view uses same transaction ID");

assert(simulation.movementTimeline.length === 8, "Movement timeline has eight entries");
assert(simulation.movementTimeline[0]?.from === "CLIENT", "Timeline starts with client");
assert(simulation.movementTimeline[3]?.to === "FINANCIAL_INSTITUTION", "Governed request moves to FI");
assert(simulation.movementTimeline.every((entry) => entry.boundary.createsNoRealFundsMovement === true), "Timeline creates no real funds movement");

assert(simulation.sandboxLedger.length === 4, "Sandbox ledger has four states");
assert(simulation.sandboxLedger[0]?.state === "HOLD_REQUESTED_SANDBOX", "Ledger starts with sandbox hold requested");
assert(simulation.sandboxLedger[1]?.state === "HOLD_PLACED_SANDBOX", "Ledger places sandbox hold");
assert(simulation.sandboxLedger[2]?.state === "RELEASE_CONDITION_MET_SANDBOX", "Ledger verifies release condition");
assert(simulation.sandboxLedger[3]?.state === "RELEASE_EXECUTED_SANDBOX", "Ledger executes sandbox release");
assert(simulation.sandboxLedger.every((entry) => entry.simulatedOnly === true), "Ledger entries are simulated only");
assert(simulation.sandboxLedger.every((entry) => entry.fundsActuallyMoved === false), "Ledger moves no real funds");
assert(simulation.sandboxLedger.every((entry) => entry.custodyTransferred === false), "Ledger transfers no custody");

assert(simulation.evidenceBundle.clientApprovalRef === "client_approval_demo_001", "Evidence includes client approval");
assert(simulation.evidenceBundle.milestoneProofRef === "milestone_delivery_demo_001", "Evidence includes milestone proof");
assert(simulation.evidenceBundle.releaseDecisionRef === "release_decision_demo_001", "Evidence includes release decision");
assert(simulation.evidenceBundle.boundary.evidenceCreatesNoLegalAuthority === true, "Evidence creates no legal authority");

const noLiveLeak =
  simulation.boundary.noLiveRailsCreated === true &&
  simulation.boundary.noLivePaymentProcessingCreated === true &&
  simulation.boundary.noRealFundsMoved === true &&
  simulation.boundary.noRealEscrowCreated === true &&
  simulation.boundary.noLiveSettlementCreated === true &&
  simulation.boundary.noCustodyTransferCreated === true &&
  simulation.boundary.noRuntimeActivationCreated === true &&
  simulation.boundary.noLegalAuthorityCreated === true &&
  simulation.boundary.noFinancialAuthorityCreated === true &&
  simulation.boundary.notPublicLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from legal studio escrow sandbox simulation");

console.log("");
console.log("LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_SMOKE=PASS");
