export function requireFields(recordLabel, record, requiredFields) {
    return requiredFields.filter((fieldName) => {
        const value = record[fieldName];
        return value === undefined || value === null || value === "";
    });
}
export function assertRequiredFields(recordLabel, record, requiredFields) {
    const missing = requireFields(recordLabel, record, requiredFields);
    if (missing.length > 0) {
        throw new Error(`${recordLabel} is missing required fields: ${missing.join(", ")}`);
    }
}
//# sourceMappingURL=transitionGuards.js.map