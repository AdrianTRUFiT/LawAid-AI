export function nowIso(): string {
  return new Date().toISOString();
}

export function makeVerifiedBookingIntentId(subjectId: string): string {
  return `verified_booking_intent_${subjectId}`;
}