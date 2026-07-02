export function nowIso(): string {
  return new Date().toISOString();
}

export function makeSubscriptionStateId(truthId: string): string {
  return `subscription_state_${truthId}`;
}