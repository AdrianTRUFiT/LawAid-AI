export type WorkspaceStatus = "draft" | "active" | "pending" | "held" | "review" | "archived";
export type LlmProvider = "ChatGPT" | "Claude" | "Perplexity" | "Ollama" | "Other";
export type RelayLaneKind = "main" | "secondary";
export type RelayMessageRole = "user" | "assistant" | "system";

export type RelayKnowledgeFile = {
  id: string;
  name: string;
  sizeBytes: number;
  kind: string;
  lineCount: number;
  charCount: number;
  addedAt: string;
  preview: string;
};

export type RelayMessage = {
  id: string;
  role: RelayMessageRole;
  body: string;
  createdAt: string;
  copiedToBuffer?: boolean;
};

export type RelayLaneState = {
  lane: RelayLaneKind;
  label: string;
  provider: LlmProvider;
  projectInstructions: string;
  contextNotes: string;
  draftInput: string;
  messages: RelayMessage[];
  ollamaModel?: string;
  knowledgeFiles: RelayKnowledgeFile[];
};

export type WorkspaceRelayState = {
  activeLane: RelayLaneKind;
  relayBuffer: string;
  lanes: {
    main: RelayLaneState;
    secondary: RelayLaneState;
  };
};

export type WorkspaceProject = { id: string; title: string; description: string; status: WorkspaceStatus; createdAt: string; updatedAt: string };
export type WorkspaceNote = { id: string; body: string; status: WorkspaceStatus; createdAt: string; updatedAt: string };
export type WorkspaceTask = { id: string; title: string; dueDate: string; status: WorkspaceStatus; createdAt: string; updatedAt: string };
export type WorkspaceEvent = { id: string; title: string; eventDate: string; status: WorkspaceStatus; createdAt: string; updatedAt: string };
export type WorkspaceDocument = { id: string; title: string; sourceType: "placeholder" | "upload_pending" | "manual"; status: WorkspaceStatus; createdAt: string; updatedAt: string };

export type Workspace = {
  id: string;
  name: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
  relay: WorkspaceRelayState;
  projects: WorkspaceProject[];
  notes: WorkspaceNote[];
  tasks: WorkspaceTask[];
  events: WorkspaceEvent[];
  documents: WorkspaceDocument[];
};

export type WorkspaceState = {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
};

export type CreateWorkspaceInput = { name: string };
export type AddProjectInput = { title: string; description?: string; status?: WorkspaceStatus };
export type AddNoteInput = { body: string; status?: WorkspaceStatus };
export type AddTaskInput = { title: string; dueDate?: string; status?: WorkspaceStatus };
export type AddEventInput = { title: string; eventDate?: string; status?: WorkspaceStatus };
export type AddDocumentInput = { title: string; sourceType?: "placeholder" | "upload_pending" | "manual"; status?: WorkspaceStatus };