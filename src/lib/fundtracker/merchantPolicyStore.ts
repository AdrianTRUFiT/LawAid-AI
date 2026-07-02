import fs from "node:fs";
import path from "node:path";
import type { MerchantRiskPolicy } from "./merchantPolicy";

const dataDir = path.resolve(process.cwd(), "records", "fundtracker");
const dataFile = path.join(dataDir, "merchant-policies.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf8");
  }
}

function readStore(): MerchantRiskPolicy[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8")) as MerchantRiskPolicy[];
}

function writeStore(policies: MerchantRiskPolicy[]): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(policies, null, 2), "utf8");
}

export function getStoredMerchantPolicies(): MerchantRiskPolicy[] {
  return readStore();
}

export function resetStoredMerchantPolicies(): void {
  writeStore([]);
}

export function upsertStoredMerchantPolicy(
  policy: MerchantRiskPolicy,
): MerchantRiskPolicy {
  const policies = readStore();
  const index = policies.findIndex((item) => item.merchantId === policy.merchantId);

  if (index >= 0) {
    policies[index] = policy;
  } else {
    policies.push(policy);
  }

  writeStore(policies);
  return policy;
}
