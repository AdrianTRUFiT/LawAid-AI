import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const activeRepo = "D:/DEV/PROJECTS/LawAidAI";
const dataRoot = "D:/DEV/AIVA/shared-data/lawaidai-product-execution";
const productRoot = path.join(activeRepo, "src", "lawaidai-product-execution");

const files = {
  policy: path.join(productRoot, "lawaidaiLaunchUxPolicy.ts"),
  viewModel: path.join(productRoot, "lawaidaiLaunchUxViewModel.ts"),
  boundaryCopy: path.join(productRoot, "lawaidaiLaunchBoundaryCopy.ts"),
  panel: path.join(productRoot, "LawAidAILaunchPolicyPanel.tsx"),
  publicPolicy: path.join(activeRepo, "public", "lawaidai", "product-execution-boundary.json"),
  readinessPacket: path.join(dataRoot, "lawaidai-pass-6-fundtracker-activation-readiness-packet.json")
};

for (const [label, file] of Object.entries(files)) {
  assert(fs.existsSync(file), `${label} exists`);
}

const policy = fs.readFileSync(files.policy, "utf8");
const viewModel = fs.readFileSync(files.viewModel, "utf8");
const boundaryCopy = fs.readFileSync(files.boundaryCopy, "utf8");
const panel = fs.readFileSync(files.panel, "utf8");
const publicPolicy = JSON.parse(fs.readFileSync(files.publicPolicy, "utf8"));
const readinessPacket = JSON.parse(fs.readFileSync(files.readinessPacket, "utf8"));

assert(policy.includes("SIMULATED_UNTIL_FUNDTRACKERAI"), "Commercial mode remains simulated until FundTrackerAI");
assert(policy.includes("DISPLAY_ONLY_UNTIL_ACTIVATED_TRANSACTION_STATE"), "Activation mode remains display-only until Activated Transaction State");
assert(policy.includes("paymentEventIsNotCommitmentTruth"), "Payment event is not commitment truth");
assert(policy.includes("fundTrackerAIVerifiesCommitment"), "FundTrackerAI verifies commitment");
assert(policy.includes("lawAidAIUnlockRequiresActivatedTransactionState"), "LawAidAI unlock requires Activated Transaction State");

assert(viewModel.includes("Payment event is not commitment truth."), "View model preserves payment-not-truth");
assert(viewModel.includes("FundTrackerAI verifies commitment."), "View model preserves FundTrackerAI boundary");
assert(viewModel.includes("LawAidAI unlock/output requires Activated Transaction State."), "View model preserves unlock boundary");

assert(boundaryCopy.includes("Activation display is informational only"), "Boundary copy preserves activation display limitation");
assert(boundaryCopy.includes("FundTrackerAI verification"), "Boundary copy preserves FundTrackerAI verification");

assert(panel.includes("wireLaterSurfaces"), "Panel renders wire-later payment/revenue surfaces");
assert(publicPolicy.implementationBoundary.realPaymentWired === false, "Public boundary confirms no real payment wired");
assert(publicPolicy.implementationBoundary.checkoutAuthorityCreated === false, "Public boundary confirms no checkout authority");
assert(publicPolicy.implementationBoundary.activationAuthorityCreated === false, "Public boundary confirms no activation authority");
assert(publicPolicy.implementationBoundary.uiTreatedAsAuthority === false, "Public boundary confirms UI not authority");

assert(readinessPacket.status === "READINESS_ONLY", "Readiness packet is readiness-only");
assert(readinessPacket.boundaryLock.paymentEventIsNotCommitmentTruth === true, "Readiness packet preserves payment-not-truth");
assert(readinessPacket.boundaryLock.fundTrackerAIVerifiesCommitment === true, "Readiness packet preserves FundTrackerAI verification");
assert(readinessPacket.boundaryLock.activatedTransactionStateRequiredForUnlock === true, "Readiness packet preserves Activated Transaction State requirement");
assert(readinessPacket.boundaryLock.noRealPaymentWiring === true, "Readiness packet confirms no real payment wiring");
assert(readinessPacket.boundaryLock.noCheckoutAuthorityCreated === true, "Readiness packet confirms no checkout authority");
assert(readinessPacket.boundaryLock.noActivationAuthorityCreated === true, "Readiness packet confirms no activation authority");

console.log("");
console.log("LAWAIDAI_PRODUCT_EXECUTION_PASS_6_SMOKE=PASS");









