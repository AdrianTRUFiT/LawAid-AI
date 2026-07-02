import { createArtifactId } from "../artifacts/artifactFactory.js";
import { defaultFailureAnalyzer } from "./fact2Analyzer.js";
import { verifyTestedRecord } from "./fact2Verifier.js";
export function createFailureRecord(input) {
    return {
        failureId: createArtifactId("failure"),
        sourceDomain: input.sourceDomain,
        relatedArtifactId: input.relatedArtifactId,
        failureType: input.failureType,
        description: input.description,
        createdAt: new Date().toISOString()
    };
}
export function createAnalysisRecord(failure) {
    const analyzed = defaultFailureAnalyzer(failure.failureType, failure.description);
    return {
        analysisId: createArtifactId("analysis"),
        failureId: failure.failureId,
        findings: analyzed.findings,
        likelyCause: analyzed.likelyCause,
        recommendedAction: analyzed.recommendedAction,
        createdAt: new Date().toISOString()
    };
}
export function createCorrectionRecord(analysis, changedFiles = []) {
    return {
        correctionId: createArtifactId("correction"),
        analysisId: analysis.analysisId,
        changedFiles,
        correctionType: analysis.likelyCause === "routing_error" ? "reroute" : "patch",
        createdAt: new Date().toISOString()
    };
}
export function createTestedRecord(correction, verificationMethod = ["manual_review"]) {
    const tested = {
        testedId: createArtifactId("tested"),
        correctionId: correction.correctionId,
        verificationMethod,
        result: "passed",
        recordedAt: new Date().toISOString()
    };
    if (!verifyTestedRecord(tested)) {
        throw new Error("Invalid TestedRecord produced by FACT2.");
    }
    return tested;
}
export function processFact2(input) {
    const failure = createFailureRecord(input);
    const analysis = createAnalysisRecord(failure);
    const correction = createCorrectionRecord(analysis, input.changedFiles ?? []);
    const tested = createTestedRecord(correction, input.verificationMethod ?? ["manual_review"]);
    return {
        failure,
        analysis,
        correction,
        tested
    };
}
//# sourceMappingURL=fact2Engine.js.map