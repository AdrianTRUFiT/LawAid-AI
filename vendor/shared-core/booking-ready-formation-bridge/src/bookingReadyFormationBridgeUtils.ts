export function nowIso(): string {
  return new Date().toISOString();
}

export function makeBookingReadyId(subjectId: string): string {
  return `booking_ready_${subjectId}`;
}