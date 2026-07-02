import type { AuthorizationClass } from "./authorizationGateTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function authorizationRank(value: AuthorizationClass): number {
  switch (value) {
    case "none": return 0;
    case "operator": return 1;
    case "supervisor": return 2;
    case "system_admin": return 3;
    case "compliance": return 4;
  }
}