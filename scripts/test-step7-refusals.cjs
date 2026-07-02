const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

const projectRoot = process.argv[2] || "D:\\DEV\\PROJECTS\\LawAidAI";
const sourceReviewedShell = path.join(
  projectRoot,
  "records",
  "activation",
  "testdata",
  "reviewed-shell-test.json",
);
const sourceAts = path.join(
  projectRoot,
  "records",
  "activation",
  "testdata",
  "activated-transaction-state-test.json",
);

if (!fs.existsSync(sourceReviewedShell) || !fs.existsSync(sourceAts)) {
  console.error("Missing Step 6 test data. Run make-step6-test-data.cjs first.");
  process.exit(1);
}

const refusalDir = path.join(projectRoot, "records", "activation", "testdata", "refusal");
ensureDir(refusalDir);

const baselineShell = readJson(sourceReviewedShell);
const baselineAts = readJson(sourceAts);

const cases = [
  {
    name: "wrong-target",
    shell: baselineShell,
    ats: { ...baselineAts, targetApp: "OtherApp" },
    expected: "WRONG_TARGET",
  },
  {
    name: "unapproved-shell",
    shell: { ...baselineShell, reviewStatus: "pending" },
    ats: baselineAts,
    expected: "UNAPPROVED_REVIEW_STATE",
  },
  {
    name: "missing-transaction-id",
    shell: baselineShell,
    ats: { ...baselineAts, transactionStateId: "" },
    expected: "MISSING_REQUIRED_FIELD",
  },
];

const results = [];

for (const testCase of cases) {
  const shellPath = path.join(refusalDir, `${testCase.name}-reviewed-shell.json`);
  const atsPath = path.join(refusalDir, `${testCase.name}-activated-transaction-state.json`);

  writeJson(shellPath, testCase.shell);
  writeJson(atsPath, testCase.ats);

  const run = spawnSync(
    "node",
    [
      path.join(projectRoot, "scripts", "activate-reviewed-shell.cjs"),
      projectRoot,
      shellPath,
      atsPath,
    ],
    { encoding: "utf8" },
  );

  const stdout = run.stdout || "";
  const stderr = run.stderr || "";
  const combined = `${stdout}\n${stderr}`.trim();

  results.push({
    name: testCase.name,
    expected: testCase.expected,
    exitCode: run.status,
    output: combined,
    passed: combined.includes("STEP 6 REFUSED"),
  });
}

const reportPath = path.join(refusalDir, "step7-refusal-report.json");
writeJson(reportPath, {
  generatedAt: new Date().toISOString(),
  projectRoot,
  results,
});

console.log("STEP 7 refusal tests completed.");
console.log(`Report: ${reportPath}`);

for (const item of results) {
  console.log(`- ${item.name}: ${item.passed ? "PASS" : "FAIL"}`);
}