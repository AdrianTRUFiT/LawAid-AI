import { WorkspaceState } from "./types";
import { createDefaultRelayState } from "./relayDefaults";
import { nowIso } from "./utils";

const stamp = nowIso();

export const mockWorkspaceState: WorkspaceState = {
  activeWorkspaceId: "ws_lawaid_main",
  workspaces: [
    {
      id: "ws_lawaid_main",
      name: "LawAidAI Workspace",
      status: "active",
      createdAt: stamp,
      updatedAt: stamp,
      relay: createDefaultRelayState(),
      projects: [],
      notes: [],
      tasks: [],
      events: [],
      documents: []
    },
    {
      id: "ws_paid_planning",
      name: "PAID Planning",
      status: "draft",
      createdAt: stamp,
      updatedAt: stamp,
      relay: createDefaultRelayState(),
      projects: [],
      notes: [],
      tasks: [],
      events: [],
      documents: []
    }
  ]
};