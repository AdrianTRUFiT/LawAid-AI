export function nowIso(): string {
  return new Date().toISOString();
}

export function makeShellAccessId(entitlementId: string): string {
  return `shell_access_${entitlementId}`;
}