import { canWriteToEnvironment, launchRegistryStatus } from './environmentPolicy';

const checks = [
  {
    name: "DEV_PROPRIETARY_WRITE",
    result: canWriteToEnvironment("DEV_RUNTIME", "HARD", "proprietary")
  },
  {
    name: "MIRROR_SEALED_PRIVATE_REFUSAL",
    result: canWriteToEnvironment("GOOGLE_MIRROR", "MIRROR_SYNC", "sealed_private")
  },
  {
    name: "DISPOSABLE_AUTHORITY_REFUSAL",
    result: canWriteToEnvironment("MOBILE_PRESENCE", "CACHE_ONLY", "sealed_private")
  },
  {
    name: "PORTABLE_PRIVATE_WRITE",
    result: canWriteToEnvironment("PORTABLE_VAULT", "MARK_CUSTODY", "sealed_private")
  }
];

console.log("AIVA_ENVIRONMENT_REGISTRY_V1=START");

for (const c of checks) {
  console.log("----");
  console.log(c.name);
  console.log(c.result);
}

console.log("----");
console.log("REGISTRY_STATUS");
console.log(launchRegistryStatus());

console.log("AIVA_ENVIRONMENT_REGISTRY_V1=COMPLETE");
