import { AiopAnalyticsEvent, AiopStage } from "./aiopContracts";

const STORAGE_KEY = "aiop:analytics";

function readEvents(): AiopAnalyticsEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AiopAnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AiopAnalyticsEvent[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-200)));
}

export function trackAiopEvent(
  sessionId: string,
  type: AiopAnalyticsEvent["type"],
  stage?: AiopStage,
  metadata?: Record<string, unknown>
): void {
  const events = readEvents();
  events.push({
    sessionId,
    type,
    stage,
    timestamp: new Date().toISOString(),
    metadata
  });
  writeEvents(events);
}
