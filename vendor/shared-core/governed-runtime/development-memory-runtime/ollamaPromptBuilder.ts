import type { MemoryObject, TruthLane } from "./memoryTypes";

export interface OllamaPromptBuildInput {
  projectId: string;
  objective: string;
  sourceObjects: MemoryObject[];
  truthLane: TruthLane;
}

export interface OllamaPromptBuildResult {
  prompt: string;
  sourceIds: string[];
  truthLane: TruthLane;
}

export function buildOllamaPrompt(input: OllamaPromptBuildInput): OllamaPromptBuildResult {
  if (!input.sourceObjects || input.sourceObjects.length === 0) {
    throw new Error("prompt_build_requires_source_objects");
  }

  const sourceIds = input.sourceObjects.map((obj) => obj.id);

  const serialized = input.sourceObjects.map((obj, index) => {
    return [
      `SOURCE ${index + 1}`,
      `id: ${obj.id}`,
      `title: ${obj.title}`,
      `class: ${obj.objectClass}`,
      `summary: ${obj.summary}`,
      `content: ${obj.content}`
    ].join("\n");
  }).join("\n\n---\n\n");

  const prompt = [
    "You are a local processor operating inside a governed runtime.",
    "You are not authority. You are generating candidate output only.",
    `Project: ${input.projectId}`,
    `Truth lane: ${input.truthLane}`,
    `Objective: ${input.objective}`,
    "",
    "Use only the governed source objects below.",
    "Return a concise candidate output that helps the stated objective.",
    "",
    serialized
  ].join("\n");

  return {
    prompt,
    sourceIds,
    truthLane: input.truthLane
  };
}
