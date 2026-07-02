import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAllPaiSafeFixtureRecords
} from "../src/fixtureBuilder.js";

import type {
  PaiSafeFixtureExportManifest
} from "../src/fixtureContracts.js";

const generatedAt = "2026-05-11T16:00:00.000Z";
const outDir = join(process.cwd(), "fixtures", "pai-safe-pass-6");

mkdirSync(outDir, { recursive: true });

const records = buildAllPaiSafeFixtureRecords(generatedAt);

const files: string[] = [];

for (const record of records) {
  const fileName = `${record.fixtureId}.json`;
  const filePath = join(outDir, fileName);

  writeFileSync(filePath, JSON.stringify(record, null, 2) + "\n", "utf8");
  files.push(`fixtures/pai-safe-pass-6/${fileName}`);
}

const manifest: PaiSafeFixtureExportManifest = {
  generatedAt,
  fixtureCount: records.length,
  scenarios: records.map((record) => record.scenario),
  files,
  boundary: {
    noUi: true,
    noPayments: true,
    noExternalApis: true,
    noCustody: true,
    noSoulWritePath: true,
    noFundTrackerBridge: true
  }
};

writeFileSync(
  join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log("PAI_SAFE_PASS_6_FIXTURE_EXPORT=PASS");
console.log(JSON.stringify(manifest, null, 2));