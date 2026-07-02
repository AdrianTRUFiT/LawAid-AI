import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const activeRepo = "D:/DEV/PROJECTS/LawAidAI";

const runtimeEntryCandidates = [
  path.join(activeRepo, "src", "main.tsx"),
  path.join(activeRepo, "src", "main.jsx"),
  path.join(activeRepo, "src", "index.tsx"),
  path.join(activeRepo, "src", "index.jsx")
];

const appCandidates = [
  path.join(activeRepo, "src", "App.tsx"),
  path.join(activeRepo, "src", "App.jsx"),
  path.join(activeRepo, "src", "app.tsx"),
  path.join(activeRepo, "src", "App.ts")
];

const runtimeEntryPath = runtimeEntryCandidates.find((candidate) => fs.existsSync(candidate));
const appPath = appCandidates.find((candidate) => fs.existsSync(candidate));

const componentPath = path.join(activeRepo, "src", "lawaidai-product-execution", "LawAidAILaunchPolicyPanel.tsx");
const indexPath = path.join(activeRepo, "src", "lawaidai-product-execution", "index.ts");
const publicPolicyPath = path.join(activeRepo, "public", "lawaidai", "product-execution-boundary.json");

assert(Boolean(runtimeEntryPath), "Runtime entry exists");
assert(Boolean(appPath), "App entry exists");
assert(fs.existsSync(componentPath), "Launch policy panel component exists");
assert(fs.existsSync(indexPath), "Product execution barrel index exists");
assert(fs.existsSync(publicPolicyPath), "Public product execution boundary JSON exists");

const runtimeEntryText = fs.readFileSync(runtimeEntryPath!, "utf8");
const componentText = fs.readFileSync(componentPath, "utf8");
const indexText = fs.readFileSync(indexPath, "utf8");

assert(runtimeEntryText.includes("LawAidAILaunchPolicyPanel"), "Runtime entry imports/renders launch policy panel");
assert(runtimeEntryText.includes("<LawAidAILaunchPolicyPanel"), "Runtime entry renders launch policy panel");
assert(componentText.includes("data-lawaidai-product-execution"), "Panel carries product execution data marker");
assert(componentText.includes("boundaryMessages"), "Panel preserves UI authority boundary");
assert(componentText.includes("wireLaterSurfaces"), "Panel preserves wire-later surface boundary");
assert(indexText.includes("LawAidAILaunchPolicyPanel"), "Barrel export includes launch policy panel");

console.log("");
console.log("LAWAIDAI_PRODUCT_EXECUTION_PASS_4_SMOKE=PASS");









