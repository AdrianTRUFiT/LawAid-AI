import {
  CreateWorkspaceInput,
  LlmProvider,
  RelayKnowledgeFile,
  RelayLaneKind,
  Workspace,
  WorkspaceState
} from "./types";
import { createDefaultRelayState, normalizeWorkspaceState } from "./relayDefaults";
import { cleanName, createId, nowIso } from "./utils";

export type WorkspaceAction =
  | { type: "createWorkspace"; input: CreateWorkspaceInput }
  | { type: "openWorkspace"; workspaceId: string }
  | { type: "renameWorkspace"; workspaceId: string; name: string }
  | { type: "archiveWorkspace"; workspaceId: string }
  | { type: "deleteWorkspace"; workspaceId: string }
  | { type: "setRelayActiveLane"; workspaceId: string; lane: RelayLaneKind }
  | { type: "setRelayProvider"; workspaceId: string; lane: RelayLaneKind; provider: LlmProvider }
  | { type: "setRelayInstructions"; workspaceId: string; lane: RelayLaneKind; value: string }
  | { type: "setRelayContextNotes"; workspaceId: string; lane: RelayLaneKind; value: string }
  | { type: "setRelayDraftInput"; workspaceId: string; lane: RelayLaneKind; value: string }
  | { type: "sendRelayMessage"; workspaceId: string; lane: RelayLaneKind }
  | { type: "appendRelayExchange"; workspaceId: string; lane: RelayLaneKind; prompt: string; response: string; providerLabel?: string }
  | { type: "copyRelayMessageToBuffer"; workspaceId: string; lane: RelayLaneKind; messageId: string }
  | { type: "setRelayBuffer"; workspaceId: string; value: string }
  | { type: "pasteRelayBufferToLaneInput"; workspaceId: string; lane: RelayLaneKind }
  | { type: "clearRelayBuffer"; workspaceId: string }
  | { type: "addRelayKnowledgeFiles"; workspaceId: string; lane: RelayLaneKind; files: RelayKnowledgeFile[] }
  | { type: "removeRelayKnowledgeFile"; workspaceId: string; lane: RelayLaneKind; fileId: string }
  | { type: "clearRelayKnowledgeFiles"; workspaceId: string; lane: RelayLaneKind }
  | { type: "appendKnowledgeSummaryToDraft"; workspaceId: string; lane: RelayLaneKind }
  | { type: "replaceState"; state: WorkspaceState };

function createWorkspace(input: CreateWorkspaceInput): Workspace {
  const stamp = nowIso();

  return {
    id: createId("ws"),
    name: cleanName(input.name, "Untitled Workspace"),
    status: "active",
    createdAt: stamp,
    updatedAt: stamp,
    relay: createDefaultRelayState(),
    projects: [],
    notes: [],
    tasks: [],
    events: [],
    documents: []
  };
}

function updateWorkspace(
  state: WorkspaceState,
  workspaceId: string,
  updater: (workspace: Workspace) => Workspace
): WorkspaceState {
  return normalizeWorkspaceState({
    ...state,
    workspaces: state.workspaces.map((workspace) =>
      workspace.id === workspaceId ? updater(workspace) : workspace
    )
  });
}

