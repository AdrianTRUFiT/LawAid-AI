export type OllamaModelInfo = {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
};

export type OllamaTagsResponse = {
  models: OllamaModelInfo[];
};

export type OllamaGenerateRequest = {
  model: string;
  prompt: string;
  stream?: boolean;
};

export type OllamaGenerateResponse = {
  model: string;
  created_at?: string;
  response: string;
  done: boolean;
};

export const OLLAMA_LOCAL_BASE_URL = "http://127.0.0.1:11434";
export const DEFAULT_OLLAMA_MODEL = "qwen2.5-coder:latest";

export async function getLocalOllamaModels(): Promise<OllamaModelInfo[]> {
  const response = await fetch(`${OLLAMA_LOCAL_BASE_URL}/api/tags`);

  if (!response.ok) {
    throw new Error(`Ollama tags request failed: ${response.status}`);
  }

  const data = (await response.json()) as OllamaTagsResponse;
  return Array.isArray(data.models) ? data.models : [];
}

export async function generateLocalOllamaResponse(
  prompt: string,
  model = DEFAULT_OLLAMA_MODEL
): Promise<string> {
  const response = await fetch(`${OLLAMA_LOCAL_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    } satisfies OllamaGenerateRequest)
  });

  if (!response.ok) {
    throw new Error(`Ollama generate request failed: ${response.status}`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  return data.response ?? "";
}