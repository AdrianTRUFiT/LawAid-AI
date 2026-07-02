export function consequenceCheck(input) {
  const failures = [];

  if (!input?.consequenceType) failures.push("MISSING_CONSEQUENCE_TYPE");
  if (!input?.recordToCreate) failures.push("MISSING_RECORD_TO_CREATE");
  if (!input?.continuityTarget) failures.push("MISSING_CONTINUITY_TARGET");

  return {
    passed: failures.length === 0,
    failures
  };
}
