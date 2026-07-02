export function nowIso(): string {
  return new Date().toISOString();
}

export function makeAccessActivationId(
  subjectId: string,
  entitlementId: string,
  serviceCode: string,
  planCode: string,
): string {
  return `mesh_access_${subjectId}_${entitlementId}_${serviceCode}_${planCode}`;
}

export function deriveActivationRights(
  serviceCode: string,
  planCode: string,
  accessActivationStatus: "ACCESS_ACTIVE" | "ACCESS_HELD" | "ACCESS_BLOCKED",
): string[] {
  const rights: string[] = [];

  rights.push(`service:${serviceCode.toLowerCase()}`);
  rights.push(`plan:${planCode.toLowerCase()}`);
  rights.push(`access:${accessActivationStatus.toLowerCase()}`);

  return rights;
}