export function workspaceReducer(rawState: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  const state = normalizeWorkspaceState(rawState);

  if (action.type === "replaceState") return normalizeWorkspaceState(action.state);

  if (action.type === "createWorkspace") {
    const workspace = createWorkspace(action.input);
    return normalizeWorkspaceState({
      activeWorkspaceId: workspace.id,
      workspaces: [workspace, ...state.workspaces]
    });
  }

  if (action.type === "openWorkspace") {
    return normalizeWorkspaceState({ ...state, activeWorkspaceId: action.workspaceId });
  }

  if (action.type === "renameWorkspace") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      name: cleanName(action.name, workspace.name),
      updatedAt: nowIso()
    }));
  }

  if (action.type === "archiveWorkspace") {
    const next = updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      status: "archived",
      updatedAt: nowIso()
    }));

    if (state.activeWorkspaceId !== action.workspaceId) return next;

    const fallback = next.workspaces.find((workspace) => workspace.status !== "archived") ?? null;
    return normalizeWorkspaceState({ ...next, activeWorkspaceId: fallback?.id ?? null });
  }

  if (action.type === "setRelayActiveLane") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: { ...workspace.relay, activeLane: action.lane }
    }));
  }

  if (action.type === "setRelayProvider") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: {
        ...workspace.relay,
        lanes: {
          ...workspace.relay.lanes,
          [action.lane]: { ...workspace.relay.lanes[action.lane], provider: action.provider }
        }
      }
    }));
  }

  if (action.type === "setRelayInstructions") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: {
        ...workspace.relay,
        lanes: {
          ...workspace.relay.lanes,
          [action.lane]: { ...workspace.relay.lanes[action.lane], projectInstructions: action.value }
        }
      }
    }));
  }

  if (action.type === "setRelayContextNotes") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: {
        ...workspace.relay,
        lanes: {
          ...workspace.relay.lanes,
          [action.lane]: { ...workspace.relay.lanes[action.lane], contextNotes: action.value }
        }
      }
    }));
  }

  if (action.type === "setRelayDraftInput") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: {
        ...workspace.relay,
        lanes: {
          ...workspace.relay.lanes,
          [action.lane]: { ...workspace.relay.lanes[action.lane], draftInput: action.value }
        }
      }
    }));
  }

  if (action.type === "sendRelayMessage") {
    const stamp = nowIso();

    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];
      const prompt = lane.draftInput.trim();

      if (!prompt) return workspace;

      const kbSummary =
        lane.knowledgeFiles.length > 0
          ? `\n\n[Attached Knowledge Base: ${lane.knowledgeFiles.length} file(s): ${lane.knowledgeFiles.map((file) => file.name).join(", ")}]`
          : "";

      return {
        ...workspace,
        updatedAt: stamp,
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              draftInput: "",
              messages: [
                ...lane.messages,
                { id: createId("relay_user"), role: "user", body: prompt, createdAt: stamp },
                {
                  id: createId("relay_assistant"),
                  role: "assistant",
                  body: prompt,
                  createdAt: stamp
                }
              ]
            }
          }
        }
      };
    });
  }

  if (action.type === "appendRelayExchange") {
    const stamp = nowIso();
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];
      const provider = action.providerLabel ?? lane.provider;
      const prompt = action.prompt.trim();
      const response = action.response.trim();
      if (!prompt && !response) return workspace;

      const userMessage = prompt
        ? {
            id: createId("relay_user"),
            role: "user" as const,
            body: prompt,
            createdAt: stamp
          }
        : null;

      const assistantMessage = {
        id: createId("relay_assistant"),
        role: "assistant" as const,
        body: response || `[${provider} returned an empty response]`,
        createdAt: stamp
      };

      return {
        ...workspace,
        updatedAt: stamp,
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              draftInput: "",
              messages: [
                ...lane.messages,
                ...(userMessage ? [userMessage] : []),
                assistantMessage
              ]
            }
          }
        }
      };
    });
  }
  if (action.type === "copyRelayMessageToBuffer") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];
      const message = lane.messages.find((item) => item.id === action.messageId);
      if (!message) return workspace;

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          relayBuffer: message.body,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              messages: lane.messages.map((item) =>
                item.id === action.messageId ? { ...item, copiedToBuffer: true } : { ...item, copiedToBuffer: false }
              )
            }
          }
        }
      };
    });
  }

  if (action.type === "setRelayBuffer") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: { ...workspace.relay, relayBuffer: action.value }
    }));
  }

  if (action.type === "pasteRelayBufferToLaneInput") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const buffer = workspace.relay.relayBuffer.trim();
      const lane = workspace.relay.lanes[action.lane];
      if (!buffer) return workspace;

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              draftInput: lane.draftInput.trim() ? `${lane.draftInput.trim()}\n\n${buffer}` : buffer
            }
          }
        }
      };
    });
  }

  if (action.type === "clearRelayBuffer") {
    return updateWorkspace(state, action.workspaceId, (workspace) => ({
      ...workspace,
      updatedAt: nowIso(),
      relay: { ...workspace.relay, relayBuffer: "" }
    }));
  }

  if (action.type === "addRelayKnowledgeFiles") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];

      const existingNames = new Set(lane.knowledgeFiles.map((file) => `${file.name}:${file.sizeBytes}`));
      const nextFiles = action.files.filter((file) => !existingNames.has(`${file.name}:${file.sizeBytes}`));

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              knowledgeFiles: [...nextFiles, ...lane.knowledgeFiles]
            }
          }
        }
      };
    });
  }

  if (action.type === "removeRelayKnowledgeFile") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              knowledgeFiles: lane.knowledgeFiles.filter((file) => file.id !== action.fileId)
            }
          }
        }
      };
    });
  }

  if (action.type === "clearRelayKnowledgeFiles") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              knowledgeFiles: []
            }
          }
        }
      };
    });
  }

  if (action.type === "appendKnowledgeSummaryToDraft") {
    return updateWorkspace(state, action.workspaceId, (workspace) => {
      const lane = workspace.relay.lanes[action.lane];

      if (lane.knowledgeFiles.length === 0) return workspace;

      const summary = [
        "Attached knowledge base for this lane:",
        ...lane.knowledgeFiles.map((file) => `- ${file.name} (${file.lineCount} lines, ${file.charCount} chars)`)
      ].join("\n");

      return {
        ...workspace,
        updatedAt: nowIso(),
        relay: {
          ...workspace.relay,
          lanes: {
            ...workspace.relay.lanes,
            [action.lane]: {
              ...lane,
              draftInput: lane.draftInput.trim()
                ? `${lane.draftInput.trim()}\n\n${summary}`
                : summary
            }
          }
        }
      };
    });
  }

  if (action.type === "deleteWorkspace") {
    const remaining = state.workspaces.filter((workspace) => workspace.id !== action.workspaceId);
    const fallback =
      remaining.find((workspace) => workspace.status !== "archived") ?? remaining[0] ?? null;

    return normalizeWorkspaceState({
      activeWorkspaceId:
        state.activeWorkspaceId === action.workspaceId
          ? fallback?.id ?? null
          : state.activeWorkspaceId,
      workspaces: remaining
    });
  }
  return state;
}