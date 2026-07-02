export function nowIso(): string {
  return new Date().toISOString();
}

export function makeEntitlementId(
  subjectId: string,
  paidTruthId: string,
  serviceCode: string,
  planCode: string,
): string {
  return `mesh_entitlement_${subjectId}_${paidTruthId}_${serviceCode}_${planCode}`;
}

export function deriveServiceRights(
  serviceCode: string,
  planCode: string,
): string[] {
  const rights: string[] = [];

  rights.push(`service:${serviceCode.toLowerCase()}`);
  rights.push(`plan:${planCode.toLowerCase()}`);

  if (planCode === "MONTHLY") {
    rights.push("usage:subscription");
  }

  if (planCode === "PAY_PER_USE") {
    rights.push("usage:metered");
  }

  if (planCode === "GROUP_PLAN") {
    rights.push("usage:shared_group");
  }

  return rights;
}