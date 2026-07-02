import {
  PartnerAdapterCapability,
  PartnerAdapterDefinition,
  PartnerAdapterKind,
  PartnerAdapterPriority,
  PartnerAdapterStatus,
  PartnerAuthorityBoundary,
  PartnerConnectionMode
} from "./partnerAdapterContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultPartnerAuthorityBoundary(): PartnerAuthorityBoundary {
  return {
    partnerAdapterIsNotAuthority: true,
    partnerAdapterIsNotTrustProof: true,
    partnerAdapterIsNotTransactionTruth: true,
    partnerAdapterIsNotActivationApproval: true,
    partnerAdapterIsNotProductCommitment: true,
    partnerPresenceDoesNotCreatePermission: true,
    partnerOutputRequiresGovernedVerification: true
  };
}

export function createPartnerAdapterDefinition(input: {
  partnerName: string;
  adapterName: string;
  adapterKind: PartnerAdapterKind;
  status?: PartnerAdapterStatus;
  priority?: PartnerAdapterPriority;
  summary: string;
  relatedModules?: string[];
  connectionModes?: PartnerConnectionMode[];
  capabilities?: PartnerAdapterCapability[];
  permissions?: string[];
  constraints?: string[];
  dependencies?: string[];
  futureTrigger?: string;
}): PartnerAdapterDefinition {
  const now = new Date().toISOString();

  return {
    partnerAdapterId: id("partner-adapter"),
    partnerName: input.partnerName.trim(),
    adapterName: input.adapterName.trim(),
    adapterKind: input.adapterKind,
    status: input.status || "DRAFT",
    priority: input.priority || "MEDIUM",
    summary: input.summary.trim(),
    relatedModules: input.relatedModules || [],
    connectionModes: input.connectionModes || [],
    capabilities: input.capabilities || [],
    permissions: input.permissions || [],
    constraints: input.constraints || [],
    dependencies: input.dependencies || [],
    futureTrigger: input.futureTrigger,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultPartnerAuthorityBoundary()
  };
}

export function updatePartnerAdapterStatus(
  adapter: PartnerAdapterDefinition,
  status: PartnerAdapterStatus
): PartnerAdapterDefinition {
  return {
    ...adapter,
    status,
    updatedAt: new Date().toISOString()
  };
}
