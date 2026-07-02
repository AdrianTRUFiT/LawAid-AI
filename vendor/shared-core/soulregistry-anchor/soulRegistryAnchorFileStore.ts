declare const require: any;

import type {
  SoulRegistryPublicAnchor,
  SoulRegistryPublicReceipt
} from "./soulRegistryAnchorContracts";

const fs = require("fs");
const path = require("path");

export interface SoulRegistryAnchorFilePaths {
  rootDir: string;
  anchorsFile: string;
  receiptsFile: string;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function appendJsonl(filePath: string, value: unknown): void {
  fs.appendFileSync(filePath, JSON.stringify(value) + "\n", "utf8");
}

function readJsonl<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  return lines.map((line: string) => JSON.parse(line) as T);
}

export function buildSoulRegistryAnchorFilePaths(rootDir: string): SoulRegistryAnchorFilePaths {
  return {
    rootDir,
    anchorsFile: path.join(rootDir, "public-anchors.jsonl"),
    receiptsFile: path.join(rootDir, "public-receipts.jsonl")
  };
}

export function writeSoulRegistryAnchorFiles(
  paths: SoulRegistryAnchorFilePaths,
  anchor: SoulRegistryPublicAnchor,
  receipt: SoulRegistryPublicReceipt
): void {
  ensureDir(paths.rootDir);
  appendJsonl(paths.anchorsFile, anchor);
  appendJsonl(paths.receiptsFile, receipt);
}

export function loadSoulRegistryAnchors(paths: SoulRegistryAnchorFilePaths): SoulRegistryPublicAnchor[] {
  return readJsonl<SoulRegistryPublicAnchor>(paths.anchorsFile);
}

export function loadSoulRegistryReceipts(paths: SoulRegistryAnchorFilePaths): SoulRegistryPublicReceipt[] {
  return readJsonl<SoulRegistryPublicReceipt>(paths.receiptsFile);
}


