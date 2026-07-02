export function nowIso(): string {
  return new Date().toISOString();
}

export function makePreCommitmentOfferId(subjectId: string): string {
  return `precommit_offer_${subjectId}`;
}