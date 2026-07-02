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
      <div className="ws-sidebar-header">
        <div className="ws-brand">
          <div className="ws-logo">P</div>
          <div>
            <h1>Workspaces</h1>
            <p>Local relay state</p>
          </div>
        </div>
      </div>

      <div className="ws-sidebar-body">
        <section className="ws-nav-section">
          <p className="ws-sidebar-heading">Active Workspaces</p>
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
        </section>

        <section className="ws-create-section">
          <p className="ws-sidebar-heading">Create Workspace</p>
          <form className="ws-create" onSubmit={submit}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New workspace name" />
            <button type="submit">Create</button>
          </form>
        </section>

        <button className="ws-reset" type="button" onClick={controller.reset}>
          Reset Local State
        </button>
      </div>
    </aside>
  );
}