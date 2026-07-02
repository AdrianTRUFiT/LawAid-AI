export type PatternClassifier = (description: string, repeatedSignals: string[]) => {
    inferredPattern: string;
    confidence: number;
};
export type DecisionTypeSelector = (description: string) => "file_change" | "workflow_change" | "contract_change" | "ui_change" | "no_build";
