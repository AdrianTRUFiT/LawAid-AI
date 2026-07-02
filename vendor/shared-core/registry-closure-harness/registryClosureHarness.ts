import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const AIVA_ROOT = "D:/DEV/AIVA";
const REPORTS_ROOT = path.join(AIVA_ROOT, "homebase", "REPORTS");
const LEDGER_ROOT = path.join(AIVA_ROOT, "shared-data", "registry-closure-harness");
const LEDGER_PATH = path.join(LEDGER_ROOT, "registry-closure-ledger.jsonl");

type RegistryClosureItem = {
  registryId: string;
  label: string;
  moduleRoot: string;
  smokeTest: string;
  reportPath: string;
  ledgerPath: string;
  expectedStatus: string;
  boundary: string[];
};

type RegistryClosureResult = {
  registryId: string;
  label: string;
  moduleExists: boolean;
  smokePassed: boolean;
  reportExists: boolean;
  ledgerExists: boolean;
  expectedStatusFound: boolean;
  blockedReasons: string[];
};

function exists(filePath: string) {
  return fs.existsSync(filePath);
}

function read(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function runSmoke(smokePath: string) {
  try {
    const output = execSync(`npx tsx "${smokePath}"`, {
      cwd: AIVA_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { passed: true, output };
  } catch (error: any) {
    return {
      passed: false,
      output: String(error.stdout || "") + "\n" + String(error.stderr || error.message || error)
    };
  }
}

function appendLedger(value: unknown) {
  fs.mkdirSync(LEDGER_ROOT, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

const registries: RegistryClosureItem[] = [
  {
    registryId: "strategic-opportunity-registry",
    label: "Strategic Opportunity Registry",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "strategic-opportunity-registry"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-strategic-opportunity-registry.ts"),
    reportPath: path.join(REPORTS_ROOT, "strategic-opportunity-registry.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "strategic-opportunity-registry", "strategic-opportunity-ledger.jsonl"),
    expectedStatus: "STRATEGIC_OPPORTUNITY_REGISTRY_READY",
    boundary: [
      "Registry entry is not doctrine.",
      "Registry entry is not build authorization.",
      "Registry entry is not product commitment.",
      "Signal is preserved unless promoted by authorized decision."
    ]
  },
  {
    registryId: "slim-package-manifest",
    label: "SLiM Package Manifest",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "slim-package-manifest"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-slim-package-manifest.ts"),
    reportPath: path.join(REPORTS_ROOT, "slim-package-manifest.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "slim-package-manifest", "slim-package-manifest-ledger.jsonl"),
    expectedStatus: "SLIM_PACKAGE_MANIFEST_READY",
    boundary: [
      "Package manifest is not doctrine.",
      "Package manifest is not deployment approval.",
      "Package manifest is not release authorization.",
      "Package manifest is not activation state."
    ]
  },
  {
    registryId: "aios-workflow-registry",
    label: "AIOS Workflow Registry",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "aios-workflow-registry"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-aios-workflow-registry.ts"),
    reportPath: path.join(REPORTS_ROOT, "aios-workflow-registry.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "aios-workflow-registry", "aios-workflow-registry-ledger.jsonl"),
    expectedStatus: "AIOS_WORKFLOW_REGISTRY_READY",
    boundary: [
      "Workflow registry is not execution.",
      "Workflow registry is not activation.",
      "Workflow registry is not authority.",
      "Workflow registration does not mutate runtime."
    ]
  },
  {
    registryId: "hod-hardware-profile-registry",
    label: "HOD Hardware Profile Registry",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "hod-hardware-profile-registry"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-hod-hardware-profile-registry.ts"),
    reportPath: path.join(REPORTS_ROOT, "hod-hardware-profile-registry.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "hod-hardware-profile-registry", "hod-hardware-profile-registry-ledger.jsonl"),
    expectedStatus: "HOD_HARDWARE_PROFILE_REGISTRY_READY",
    boundary: [
      "Hardware profile is not authority.",
      "Hardware profile is not identity.",
      "Hardware profile is not deployment approval.",
      "Device presence does not create permission."
    ]
  },
  {
    registryId: "partner-adapter-registry",
    label: "Partner Adapter Registry",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "partner-adapter-registry"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-partner-adapter-registry.ts"),
    reportPath: path.join(REPORTS_ROOT, "partner-adapter-registry.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "partner-adapter-registry", "partner-adapter-registry-ledger.jsonl"),
    expectedStatus: "PARTNER_ADAPTER_REGISTRY_READY",
    boundary: [
      "Partner adapter is not authority.",
      "Partner adapter is not trust proof.",
      "Partner adapter is not transaction truth.",
      "Partner output requires governed verification."
    ]
  },
  {
    registryId: "product-bundle-pricing-registry",
    label: "Product Bundle Pricing Registry",
    moduleRoot: path.join(AIVA_ROOT, "shared-core", "product-bundle-pricing-registry"),
    smokeTest: path.join(AIVA_ROOT, "shared-core", "tests", "smoke-product-bundle-pricing-registry.ts"),
    reportPath: path.join(REPORTS_ROOT, "product-bundle-pricing-registry.md"),
    ledgerPath: path.join(AIVA_ROOT, "shared-data", "product-bundle-pricing-registry", "product-bundle-pricing-registry-ledger.jsonl"),
    expectedStatus: "PRODUCT_BUNDLE_PRICING_REGISTRY_READY",
    boundary: [
      "Pricing record is not transaction truth.",
      "Pricing record is not payment commitment.",
      "Pricing record is not checkout approval.",
      "FundTrackerAI verification is required for commitment."
    ]
  }
];

const results: RegistryClosureResult[] = [];

for (const registry of registries) {
  const blockedReasons: string[] = [];
  const moduleExists = exists(registry.moduleRoot);
  const reportExists = exists(registry.reportPath);
  const ledgerExists = exists(registry.ledgerPath);
  const smokeFileExists = exists(registry.smokeTest);

  if (!moduleExists) blockedReasons.push("MODULE_ROOT_MISSING");
  if (!reportExists) blockedReasons.push("REPORT_MISSING");
  if (!ledgerExists) blockedReasons.push("LEDGER_MISSING");
  if (!smokeFileExists) blockedReasons.push("SMOKE_TEST_MISSING");

  let smokePassed = false;
  let smokeOutput = "";

  if (smokeFileExists) {
    const smoke = runSmoke(registry.smokeTest);
    smokePassed = smoke.passed;
    smokeOutput = smoke.output;
    if (!smokePassed) blockedReasons.push("SMOKE_FAILED");
  }

  const expectedStatusFound =
    reportExists && read(registry.reportPath).includes(registry.expectedStatus);

  if (!expectedStatusFound) blockedReasons.push("EXPECTED_STATUS_NOT_FOUND_IN_REPORT");

  const result: RegistryClosureResult = {
    registryId: registry.registryId,
    label: registry.label,
    moduleExists,
    smokePassed,
    reportExists,
    ledgerExists,
    expectedStatusFound,
    blockedReasons
  };

  results.push(result);

  appendLedger({
    eventType: "REGISTRY_CLOSURE_CHECKED",
    createdAt: new Date().toISOString(),
    registry,
    result,
    smokeOutputTail: smokeOutput.split(/\r?\n/).slice(-12)
  });
}

const failed = results.filter((result) => result.blockedReasons.length > 0);

const closure = {
  status: failed.length === 0
    ? "REGISTRY_CLOSURE_HARNESS_READY"
    : "REGISTRY_CLOSURE_HARNESS_BLOCKED",
  generatedAt: new Date().toISOString(),
  registriesChecked: registries.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
  boundaryLock: [
    "Registry visibility is not authority.",
    "Registry readiness is not activation.",
    "Registry approval is not transaction truth.",
    "No registry mutates runtime by existing.",
    "No registry creates product commitment by being present.",
    "All registry outputs require downstream authorized verification before consequence."
  ],
  nextSequence: [
    "Use registry closure as shared-core stability layer.",
    "Return to LawAidAI UX/product stripdown.",
    "Then connect real payment event to FundTrackerAI verification.",
    "Only FundTrackerAI may verify commitment and commercial activation truth."
  ]
};

const jsonPath = path.join(REPORTS_ROOT, "registry-closure-harness.json");
const mdPath = path.join(REPORTS_ROOT, "registry-closure-harness.md");

fs.mkdirSync(REPORTS_ROOT, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(closure, null, 2), "utf8");

const resultLines = results
  .map((result) => {
    const status = result.blockedReasons.length === 0 ? "PASS" : "FAIL";
    const reasons = result.blockedReasons.length ? ` — ${result.blockedReasons.join(", ")}` : "";
    return `- ${result.label}: ${status}${reasons}`;
  })
  .join("\n");

fs.writeFileSync(mdPath, `# Registry Closure Harness

Generated: ${closure.generatedAt}

## Status

${closure.status}

## Registries Checked

${closure.registriesChecked}

## Results

${resultLines}

## Boundary Lock

- Registry visibility is not authority.
- Registry readiness is not activation.
- Registry approval is not transaction truth.
- No registry mutates runtime by existing.
- No registry creates product commitment by being present.
- All registry outputs require downstream authorized verification before consequence.

## Completed Registry Sequence

- Strategic Opportunity Registry
- SLiM Package Manifest
- AIOS Workflow Registry
- HOD Hardware Profile Registry
- Partner Adapter Registry
- Product Bundle Pricing Registry

## Next Sequence

- Use registry closure as shared-core stability layer.
- Return to LawAidAI UX/product stripdown.
- Then connect real payment event to FundTrackerAI verification.
- Only FundTrackerAI may verify commitment and commercial activation truth.
`, "utf8");

console.log("REGISTRY_CLOSURE_STATUS");
console.log(closure.status);
console.log("REGISTRIES_CHECKED=" + closure.registriesChecked);
console.log("REGISTRIES_PASSED=" + closure.passed);
console.log("REGISTRIES_FAILED=" + closure.failed);
console.log("REPORT_MD=" + mdPath);
console.log("REPORT_JSON=" + jsonPath);

if (failed.length > 0) {
  console.log("FAILED_REGISTRIES");
  for (const item of failed) {
    console.log(`- ${item.label}: ${item.blockedReasons.join(", ")}`);
  }
  process.exit(1);
}
