export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface OllamaClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

export async function callOllamaGenerate(
  request: OllamaGenerateRequest,
  options: OllamaClientOptions = {}
): Promise<OllamaGenerateResponse> {
  const baseUrl = options.baseUrl ?? "http://127.0.0.1:11434";
  const timeoutMs = options.timeoutMs ?? 60000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        stream: request.stream ?? false
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`ollama_http_${res.status}`);
    }

    const json = (await res.json()) as OllamaGenerateResponse;

    if (!json || typeof json.response !== "string") {
      throw new Error("ollama_malformed_response");
    }

    if (!json.response.trim()) {
      throw new Error("ollama_empty_response");
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
}
