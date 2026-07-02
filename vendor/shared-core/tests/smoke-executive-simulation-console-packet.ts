import {
  buildExecutiveClaimGuard,
  buildExecutiveDemoSteps,
  buildExecutiveSimulationConsolePacket,
  EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE
} from "../executive-simulation-console-packet";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.reviewOnly === true, "Doctrine locks review only");
assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.noRealFundsMoved === true, "Doctrine moves no real funds");
assert(EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE.boundary.notPublicLaunchApproval === true, "Doctrine blocks public launch approval");

const guard = buildExecutiveClaimGuard();

assert(guard.approvedClaims.includes("This is a sandbox simulation."), "Claim guard includes sandbox approved claim");
assert(guard.prohibitedClaims.includes("This processes live payments."), "Claim guard blocks live payment claim");
assert(guard.prohibitedClaims.includes("This moves real client funds."), "Claim guard blocks real funds claim");
assert(guard.requiredBoundaryLanguage.includes("No real funds move."), "Claim guard requires no-real-funds language");
assert(guard.boundary.createsNoPaymentAuthority === true, "Claim guard creates no payment authority");

const steps = buildExecutiveDemoSteps();

assert(steps.length === 7, "Executive demo has seven steps");
assert(steps[0]?.title === "Open the sandbox", "First step opens sandbox");
assert(steps.some((step) => step.title === "Financial institution sees governed transaction truth"), "Steps include FI governed truth reveal");
assert(steps.every((step) => step.boundaryReminder.length > 0), "Every step has boundary reminder");

const packet = buildExecutiveSimulationConsolePacket();

assert(packet.status === "EXECUTIVE_SIMULATION_CONSOLE_PACKET_READY", "Executive console packet ready");
assert(packet.audience === "FINANCIAL_INSTITUTION", "Audience is financial institution");
assert(packet.title === "One Matter. One Transaction. Three Perspectives. One Governed Truth.", "Title is correct");
assert(packet.demoSteps.length === 7, "Packet contains seven demo steps");
assert(packet.claimGuard.prohibitedClaims.includes("This settles money."), "Packet blocks settlement claim");
assert(packet.visibleArtifacts.includes("legal-studio-escrow-sandbox-dashboard.html"), "Packet includes dashboard artifact");
assert(packet.boundary.noLiveRailsCreated === true, "Packet creates no live rails");
assert(packet.boundary.noLivePaymentProcessingCreated === true, "Packet creates no payment processing");
assert(packet.boundary.noRealFundsMoved === true, "Packet moves no real funds");
assert(packet.boundary.noRealEscrowCreated === true, "Packet creates no real escrow");
assert(packet.boundary.noLegalAuthorityCreated === true, "Packet creates no legal authority");
assert(packet.boundary.noFinancialAuthorityCreated === true, "Packet creates no financial authority");
assert(packet.boundary.notPublicLaunchApproval === true, "Packet is not public launch approval");

console.log("");
console.log("EXECUTIVE_SIMULATION_CONSOLE_PACKET_SMOKE=PASS");
