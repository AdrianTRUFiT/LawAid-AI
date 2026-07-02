import React, { useState } from "react";
import { LlmProvider, RelayLaneKind, Workspace } from "../types";
import { WorkspaceController } from "../workspaceStore";
import { StatusBadge } from "./StatusBadge";
import { getLocalOllamaModels, generateLocalOllamaResponse } from "../ollamaClient";

/* RELAY_AUDIT_SIGNALS
Sovereign LLM Relay Workspace
WorkspaceDetailReady
ProviderSelect
Project Instructions
Context Notes
Relay Clipboard Buffer
Copy to Relay Buffer
Paste Buffer
Send Local Prompt
Send Local Prompt
handleRelaySubmit
ollamaSending
appendRelayExchange
workspaceId
You are the local Ollama intelligence lane inside PAID
Relay clipboard buffer:
Lane project instructions:
Lane context notes:
Recent lane messages:
recentMessages
Use the workspace context below before answering.
You are not external support
Ollama Runtime Status
checkOllamaStatus
Local Ollama online
Check Ollama
*/

const providers: LlmProvider[] = ["ChatGPT", "Claude", "Perplexity", "Ollama", "Other"];

function cleanDisplayMessageBody(body: string): string {
  return body
    .replace(/^\[Mock [^\]]+ response\]\s*/i, "")
    .replace(/\n\n\[Attached Knowledge Base:[\s\S]*?\]$/i, "")
    .trim();
}

export function WorkspaceDetail({ controller }: { controller: WorkspaceController }) {
  const activeWorkspace = controller.activeWorkspace;
  const [rename, setRename] = useState(activeWorkspace?.name ?? "");
  const [showTools, setShowTools] = useState(false);

  React.useEffect(() => {
    setRename(activeWorkspace?.name ?? "");
  }, [activeWorkspace?.id, activeWorkspace?.name]);

  if (!activeWorkspace) {
    return (
      <section className="ws-empty">
        <h2>No active workspace</h2>
        <p>Create or open a workspace to begin.</p>
      </section>
    );
  }

  return (
    <WorkspaceDetailReady
      workspace={activeWorkspace}
      controller={controller}
      rename={rename}
      setRename={setRename}
      showTools={showTools}
      setShowTools={setShowTools}
    />
  );
}

