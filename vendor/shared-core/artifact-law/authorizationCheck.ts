export function authorizationCheck(input) {
  const failures = [];

  if (!input?.authorizedBy) failures.push("MISSING_AUTHORIZATION_AUTHORITY");
  if (!input?.authorizationScope) failures.push("MISSING_AUTHORIZATION_SCOPE");
  if (!input?.mayCreateConsequence) failures.push("CONSEQUENCE_NOT_AUTHORIZED");

  return {
    passed: failures.length === 0,
    failures
  };
}
