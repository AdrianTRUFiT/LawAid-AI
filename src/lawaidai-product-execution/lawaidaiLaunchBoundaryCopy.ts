export const lawaidaiLaunchBoundaryCopy = {
  localLaunchCandidate: "Local Launch Candidate",
  clientSideManagement: "Client-side management workspace",
  simulatedPayment: "Payment/revenue surfaces are simulated until FundTrackerAI verification is connected.",
  activationDisplay: "Activation display is informational only. Activated Transaction State is required for unlock.",
  exportOutput: "Export output is product output only. It does not certify evidence or create legal authority.",
  evidenceBoundary: "Evidence status requires the proper external/correct certification authority.",
  actionBoundary: "Action requires the proper activation authority.",
  noLegalAdvice: "LawAidAI supports organization and management. It is not a lawyer and does not replace legal counsel."
} as const;

export function getLawAidAILaunchBoundaryCopy() {
  return lawaidaiLaunchBoundaryCopy;
}
