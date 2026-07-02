export function nowIso(): string {
  return new Date().toISOString();
}

export function makeContinuityBindingId(protectiveStateId: string): string {
  return `protection_binding_${protectiveStateId}`;
}