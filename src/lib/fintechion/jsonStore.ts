import fs from "node:fs";
import path from "node:path";
import type { GovernedFinancialOversightState } from "./types";

const dataDir = path.resolve(process.cwd(), "records", "fintechion");
const dataFile = path.join(dataDir, "oversight.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf8");
  }
}

function readStore(): GovernedFinancialOversightState[] {
  ensureStore();
  return JSON.parse(
    fs.readFileSync(dataFile, "utf8"),
  ) as GovernedFinancialOversightState[];
}

function writeStore(store: GovernedFinancialOversightState[]): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export function getFinTechionJsonArtifacts(): GovernedFinancialOversightState[] {
  return readStore();
}

export function resetFinTechionJsonArtifacts(): void {
  writeStore([]);
}

export function appendOversightJson(
  artifact: GovernedFinancialOversightState,
): GovernedFinancialOversightState {
  const store = readStore();
  store.push(artifact);
  writeStore(store);
  return artifact;
}
