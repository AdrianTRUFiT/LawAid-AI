export function verificationCheck(input) {
  const failures = [];

  if (!input?.presence) failures.push("MISSING_PRESENCE");
  if (!input?.source) failures.push("MISSING_SOURCE");
  if (!input?.integrity) failures.push("MISSING_INTEGRITY");
  if (!input?.state) failures.push("MISSING_STATE");

  return {
    passed: failures.length === 0,
    failures
  };
}
