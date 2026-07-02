import * as fs from "node:fs";
import * as path from "node:path";
import type { ActiveProjectState, SurfaceState } from "./activeStateTypes";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function stateDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "state");
  ensureDir(dir);
  return dir;
}

export function saveActiveProjectState(state: ActiveProjectState): string {
  const filePath = path.join(stateDir(), `${state.projectId}.active-state.json`);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
  return filePath;
}

export function saveSurfaceState(state: SurfaceState): string {
  const filePath = path.join(stateDir(), `${state.projectId}.${state.surfaceId}.surface-state.json`);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
  return filePath;
}

export function loadActiveProjectState(projectId: string): ActiveProjectState | null {
  const filePath = path.join(stateDir(), `${projectId}.active-state.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ActiveProjectState;
}
