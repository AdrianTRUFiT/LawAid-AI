import { Record, Case } from "../context/ProjectContext";

export const summarizeProject = async (project: Case, records: Record[]) => {
  const total = records.length;
  const tasks = records.filter((r) => r.type === "task").length;
  const events = records.filter((r) => r.type === "event").length;
  const documents = records.filter((r) => r.type === "document").length;
  const expenses = records.filter((r) => r.type === "expense").length;

  return [
    `Project: ${project.name} (${project.type})`,
    `Total records: ${total}`,
    `Tasks: ${tasks}`,
    `Events: ${events}`,
    `Documents: ${documents}`,
    `Expenses: ${expenses}`,
    total === 0
      ? "No records have been captured yet."
      : "Summary generated from captured records only. No external AI service is currently enabled.",
  ].join("\n");
};

export const suggestCategory = async (docTitle: string, docDescription?: string) => {
  const text = `${docTitle} ${docDescription || ""}`.toLowerCase();

  if (text.includes("invoice") || text.includes("payment") || text.includes("bill")) {
    return "Financial";
  }
  if (text.includes("email") || text.includes("letter") || text.includes("correspondence")) {
    return "Correspondence";
  }
  if (text.includes("evidence") || text.includes("photo") || text.includes("screenshot")) {
    return "Evidence";
  }
  if (text.includes("meeting") || text.includes("call") || text.includes("conference")) {
    return "Meeting";
  }
  if (text.includes("motion") || text.includes("filing") || text.includes("petition")) {
    return "Filing";
  }

  return "Other";
};

export const findHiddenConnections = async (records: Record[]) => {
  if (records.length === 0) {
    return "No hidden connections identified because no records are available yet.";
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.slice(-5).map((r) => `- ${r.date}: ${r.title}`).join("\n");

  return [
    "Local pattern scan only. No external AI service is currently enabled.",
    "",
    "Recent record activity:",
    latest,
  ].join("\n");
};

export const chatWithAssistant = async (
  message: string,
  records: Record[],
  history: { role: "user" | "model"; parts: { text: string }[] }[]
) => {
  const lower = message.toLowerCase();

  if (lower.includes("how many")) {
    return `There are currently ${records.length} records in this workspace. External AI chat is disabled.`;
  }

  if (lower.includes("document")) {
    const count = records.filter((r) => r.type === "document").length;
    return `There are currently ${count} documents in this workspace. External AI chat is disabled.`;
  }

  if (lower.includes("task")) {
    const count = records.filter((r) => r.type === "task").length;
    return `There are currently ${count} tasks in this workspace. External AI chat is disabled.`;
  }

  return "LawAidAI Assistant is currently running in local fallback mode. External AI chat is disabled, but your records and workflow views remain available.";
};

export const analyzeDocument = async (doc: Record) => {
  return [
    `Title: ${doc.title}`,
    `Date: ${doc.date}`,
    `Category: ${doc.category || "N/A"}`,
    `Description: ${doc.description || "N/A"}`,
    "",
    "Analysis mode: local fallback",
    "- External AI document analysis is currently disabled.",
    "- Record remains available for manual review and workflow use.",
  ].join("\n");
};
