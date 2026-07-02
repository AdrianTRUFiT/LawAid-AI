export function runConsequenceGate(input) {
  const verificationFailures = [];

  if (!input?.presence) verificationFailures.push("MISSING_PRESENCE");
  if (!input?.source) verificationFailures.push("MISSING_SOURCE");
  if (!input?.integrity) verificationFailures.push("MISSING_INTEGRITY");
  if (!input?.state) verificationFailures.push("MISSING_STATE");

  if (verificationFailures.length) {
    return { allowed: false, stage: "VERIFICATION", failures: verificationFailures };
  }

  const authorizationFailures = [];

  if (!input?.authorizedBy) authorizationFailures.push("MISSING_AUTHORIZATION_AUTHORITY");
  if (!input?.authorizationScope) authorizationFailures.push("MISSING_AUTHORIZATION_SCOPE");
  if (!input?.mayCreateConsequence) authorizationFailures.push("CONSEQUENCE_NOT_AUTHORIZED");

  if (authorizationFailures.length) {
    return { allowed: false, stage: "AUTHORIZATION", failures: authorizationFailures };
  }

  const consequenceFailures = [];

  if (!input?.consequenceType) consequenceFailures.push("MISSING_CONSEQUENCE_TYPE");
  if (!input?.recordToCreate) consequenceFailures.push("MISSING_RECORD_TO_CREATE");
  if (!input?.continuityTarget) consequenceFailures.push("MISSING_CONTINUITY_TARGET");

  if (consequenceFailures.length) {
    return { allowed: false, stage: "CONSEQUENCE", failures: consequenceFailures };
  }

  return { allowed: true, stage: "CONSEQUENCE_READY", message: "Verified, authorized, consequence-ready." };
}
