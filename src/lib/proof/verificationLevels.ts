export const VERIFICATION_LEVELS = [
  "technical",
  "architectural",
  "governance",
] as const;

export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export interface VerificationResult {
  level: VerificationLevel;
  passed: boolean;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export function hasFullVerification(
  results: VerificationResult[],
): boolean {
  const required: VerificationLevel[] = [
    "technical",
    "architectural",
    "governance",
  ];

  return required.every((level) =>
    results.some((r) => r.level === level && r.passed),
  );
}
