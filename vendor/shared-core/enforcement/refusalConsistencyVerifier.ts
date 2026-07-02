export type RefusalConsistencyResult = "CONSISTENT" | "INCONSISTENT";

export function verifyRefusalConsistency(input: {
  artifactId?: string;
  contextId?: string;
  expectedState: string;
  actualState: string;
  expectedReasonPrefix?: string;
  actualReasonCode?: string;
}) {
  const stateMatches = input.expectedState === input.actualState;

  const reasonMatches =
    !input.expectedReasonPrefix ||
    !input.actualReasonCode ||
    input.actualReasonCode.startsWith(input.expectedReasonPrefix);

  const consistent = stateMatches && reasonMatches;

  const result: RefusalConsistencyResult = consistent
    ? "CONSISTENT"
    : "INCONSISTENT";

  return {
    result,
    consistent,
    reasonCode: consistent
      ? "REFUSAL_CONSISTENCY_VERIFIED"
      : "REFUSAL_CONSISTENCY_MISMATCH"
  };
}
