import { createArtifactId } from "../artifacts/artifactFactory.js";
import {
  defaultDecisionTypeSelector,
  defaultPatternClassifier,
  classifySeverity
} from "./pc2Classifier.js";
import type {
  ClarityRecord,
  CodeIntent,
  PainRecord,
  PatternRecord,
  Pc2Input,
  Pc2Result
} from "./pc2Contracts.js";

export function createPainRecord(input: Pc2Input): PainRecord {
  return {
    painId: createArtifactId("pain"),
    sourceDomain: input.sourceDomain,
    description: input.description,
    severity: classifySeverity(input.description),
    createdAt: new Date().toISOString()
  };
}

export function createPatternRecord(
  pain: PainRecord,
  repeatedSignals: string[] = []
): PatternRecord {
  const classification = defaultPatternClassifier(pain.description, repeatedSignals);

  return {
    patternId: createArtifactId("pattern"),
    painId: pain.painId,
    repeatedSignals,
    inferredPattern: classification.inferredPattern,
    confidence: classification.confidence,
    createdAt: new Date().toISOString()
  };
}

export function createClarityRecord(
  pattern: PatternRecord,
  description: string
): ClarityRecord {
  return {
    clarityId: createArtifactId("clarity"),
    patternId: pattern.patternId,
    clarifiedProblem: `Clarified from ${pattern.inferredPattern}: ${description}`,
    acceptedUnknowns: [],
    nextDecisionType: defaultDecisionTypeSelector(description),
    createdAt: new Date().toISOString()
  };
}

export function createCodeIntent(
  clarity: ClarityRecord,
  targetModule: string,
  targetFiles: string[] = []
): CodeIntent {
  return {
    codeIntentId: createArtifactId("code-intent"),
    clarityId: clarity.clarityId,
    targetModule,
    targetFiles,
    actionType: clarity.nextDecisionType === "no_build" ? "refuse" : "update",
    rationale: `Generated from ${clarity.nextDecisionType} for ${targetModule}`,
    createdAt: new Date().toISOString()
  };
}

export function processPc2(input: Pc2Input): Pc2Result {
  const pain = createPainRecord(input);
  const pattern = createPatternRecord(pain, input.repeatedSignals ?? []);
  const clarity = createClarityRecord(pattern, input.description);
  const codeIntent = createCodeIntent(
    clarity,
    input.targetModule,
    input.targetFiles ?? []
  );

  return {
    pain,
    pattern,
    clarity,
    codeIntent
  };
}
