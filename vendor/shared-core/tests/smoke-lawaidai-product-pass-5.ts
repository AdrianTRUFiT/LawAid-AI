import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const activeRepo = "D:/DEV/PROJECTS/LawAidAI";
const productRoot = path.join(activeRepo, "src", "lawaidai-product-execution");

const files = {
  policy: path.join(productRoot, "lawaidaiLaunchUxPolicy.ts"),
  viewModel: path.join(productRoot, "lawaidaiLaunchUxViewModel.ts"),
  boundaryCopy: path.join(productRoot, "lawaidaiLaunchBoundaryCopy.ts"),
  panel: path.join(productRoot, "LawAidAILaunchPolicyPanel.tsx"),
  index: path.join(productRoot, "index.ts"),
  publicPolicy: path.join(activeRepo, "public", "lawaidai", "product-execution-boundary.json")
};

for (const [label, file] of Object.entries(files)) {
  assert(fs.existsSync(file), `${label} exists`);
}

const policy = fs.readFileSync(files.policy, "utf8");
const viewModel = fs.readFileSync(files.viewModel, "utf8");
const boundaryCopy = fs.readFileSync(files.boundaryCopy, "utf8");
const panel = fs.readFileSync(files.panel, "utf8");

assert(policy.includes("entry-dashboard"), "Entry/dashboard surface exists");
assert(policy.includes("workspace-case-packet"), "Workspace/case packet surface exists");
assert(policy.includes("activation-status"), "Activation status surface exists");
assert(policy.includes("export-readiness"), "Export readiness surface exists");
assert(policy.includes("product-output-confirmation"), "Product output confirmation surface exists");
assert(policy.includes("ledger-record-visibility"), "Ledger record visibility surface exists");

assert(policy.includes("payment-revenue-surfaces") && policy.includes("WIRE_LATER"), "Payment/revenue surfaces are wire-later");
assert(policy.includes("placeholder-demo-surfaces") && policy.includes("HIDE"), "Placeholder/demo surfaces are hidden");

assert(viewModel.includes("UI is not authority."), "View model preserves UI-not-authority");
assert(viewModel.includes("Payment event is not commitment truth."), "View model preserves payment-not-truth");
assert(viewModel.includes("FundTrackerAI verifies commitment."), "View model preserves FundTrackerAI boundary");
assert(viewModel.includes("LawAidAI remains client-side management software."), "View model preserves client-side management boundary");

assert(boundaryCopy.includes("not a lawyer"), "Boundary copy preserves non-lawyer position");
assert(boundaryCopy.includes("Activated Transaction State"), "Boundary copy preserves Activated Transaction State boundary");
assert(boundaryCopy.includes("does not certify evidence"), "Boundary copy preserves export/evidence boundary");

assert(panel.includes("data-lawaidai-product-execution"), "Panel carries product execution data marker");
assert(panel.includes("wireLaterSurfaces"), "Panel renders wire-later surfaces");
assert(panel.includes("boundaryMessages"), "Panel renders boundary messages");

console.log("");
console.log("LAWAIDAI_PRODUCT_EXECUTION_PASS_5_SMOKE=PASS");









