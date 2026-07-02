export const defaultFailureAnalyzer = (failureType, description) => {
    const normalized = `${failureType} ${description}`.toLowerCase();
    if (normalized.includes("type") || normalized.includes("contract")) {
        return {
            likelyCause: "contract_mismatch",
            findings: ["Type or contract mismatch detected."],
            recommendedAction: "Add or tighten shared contract definitions."
        };
    }
    if (normalized.includes("route") || normalized.includes("path")) {
        return {
            likelyCause: "routing_error",
            findings: ["Incorrect route or integration path detected."],
            recommendedAction: "Correct route registration and adapter usage."
        };
    }
    return {
        likelyCause: "general_runtime_instability",
        findings: ["General runtime or workflow instability detected."],
        recommendedAction: "Apply bounded patch and retest."
    };
};
//# sourceMappingURL=fact2Analyzer.js.map