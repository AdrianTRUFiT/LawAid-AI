const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const projectRoot = process.argv[2] || "D:\\DEV\\PROJECTS\\LawAidAI";
const outDir = path.join(projectRoot, "records", "friction");
ensureDir(outDir);

const backlog = {
  generatedAt: new Date().toISOString(),
  purpose: "Step 10 friction-audit to refinement backlog",
  buckets: {
    structural: [],
    workflow: [],
    "missing-artifact": [],
    visibility: [],
    automation: [],
    "manual-safety": [],
    continuity: [],
    retrieval: [],
    "operator-burden": []
  }
};

const outPath = path.join(outDir, "refinement-backlog.json");
fs.writeFileSync(outPath, JSON.stringify(backlog, null, 2), "utf8");

console.log(`Refinement backlog created at: ${outPath}`);