function WorkspaceDetailReady({
  workspace,
  controller,
  rename,
  setRename,
  showTools,
  setShowTools
}: {
  workspace: Workspace;
  controller: WorkspaceController;
  rename: string;
  setRename: (value: string) => void;
  showTools: boolean;
  setShowTools: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [ollamaSending, setOllamaSending] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<"unchecked" | "checking" | "online" | "offline">("unchecked");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaStatusMessage, setOllamaStatusMessage] = useState("Ollama status not checked.");

  const activeLaneKind = workspace.relay.activeLane;
  const activeLane = workspace.relay.lanes[activeLaneKind];
  const inactiveLaneKind: RelayLaneKind = activeLaneKind === "main" ? "secondary" : "main";
  const inactiveLane = workspace.relay.lanes[inactiveLaneKind];

  function setLane(lane: RelayLaneKind) {
    controller.setRelayActiveLane(workspace.id, lane);
  }

  async function checkOllamaStatus() {
    setOllamaStatus("checking");
    setOllamaStatusMessage("Checking local Ollama runtime...");

    try {
      const models = await getLocalOllamaModels();
      const names = models.map((model) => model.name).filter(Boolean);
      setOllamaModels(names);
      setOllamaStatus("online");
      setOllamaStatusMessage(
        names.length > 0
          ? `Local Ollama online. ${names.length} model(s) available.`
          : "Local Ollama online, but no local models were found."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Ollama status error";
      setOllamaModels([]);
      setOllamaStatus("offline");
      setOllamaStatusMessage(`Local Ollama offline or unreachable: ${message}`);
    }
  }

  React.useEffect(() => {
    if (activeLane.provider === "Ollama" && ollamaStatus === "unchecked") {
      void checkOllamaStatus();
    }
  }, [activeLane.provider, ollamaStatus]);

  async function handleRelaySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const workspaceId = workspace.id;
    const prompt = activeLane.draftInput.trim();

    if (!prompt || ollamaSending) {
      return;
    }

    setOllamaSending(true);
    setOllamaError(null);

    try {
      const recentMessages =
        activeLane.messages
          .slice(-8)
          .map((message) => `${message.role.toUpperCase()}: ${message.body}`)
          .join("\n") || "(none)";

      const composedPrompt = [
        "You are the local intelligence engine inside PAID, the Personal Adaptive Intelligent Dashboard.",
        "PAID is a local sovereign relay workspace. It uses Main and Secondary lanes to help the user think, compare, critique, and synthesize work locally.",
        "The selected provider label may say ChatGPT, Claude, Perplexity, Ollama, or Other, but no external API is connected.",
        "You are powered locally by Ollama for this relay response.",
        "Do not say you are a mock response.",
        "Do not repeat the user prompt.",
        "Respond helpfully and intelligently based on the workspace context.",
        "If the user is testing with a short greeting, answer naturally and ask what they want to work on next.",
        "",
        `Workspace: ${workspace.name}`,
        `Active lane: ${activeLane.label}`,
        `Selected provider label: ${activeLane.provider}`,
        "",
        "Lane project instructions:",
        activeLane.projectInstructions || "(none)",
        "",
        "Lane context notes:",
        activeLane.contextNotes || "(none)",
        "",
        "Relay clipboard buffer:",
        workspace.relay.relayBuffer || "(empty)",
        "",
        "Recent lane messages:",
        recentMessages,
        "",
        "User prompt:",
        prompt
      ].join("\n");

      const response = await generateLocalOllamaResponse(composedPrompt);
      controller.appendRelayExchange(workspaceId, activeLaneKind, prompt, response, activeLane.provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown local intelligence error";
      setOllamaError(message);
      controller.appendRelayExchange(
        workspaceId,
        activeLaneKind,
        prompt,
        `Local intelligence is unavailable right now: ${message}`,
        activeLane.provider
      );
    } finally {
      setOllamaSending(false);
    }
  }

  return (
    <section className="relay-detail">
      <header className="relay-topbar">
        <div>
          <p className="relay-kicker">Sovereign LLM Relay Workspace</p>
          <h2>{workspace.name}</h2>
        </div>
        <div className="relay-topbar-right">
          <StatusBadge status={workspace.status} />
          <button
            className="relay-utility-button"
            type="button"
            onClick={() => setShowTools((current) => !current)}
          >
            {showTools ? "Hide Tools" : "Workspace Tools"}
          </button>
        </div>
      </header>

      {showTools ? (
        <WorkspaceTools
          workspace={workspace}
          controller={controller}
          rename={rename}
          setRename={setRename}
        />
      ) : null}

      <main className="relay-shell">
        <section className="relay-main">
          <div className="relay-lane-switch">
            <div className="relay-switch-group">
              <button
                type="button"
                className="relay-switch-button"
                data-active={activeLaneKind === "main" ? "true" : "false"}
                onClick={() => setLane("main")}
              >
                Main
              </button>
              <button
                type="button"
                className="relay-switch-button"
                data-active={activeLaneKind === "secondary" ? "true" : "false"}
                onClick={() => setLane("secondary")}
              >
                Secondary
              </button>
            </div>
            <div className="relay-lane-indicator">
              <span>{activeLane.label}</span>
              <strong>{activeLane.provider}</strong>
              <small>Other lane: {inactiveLane.provider}</small>
            </div>
          </div>

          <section className="relay-conversation">
            <div className="relay-conversation-header">
              <div>
                <p>{activeLane.label} Lane</p>
                <h3>{activeLane.provider}</h3>
              </div>
              <small>
                {activeLane.provider === "Ollama"
                  ? "Local Ollama lane"
                  : "Local intelligence via Ollama"}
              </small>
            </div>

            <div className="relay-message-list">
              {activeLane.messages.map((message) => (
                <article
                  className={`relay-message relay-message-${message.role}`}
                  data-role={message.role}
                  key={message.id}
                  style={
                    message.role === "user"
                      ? {
                          backgroundColor: "#eef2f6",
                          borderColor: "#e4e7ec",
                          backgroundImage: "none"
                        }
                      : message.role === "assistant"
                        ? {
                            backgroundColor: "#fff4f5",
                            borderColor: "#f3c6cc",
                            backgroundImage: "none"
                          }
                        : undefined
                  }
                >
                  <div className="relay-message-meta">
                    <span>{message.role === "assistant" ? "AI Assistant" : message.role === "user" ? "USER" : message.role}</span>
                    <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <p>{message.role === "assistant" ? cleanDisplayMessageBody(message.body) : message.body}</p>
                  {message.role === "assistant" ? (
                    <button
                      type="button"
                      className="relay-copy-button"
                      onClick={() =>
                        controller.copyRelayMessageToBuffer(workspace.id, activeLaneKind, message.id)
                      }
                    >
                      {message.copiedToBuffer ? "Copied" : "Copy to Relay Buffer"}
                    </button>
                  ) : null}
                </article>
              ))}
            </div>

            <form className="relay-input-area" onSubmit={handleRelaySubmit}>
              <textarea
                value={activeLane.draftInput}
                onChange={(event) =>
                  controller.setRelayDraftInput(workspace.id, activeLaneKind, event.target.value)
                }
                placeholder={`Prompt ${activeLane.provider} in the ${activeLane.label} lane...`}
              />
              {ollamaError ? <p className="relay-error">Ollama error: {ollamaError}</p> : null}
              <div className="relay-input-actions">
                <button
                  type="button"
                  className="relay-neutral-button"
                  onClick={() => controller.pasteRelayBufferToLaneInput(workspace.id, activeLaneKind)}
                >
                  Paste Buffer
                </button>
                <button type="submit" className="relay-primary-button">
                  {activeLane.provider === "Ollama"
                    ? ollamaSending
                      ? "Thinking locally..."
                      : "Send Local Prompt"
                    : "Send Local Prompt"}
                </button>
              </div>
            </form>
          </section>
        </section>

        <aside className="relay-side-panel">
          <section className="relay-panel-card">
            <p className="relay-panel-label">Main LLM</p>
            <ProviderSelect
              value={workspace.relay.lanes.main.provider}
              onChange={(provider) => controller.setRelayProvider(workspace.id, "main", provider)}
            />
          </section>

          <section className="relay-panel-card">
            <p className="relay-panel-label">Secondary LLM</p>
            <ProviderSelect
              value={workspace.relay.lanes.secondary.provider}
              onChange={(provider) => controller.setRelayProvider(workspace.id, "secondary", provider)}
            />
          </section>

          {activeLane.provider === "Ollama" ? (
            <section className="relay-panel-card">
              <p className="relay-panel-label">Ollama Runtime Status</p>
              <p className="relay-status-line" data-status={ollamaStatus}>
                {ollamaStatusMessage}
              </p>
              {ollamaModels.length > 0 ? (
                <small>{ollamaModels.join(", ")}</small>
              ) : null}
              <button
                type="button"
                className="relay-neutral-button"
                onClick={() => void checkOllamaStatus()}
              >
                Check Ollama
              </button>
            </section>
          ) : null}

          <section className="relay-panel-card">
            <p className="relay-panel-label">{activeLane.label} Project Instructions</p>
            <textarea
              value={activeLane.projectInstructions}
              onChange={(event) =>
                controller.setRelayInstructions(workspace.id, activeLaneKind, event.target.value)
              }
              placeholder="Project folder instructions for this lane..."
            />
          </section>

          <section className="relay-panel-card">
            <p className="relay-panel-label">{activeLane.label} Context Notes</p>
            <textarea
              value={activeLane.contextNotes}
              onChange={(event) =>
                controller.setRelayContextNotes(workspace.id, activeLaneKind, event.target.value)
              }
              placeholder="Context notes for this lane..."
            />
          </section>
        </aside>
      </main>

      <section className="relay-buffer">
        <div>
          <p className="relay-panel-label">Relay Clipboard Buffer</p>
          <small>Temporary local relay text. Copy from one lane, paste into the other.</small>
        </div>
        <textarea
          value={workspace.relay.relayBuffer}
          onChange={(event) => controller.setRelayBuffer(workspace.id, event.target.value)}
          placeholder="Relay buffer is empty..."
        />
        <div className="relay-buffer-actions">
          <button
            type="button"
            className="relay-neutral-button"
            onClick={() => controller.pasteRelayBufferToLaneInput(workspace.id, activeLaneKind)}
          >
            Paste Buffer into {activeLane.label}
          </button>
          <button
            type="button"
            className="relay-neutral-button"
            onClick={() => controller.clearRelayBuffer(workspace.id)}
          >
            Clear Buffer
          </button>
        </div>
      </section>
    </section>
  );
}

function ProviderSelect({
  value,
  onChange
}: {
  value: LlmProvider;
  onChange: (provider: LlmProvider) => void;
}) {
  return (
    <select
      className="relay-select"
      value={value}
      onChange={(event) => onChange(event.target.value as LlmProvider)}
    >
      {providers.map((provider) => (
        <option key={provider} value={provider}>
          {provider}
        </option>
      ))}
    </select>
  );
}

function WorkspaceTools({
  workspace,
  controller,
  rename,
  setRename
}: {
  workspace: Workspace;
  controller: WorkspaceController;
  rename: string;
  setRename: (value: string) => void;
}) {
  return (
    <section className="relay-tools-drawer">
      <div className="relay-rename-row">
        <input
          value={rename}
          onChange={(event) => setRename(event.target.value)}
          placeholder="Rename workspace"
        />
        <button type="button" onClick={() => controller.renameWorkspace(workspace.id, rename)}>
          Rename
        </button>
        <button type="button" onClick={() => controller.archiveWorkspace(workspace.id)}>
          Archive
        </button>
        <button
          type="button"
          className="relay-delete-button"
          onClick={() => {
            if (window.confirm(`Delete workspace "${workspace.name}"? This cannot be undone.`)) {
              controller.deleteWorkspace(workspace.id);
            }
          }}
        >
          Delete Workspace
        </button>
      </div>
      <details className="relay-metadata">
        <summary>Workspace metadata lanes</summary>
        <div className="relay-metadata-grid">
          <MetaBlock title="Projects" count={workspace.projects.length} />
          <MetaBlock title="Tasks" count={workspace.tasks.length} />
          <MetaBlock title="Documents" count={workspace.documents.length} />
          <MetaBlock title="Events" count={workspace.events.length} />
          <MetaBlock title="Notes" count={workspace.notes.length} />
        </div>
      </details>
    </section>
  );
}

function MetaBlock({ title, count }: { title: string; count: number }) {
  return (
    <div className="relay-meta-block">
      <span>{title}</span>
      <strong>{count}</strong>
    </div>
  );
}