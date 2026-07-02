export function nowIso(): string {
  return new Date().toISOString();
}

export function makeEntitlementId(subscriptionStateId: string): string {
  return `entitlement_${subscriptionStateId}`;
}