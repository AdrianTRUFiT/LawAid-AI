import { loadAllMemoryObjects } from "./memoryIndex";
import { callOllamaGenerate } from "./ollamaClient";
import { buildOllamaPrompt } from "./ollamaPromptBuilder";
import { enforceTruthLane } from "../truth-governance/enforceTruthLane";

export interface OllamaCandidateArtifact {
  artifactId: string;
  projectId: string;
  sourceIds: string[];
  model: string;
  promptIntent: string;
  truthLane: "public" | "semi_private" | "private";
  responseText: string;
  status: "candidate";
  createdAt: string;
}

export interface OllamaIngressRequest {
  projectId: string;
  sourceIds: string[];
  objective: string;
  model: string;
  requestedLane: "public" | "semi_private" | "private";
}

export async function runOllamaIngress(
  request: OllamaIngressRequest
): Promise<OllamaCandidateArtifact> {
  const all = loadAllMemoryObjects(true);
  const sourceObjects = all.filter((obj) => request.sourceIds.includes(obj.id));

  if (sourceObjects.length === 0) {
    throw new Error("ollama_ingress_missing_source_objects");
  }

  const joinedText = sourceObjects.map((obj) => `${obj.title}\n${obj.summary}\n${obj.content}`).join("\n\n");
  const laneDecision = enforceTruthLane(request.requestedLane, joinedText);

  if (!laneDecision.allowed) {
    throw new Error(`ollama_ingress_truth_lane_refused:${laneDecision.resolvedLane}`);
  }

  const built = buildOllamaPrompt({
    projectId: request.projectId,
    objective: request.objective,
    sourceObjects,
    truthLane: laneDecision.resolvedLane
  });

  const response = await callOllamaGenerate({
    model: request.model,
    prompt: built.prompt,
    stream: false
  });

  return {
    artifactId: `ollama_candidate_${Date.now()}`,
    projectId: request.projectId,
    sourceIds: built.sourceIds,
    model: request.model,
    promptIntent: request.objective,
    truthLane: laneDecision.resolvedLane,
    responseText: response.response,
    status: "candidate",
    createdAt: new Date().toISOString()
  };
}
