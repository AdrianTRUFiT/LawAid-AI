import React, { useEffect, useMemo, useReducer } from "react";
import {
  CreateWorkspaceInput,
  LlmProvider,
  RelayKnowledgeFile,
  RelayLaneKind,
  Workspace,
  WorkspaceState
} from "./types";
import { loadWorkspaceState, resetWorkspaceState, saveWorkspaceState } from "./storage";
import { workspaceReducer } from "./reducer";

export type WorkspaceController = {
  state: WorkspaceState;
  activeWorkspace: Workspace | null;
  createWorkspace: (input: CreateWorkspaceInput) => void;
  openWorkspace: (workspaceId: string) => void;
  renameWorkspace: (workspaceId: string, name: string) => void;
  archiveWorkspace: (workspaceId: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  setRelayActiveLane: (workspaceId: string, lane: RelayLaneKind) => void;
  setRelayProvider: (workspaceId: string, lane: RelayLaneKind, provider: LlmProvider) => void;
  setRelayInstructions: (workspaceId: string, lane: RelayLaneKind, value: string) => void;
  setRelayContextNotes: (workspaceId: string, lane: RelayLaneKind, value: string) => void;
  setRelayDraftInput: (workspaceId: string, lane: RelayLaneKind, value: string) => void;
  sendRelayMessage: (workspaceId: string, lane: RelayLaneKind) => void;
  appendRelayExchange: (workspaceId: string, lane: RelayLaneKind, prompt: string, response: string, providerLabel?: string) => void;
  copyRelayMessageToBuffer: (workspaceId: string, lane: RelayLaneKind, messageId: string) => void;
  setRelayBuffer: (workspaceId: string, value: string) => void;
  pasteRelayBufferToLaneInput: (workspaceId: string, lane: RelayLaneKind) => void;
  clearRelayBuffer: (workspaceId: string) => void;
  addRelayKnowledgeFiles: (workspaceId: string, lane: RelayLaneKind, files: RelayKnowledgeFile[]) => void;
  removeRelayKnowledgeFile: (workspaceId: string, lane: RelayLaneKind, fileId: string) => void;
  clearRelayKnowledgeFiles: (workspaceId: string, lane: RelayLaneKind) => void;
  appendKnowledgeSummaryToDraft: (workspaceId: string, lane: RelayLaneKind) => void;
  reset: () => void;
};

export function useWorkspaceStore(): WorkspaceController {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);

  useEffect(() => saveWorkspaceState(state), [state]);

  const activeWorkspace = useMemo(
    () => state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? null,
    [state.activeWorkspaceId, state.workspaces]
  );

  return {
    state,
    activeWorkspace,
    createWorkspace: (input) => dispatch({ type: "createWorkspace", input }),
    openWorkspace: (workspaceId) => dispatch({ type: "openWorkspace", workspaceId }),
    renameWorkspace: (workspaceId, name) => dispatch({ type: "renameWorkspace", workspaceId, name }),
    archiveWorkspace: (workspaceId) => dispatch({ type: "archiveWorkspace", workspaceId }),
    deleteWorkspace: (workspaceId) => dispatch({ type: "deleteWorkspace", workspaceId }),
    setRelayActiveLane: (workspaceId, lane) => dispatch({ type: "setRelayActiveLane", workspaceId, lane }),
    setRelayProvider: (workspaceId, lane, provider) => dispatch({ type: "setRelayProvider", workspaceId, lane, provider }),
    setRelayInstructions: (workspaceId, lane, value) => dispatch({ type: "setRelayInstructions", workspaceId, lane, value }),
    setRelayContextNotes: (workspaceId, lane, value) => dispatch({ type: "setRelayContextNotes", workspaceId, lane, value }),
    setRelayDraftInput: (workspaceId, lane, value) => dispatch({ type: "setRelayDraftInput", workspaceId, lane, value }),
    sendRelayMessage: (workspaceId, lane) => dispatch({ type: "sendRelayMessage", workspaceId, lane }),
    appendRelayExchange: (workspaceId, lane, prompt, response, providerLabel) =>
      dispatch({ type: "appendRelayExchange", workspaceId, lane, prompt, response, providerLabel }),
    copyRelayMessageToBuffer: (workspaceId, lane, messageId) => dispatch({ type: "copyRelayMessageToBuffer", workspaceId, lane, messageId }),
    setRelayBuffer: (workspaceId, value) => dispatch({ type: "setRelayBuffer", workspaceId, value }),
    pasteRelayBufferToLaneInput: (workspaceId, lane) => dispatch({ type: "pasteRelayBufferToLaneInput", workspaceId, lane }),
    clearRelayBuffer: (workspaceId) => dispatch({ type: "clearRelayBuffer", workspaceId }),
    addRelayKnowledgeFiles: (workspaceId, lane, files) => dispatch({ type: "addRelayKnowledgeFiles", workspaceId, lane, files }),
    removeRelayKnowledgeFile: (workspaceId, lane, fileId) => dispatch({ type: "removeRelayKnowledgeFile", workspaceId, lane, fileId }),
    clearRelayKnowledgeFiles: (workspaceId, lane) => dispatch({ type: "clearRelayKnowledgeFiles", workspaceId, lane }),
    appendKnowledgeSummaryToDraft: (workspaceId, lane) => dispatch({ type: "appendKnowledgeSummaryToDraft", workspaceId, lane }),
    reset: () => dispatch({ type: "replaceState", state: resetWorkspaceState() })
  };
}