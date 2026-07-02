import * as fs from "node:fs";
import * as path from "node:path";
import type { TraversalMarker } from "./traversalTypes";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function traceDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "trace");
  ensureDir(dir);
  return dir;
}

export function saveTraversalMarker(marker: TraversalMarker): string {
  const filePath = path.join(traceDir(), `${marker.markerId}.trace.json`);
  fs.writeFileSync(filePath, JSON.stringify(marker, null, 2), "utf8");
  return filePath;
}

export function loadAllTraversalMarkers(): TraversalMarker[] {
  const dir = traceDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".trace.json"));
  return files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as TraversalMarker
  );
}
