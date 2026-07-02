import { AIVA_ENVIRONMENT_REGISTRY, PrivacyClass } from './environmentRegistry';

export function findEnvironmentZone(id: string) {
  return AIVA_ENVIRONMENT_REGISTRY.find(z => z.id === id);
}

export function canWriteToEnvironment(zoneId: string, actor: string, privacyClass: PrivacyClass) {
  const zone = findEnvironmentZone(zoneId);

  if (!zone) {
    return {
      allowed: false,
      reason: "ZONE_NOT_FOUND"
    };
  }

  if (!zone.allowedWrites.includes(actor)) {
    return {
      allowed: false,
      reason: "ACTOR_WRITE_NOT_ALLOWED"
    };
  }

  if (!zone.privacyClassesAllowed.includes(privacyClass)) {
    return {
      allowed: false,
      reason: "PRIVACY_CLASS_NOT_ALLOWED"
    };
  }

  if (zone.authorityLevel === "mirror" && privacyClass === "sealed_private") {
    return {
      allowed: false,
      reason: "SEALED_PRIVATE_CANNOT_WRITE_TO_MIRROR"
    };
  }

  if (zone.authorityLevel === "disposable" && privacyClass !== "disposable_test") {
    return {
      allowed: false,
      reason: "DISPOSABLE_ZONE_REJECTS_AUTHORITY_MATERIAL"
    };
  }

  return {
    allowed: true,
    reason: "WRITE_ALLOWED"
  };
}

export function launchRegistryStatus() {
  const launchZones = AIVA_ENVIRONMENT_REGISTRY.filter(z => z.launchEligible);
  const blockers = AIVA_ENVIRONMENT_REGISTRY
    .filter(z => z.launchEligible && z.corruptionBehavior !== "refuse")
    .map(z => z.id + "_CORRUPTION_NOT_REFUSAL");

  return {
    registryPresent: true,
    totalZones: AIVA_ENVIRONMENT_REGISTRY.length,
    launchEligibleZones: launchZones.map(z => z.id),
    blockers,
    ready: blockers.length === 0
  };
}
