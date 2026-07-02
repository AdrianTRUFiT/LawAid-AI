import React, { useState } from "react";
import { WorkspaceController } from "../workspaceStore";
import { StatusBadge } from "./StatusBadge";

export function WorkspaceList({ controller }: { controller: WorkspaceController }) {
  const [name, setName] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    controller.createWorkspace({ name });
    setName("");
  }

  return (
    <aside className="ws-sidebar">
      <div className="ws-brand">
        <div className="ws-logo">W</div>
        <div>
          <h1>Workspaces</h1>
          <p>Local functional state</p>
        </div>
      </div>

      <form className="ws-create" onSubmit={submit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New workspace name"
        />
        <button type="submit">Create</button>
      </form>

      <div className="ws-list">
        {controller.state.workspaces.map((workspace) => (
          <button
            type="button"
            className="ws-list-item"
            data-active={workspace.id === controller.state.activeWorkspaceId ? "true" : "false"}
            key={workspace.id}
            onClick={() => controller.openWorkspace(workspace.id)}
          >
            <span>{workspace.name}</span>
            <StatusBadge status={workspace.status} />
          </button>
        ))}
      </div>

      <button className="ws-reset" type="button" onClick={controller.reset}>
        Reset Local Demo State
      </button>
    </aside>
  );
}