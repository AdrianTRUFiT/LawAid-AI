export function nowIso(): string {
  return new Date().toISOString();
}

export function makeOperationsPolicyId(subjectId: string, serviceCode: string, planCode: string): string {
  return `mesh_policy_${subjectId}_${serviceCode}_${planCode}`;
}