import { useWorkspaceStore } from "../workspaceStore";
import { WorkspaceList } from "./WorkspaceList";
import { WorkspaceDetail } from "./WorkspaceDetail";

export function WorkspaceApp() {
  const controller = useWorkspaceStore();

  return (
    <div className="ws-app">
      <WorkspaceList controller={controller} />
      <WorkspaceDetail controller={controller} />
    </div>
  );
}