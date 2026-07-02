export function nowIso(): string {
  return new Date().toISOString();
}

export function makeAdaptiveConversionPlanId(subjectId: string): string {
  return `adaptive_conversion_plan_${subjectId}`;
}