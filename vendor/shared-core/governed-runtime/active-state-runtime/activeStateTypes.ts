export interface ActiveProjectState {
  projectId: string;
  activeObjective: string;
  currentZone: string[];
  recentDecisions: string[];
  lockedConstraints: string[];
  recentInstructions: string[];
  lastUpdatedAt: string;
}

export interface SurfaceState {
  surfaceId: "PING" | "PONG" | "PRIMARY";
  projectId: string;
  localFocus: string[];
  lastSeenActiveStateAt: string;
  confidenceToContinue: number;
  relevanceStatus: "aligned" | "caution" | "misaligned";
}
