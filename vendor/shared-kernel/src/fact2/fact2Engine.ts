import { createArtifactId } from "../artifacts/artifactFactory.js";
import { defaultFailureAnalyzer } from "./fact2Analyzer.js";
import { verifyTestedRecord } from "./fact2Verifier.js";
import type {
  AnalysisRecord,
  CorrectionRecord,
  Fact2Input,
  Fact2Result,
  FailureRecord,
  TestedRecord
} from "./fact2Contracts.js";

export function createFailureRecord(input: Fact2Input): FailureRecord {
  return {
    failureId: createArtifactId("failure"),
    sourceDomain: input.sourceDomain,
    relatedArtifactId: input.relatedArtifactId,
    failureType: input.failureType,
    description: input.description,
    createdAt: new Date().toISOString()
  };
}

export function createAnalysisRecord(failure: FailureRecord): AnalysisRecord {
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

export function createCorrectionRecord(
  analysis: AnalysisRecord,
  changedFiles: string[] = []
): CorrectionRecord {
  return {
    correctionId: createArtifactId("correction"),
    analysisId: analysis.analysisId,
    changedFiles,
    correctionType: analysis.likelyCause === "routing_error" ? "reroute" : "patch",
    createdAt: new Date().toISOString()
  };
}

export function createTestedRecord(
  correction: CorrectionRecord,
  verificationMethod: string[] = ["manual_review"]
): TestedRecord {
  const tested: TestedRecord = {
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

export function processFact2(input: Fact2Input): Fact2Result {
  const failure = createFailureRecord(input);
  const analysis = createAnalysisRecord(failure);
  const correction = createCorrectionRecord(analysis, input.changedFiles ?? []);
  const tested = createTestedRecord(
    correction,
    input.verificationMethod ?? ["manual_review"]
  );

  return {
    failure,
    analysis,
    correction,
    tested
  };
}
