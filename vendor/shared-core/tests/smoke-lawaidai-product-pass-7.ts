import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const dataRoot = "D:/DEV/AIVA/shared-data/lawaidai-product-execution";
const closurePacketPath = path.join(dataRoot, "lawaidai-product-pass-7-final-closure-packet.json");
const pass6Path = path.join(dataRoot, "lawaidai-product-pass-6-fundtracker-activation-readiness.json");
const pass6PacketPath = path.join(dataRoot, "lawaidai-pass-6-fundtracker-activation-readiness-packet.json");

assert(fs.existsSync(closurePacketPath), "Closure packet exists");
assert(fs.existsSync(pass6Path), "Pass 6 report exists");
assert(fs.existsSync(pass6PacketPath), "Pass 6 readiness packet exists");

const closure = JSON.parse(fs.readFileSync(closurePacketPath, "utf8"));
const pass6 = JSON.parse(fs.readFileSync(pass6Path, "utf8"));
const pass6Packet = JSON.parse(fs.readFileSync(pass6PacketPath, "utf8"));

assert(closure.status === "LAWAIDAI_PRODUCT_EXECUTION_PASS_7_FINAL_CLOSURE_READY", "Pass 7 closure status is ready");
assert(closure.launchCandidateMeaning.structurallyReady === true, "Launch candidate is structurally ready");
assert(closure.launchCandidateMeaning.productionDeploymentApproved === false, "Closure does not approve production deployment");
assert(closure.launchCandidateMeaning.realPaymentWired === false, "Closure does not wire real payment");
assert(closure.launchCandidateMeaning.checkoutAuthorityCreated === false, "Closure does not create checkout authority");
assert(closure.launchCandidateMeaning.activationAuthorityCreated === false, "Closure does not create activation authority");
assert(closure.launchCandidateMeaning.activatedTransactionStateCreated === false, "Closure does not create Activated Transaction State");
assert(closure.launchCandidateMeaning.lawAidAIProductionUnlockCreated === false, "Closure does not create LawAidAI production unlock");

assert(closure.finalBoundary.launchCandidateIsNotProductionLaunch === true, "Launch candidate is not production launch");
assert(closure.finalBoundary.uiIsNotAuthority === true, "UI is not authority");
assert(closure.finalBoundary.paymentEventIsNotCommitmentTruth === true, "Payment event is not commitment truth");
assert(closure.finalBoundary.fundTrackerAIVerifiesCommitment === true, "FundTrackerAI verifies commitment");
assert(closure.finalBoundary.lawAidAIUnlockRequiresActivatedTransactionState === true, "LawAidAI unlock requires Activated Transaction State");
assert(closure.finalBoundary.noRealPaymentWiring === true, "No real payment wiring");
assert(closure.finalBoundary.noCheckoutAuthorityCreated === true, "No checkout authority created");
assert(closure.finalBoundary.noActivationAuthorityCreated === true, "No activation authority created");

assert(pass6.status === "LAWAIDAI_PRODUCT_EXECUTION_PASS_6_FUNDTRACKER_ACTIVATION_READINESS_READY", "Pass 6 remains ready");
assert(pass6Packet.status === "READINESS_ONLY", "Pass 6 packet remains readiness-only");

console.log("");
console.log("LAWAIDAI_PRODUCT_EXECUTION_PASS_7_SMOKE=PASS");









