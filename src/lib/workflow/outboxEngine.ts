import type { WorkflowItem } from "../../types/workflow";

export interface OutboxPreview {
  subject: string;
  body: string;
  mode: "email-draft" | "downloadable-document" | "copy-ready-response";
}

export function buildOutboxPreview(item: WorkflowItem): OutboxPreview {
  return {
    subject: item.title,
    body: [
      item.title,
      "",
      item.description || "",
      "",
      `Refinement: ${item.refinementState}`,
      `Action: ${item.actionState}`,
      item.holdReason ? `Hold Reason: ${item.holdReason}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    mode:
      item.outboxType === "downloadable-document"
        ? "downloadable-document"
        : item.outboxType === "copy-ready-response"
        ? "copy-ready-response"
        : "email-draft",
  };
}
