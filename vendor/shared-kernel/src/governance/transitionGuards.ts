export function requireFields(
  recordLabel: string,
  record: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  return requiredFields.filter((fieldName) => {
    const value = record[fieldName];
    return value === undefined || value === null || value === "";
  });
}

export function assertRequiredFields(
  recordLabel: string,
  record: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requireFields(recordLabel, record, requiredFields);
  if (missing.length > 0) {
    throw new Error(
      `${recordLabel} is missing required fields: ${missing.join(", ")}`
    );
  }
}
