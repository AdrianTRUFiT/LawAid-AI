export const REFUSAL_REASONS = [
    "missing_fields",
    "illegal_route",
    "unknown_domain",
    "unknown_artifact_type",
    "authority_violation"
];
export function accept() {
    return { accepted: true };
}
export function refuse(reason, details) {
    return {
        accepted: false,
        reason,
        details
    };
}
//# sourceMappingURL=refusalRules.js.map