import type { DecisionTypeSelector, PatternClassifier } from "./pc2Types.js";
import type { PainSeverity } from "./pc2Contracts.js";
export declare function classifySeverity(description: string): PainSeverity;
export declare const defaultPatternClassifier: PatternClassifier;
export declare const defaultDecisionTypeSelector: DecisionTypeSelector;
