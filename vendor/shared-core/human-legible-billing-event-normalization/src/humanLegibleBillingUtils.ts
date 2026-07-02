export function nowIso(): string {
  return new Date().toISOString();
}

export function makeHumanLegibleBillingId(truthId: string, subStateId: string): string {
  return `human_legible_billing_${truthId}_${subStateId}`;
}