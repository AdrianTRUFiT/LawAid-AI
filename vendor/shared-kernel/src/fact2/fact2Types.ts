export type FailureAnalyzer = (
  failureType: string,
  description: string
) => {
  likelyCause: string;
  findings: string[];
  recommendedAction: string;
};
