import { LlmProvider, RelayLaneKind, RelayLaneState, Workspace, WorkspaceRelayState, WorkspaceState } from "./types";
import { nowIso } from "./utils";

export function createRelayLane(lane: RelayLaneKind, provider: LlmProvider): RelayLaneState {
  const stamp = nowIso();

  return {
    lane,
    label: lane === "main" ? "Main" : "Secondary",
    provider,
    projectInstructions:
      lane === "main"
        ? "Main lane instructions. Use this lane for final review, synthesis, and official cleanup."
        : "Secondary lane instructions. Use this lane for critique, alternate framing, research passes, or second opinions.",
    contextNotes: "",
    draftInput: "",
    knowledgeFiles: [],
    messages: [
      {
        id: `${lane}_system_seed`,
        role: "system",
        body: `${lane === "main" ? "Main" : "Secondary"} lane ready. Mock/local only. No external LLM connection is active.`,
        createdAt: stamp
      }
    ]
  };
}

export function createDefaultRelayState(): WorkspaceRelayState {
  return {
    activeLane: "main",
    relayBuffer: "",
    lanes: {
      main: createRelayLane("main", "ChatGPT"),
      secondary: createRelayLane("secondary", "Claude")
    }
  };
}

export function ensureWorkspaceRelay(workspace: Partial<Workspace> & { id: string; name: string }): Workspace {
  const stamp = nowIso();
  const relay = workspace.relay;

  return {
    id: workspace.id,
    name: workspace.name,
    status: workspace.status ?? "draft",
    createdAt: workspace.createdAt ?? stamp,
    updatedAt: workspace.updatedAt ?? stamp,
    relay: {
      activeLane: relay?.activeLane ?? "main",
      relayBuffer: relay?.relayBuffer ?? "",
      lanes: {
        main: {
          ...createRelayLane("main", "ChatGPT"),
          ...(relay?.lanes?.main ?? {}),
          knowledgeFiles: relay?.lanes?.main?.knowledgeFiles ?? []
        },
        secondary: {
          ...createRelayLane("secondary", "Claude"),
          ...(relay?.lanes?.secondary ?? {}),
          knowledgeFiles: relay?.lanes?.secondary?.knowledgeFiles ?? []
        }
      }
    },
    projects: workspace.projects ?? [],
    notes: workspace.notes ?? [],
    tasks: workspace.tasks ?? [],
    events: workspace.events ?? [],
    documents: workspace.documents ?? []
  };
}

export function normalizeWorkspaceState(state: WorkspaceState): WorkspaceState {
  const workspaces = state.workspaces.map((workspace) => ensureWorkspaceRelay(workspace));
  const activeExists = workspaces.some((workspace) => workspace.id === state.activeWorkspaceId);
  const fallback = workspaces.find((workspace) => workspace.status !== "archived") ?? workspaces[0] ?? null;

  return {
    activeWorkspaceId: activeExists ? state.activeWorkspaceId : fallback?.id ?? null,
    workspaces
  };
}