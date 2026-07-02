import fs from "fs";
import path from "path";
import {
  createLawAidAILaunchUxViewModel,
  getHiddenLawAidAISurfaces,
  getLawAidAILaunchBoundaryCopy,
  getVisibleLawAidAILaunchSurfaces,
  getWireLaterLawAidAISurfaces,
  lawaidaiProductExecutionPolicy
} from "../../../PROJECTS/LawAidAI/src/lawaidai-product-execution/index";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const activeRepo = "D:/DEV/PROJECTS/LawAidAI";
const forbiddenRepo = "F:/DEV/PROJECTS/LawAidAI";
const publicPolicyPath = path.join(activeRepo, "public", "lawaidai", "product-execution-boundary.json");

assert(!activeRepo.startsWith("F:/"), "Active repo is not F drive");
assert(forbiddenRepo.startsWith("F:/"), "F drive remains forbidden backup path");
assert(fs.existsSync(publicPolicyPath), "Public product execution boundary JSON exists");

assert(
  lawaidaiProductExecutionPolicy.status === "LAWAIDAI_PRODUCT_EXECUTION_PASS_3_IMPLEMENTATION_READY",
  "Pass 3 policy status is ready"
);

assert(
  lawaidaiProductExecutionPolicy.boundary.policyIsNotRuntimeAuthority === true,
  "Policy is not runtime authority"
);

assert(
  lawaidaiProductExecutionPolicy.boundary.policyIsNotPaymentTruth === true,
  "Policy is not payment truth"
);

assert(
  lawaidaiProductExecutionPolicy.boundary.policyIsNotActivation === true,
  "Policy is not activation"
);

assert(
  lawaidaiProductExecutionPolicy.boundary.policyDoesNotDeleteFiles === true,
  "Policy does not delete files"
);

const visible = getVisibleLawAidAILaunchSurfaces();
const hidden = getHiddenLawAidAISurfaces();
const wireLater = getWireLaterLawAidAISurfaces();

assert(visible.length >= 5, "Launch-visible surfaces are defined");

assert(
  hidden.some((surface: any) => surface.surfaceId === "placeholder-demo-surfaces"),
  "Placeholder/demo surfaces are hidden"
);

assert(
  wireLater.some((surface: any) => surface.surfaceId === "payment-revenue-surfaces"),
  "Payment/revenue surfaces are wired later"
);

const viewModel = createLawAidAILaunchUxViewModel();

assert(viewModel.status === "READY", "Launch UX view model is ready");

assert(
  viewModel.boundaryMessages.includes("UI is not authority."),
  "View model preserves UI-not-authority boundary"
);

assert(
  viewModel.boundaryMessages.includes("Payment event is not commitment truth."),
  "View model preserves payment-not-truth boundary"
);

assert(
  viewModel.boundaryMessages.includes("FundTrackerAI verifies commitment."),
  "View model preserves FundTrackerAI commitment boundary"
);

const copy = getLawAidAILaunchBoundaryCopy();

assert(
  copy.noLegalAdvice.includes("not a lawyer"),
  "Boundary copy preserves LawAidAI non-lawyer position"
);

assert(
  copy.simulatedPayment.includes("FundTrackerAI"),
  "Boundary copy preserves simulated payment label"
);

assert(
  copy.activationDisplay.includes("Activated Transaction State"),
  "Boundary copy preserves activation state boundary"
);

console.log("");
console.log("LAWAIDAI_PRODUCT_EXECUTION_PASS_3_SMOKE=PASS");









