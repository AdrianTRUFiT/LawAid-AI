import { WorkspaceStatus } from "../types";

export function StatusBadge({ status }: { status: WorkspaceStatus }) {
  return <span className={`ws-badge ws-badge-${status}`}>{status}</span>;
}