import { WorkspaceState } from "./types";
import { mockWorkspaceState } from "./mockData";
import { normalizeWorkspaceState } from "./relayDefaults";

export const WORKSPACE_STORAGE_KEY = "aiva.workspace.state.v1";

function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceState>;
  return Array.isArray(candidate.workspaces);
}

export function loadWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") return normalizeWorkspaceState(mockWorkspaceState);

  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return normalizeWorkspaceState(mockWorkspaceState);

    const parsed = JSON.parse(raw) as unknown;
    if (!isWorkspaceState(parsed)) return normalizeWorkspaceState(mockWorkspaceState);

    return normalizeWorkspaceState(parsed);
  } catch {
    return normalizeWorkspaceState(mockWorkspaceState);
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(normalizeWorkspaceState(state), null, 2));
}

export function resetWorkspaceState(): WorkspaceState {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }
  return normalizeWorkspaceState(mockWorkspaceState);
}