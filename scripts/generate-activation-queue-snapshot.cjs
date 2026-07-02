const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .map((name) => path.join(dirPath, name));
}

const projectRoot = process.argv[2] || "D:\\DEV\\PROJECTS\\LawAidAI";

const reviewedDir = path.join(projectRoot, "intake", "reviewed");
const shellDir = path.join(projectRoot, "records", "shell");
const activationDir = path.join(projectRoot, "records", "activation");
const liveDir = path.join(projectRoot, "records", "live");
const devDir = path.join(projectRoot, "src", "dev");
const outPath = path.join(devDir, "activationQueue.snapshot.json");

ensureDir(devDir);

const itemsByHandoff = new Map();

for (const filePath of listJsonFiles(reviewedDir)) {
  const json = readJsonSafe(filePath);
  if (!json) continue;
  const handoffId = json.handoffId || path.basename(filePath, ".json");
  itemsByHandoff.set(handoffId, {
    handoffId,
    reviewedPath: filePath,
    reviewedStatus: json.reviewStatus || "unknown",
    shellPath: null,
    activationEnvelopePath: null,
    liveRecordPath: null,
    transactionStateId: null,
    activationKey: null,
    notes: [],
  });
}

for (const filePath of listJsonFiles(shellDir)) {
  const json = readJsonSafe(filePath);
  if (!json) continue;
  const handoffId = json.handoffId || json.sourceArtifact?.handoffId || null;
  if (!handoffId) continue;

  const existing = itemsByHandoff.get(handoffId) || {
    handoffId,
    reviewedPath: null,
    reviewedStatus: "unknown",
    shellPath: null,
    activationEnvelopePath: null,
    liveRecordPath: null,
    transactionStateId: null,
    activationKey: null,
    notes: [],
  };

  existing.shellPath = filePath;
  itemsByHandoff.set(handoffId, existing);
}

for (const filePath of listJsonFiles(activationDir)) {
  if (filePath.includes("\\testdata\\")) continue;
  const json = readJsonSafe(filePath);
  if (!json) continue;

  const handoffId =
    json?.reviewedShell?.handoffId ||
    json?.activatedTransactionState?.handoffId ||
    null;

  if (!handoffId) continue;

  const existing = itemsByHandoff.get(handoffId) || {
    handoffId,
    reviewedPath: null,
    reviewedStatus: "unknown",
    shellPath: null,
    activationEnvelopePath: null,
    liveRecordPath: null,
    transactionStateId: null,
    activationKey: null,
    notes: [],
  };

  existing.activationEnvelopePath = filePath;
  existing.transactionStateId =
    json?.activatedTransactionState?.transactionStateId || null;
  existing.activationKey = json?.activationKey || null;
  itemsByHandoff.set(handoffId, existing);
}

for (const filePath of listJsonFiles(liveDir)) {
  const json = readJsonSafe(filePath);
  if (!json) continue;
  const handoffId = json?.source?.handoffId || null;
  if (!handoffId) continue;

  const existing = itemsByHandoff.get(handoffId) || {
    handoffId,
    reviewedPath: null,
    reviewedStatus: "unknown",
    shellPath: null,
    activationEnvelopePath: null,
    liveRecordPath: null,
    transactionStateId: null,
    activationKey: null,
    notes: [],
  };

  existing.liveRecordPath = filePath;
  existing.activationKey = json?.activationKey || existing.activationKey || null;
  itemsByHandoff.set(handoffId, existing);
}

const items = Array.from(itemsByHandoff.values()).map((item) => {
  const notes = [];

  if (!item.reviewedPath) notes.push("No reviewed artifact found.");
  if (!item.shellPath) notes.push("No shell record found.");
  if (!item.activationEnvelopePath) notes.push("No activation envelope found.");
  if (!item.liveRecordPath) notes.push("No live record found.");

  return {
    ...item,
    status:
      item.liveRecordPath
        ? "live"
        : item.activationEnvelopePath
        ? "activated"
        : item.shellPath
        ? "shell-only"
        : item.reviewedPath
        ? "reviewed"
        : "unknown",
    notes: [...item.notes, ...notes],
  };
});

fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      projectRoot,
      items,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`Activation queue snapshot written to: ${outPath}`);