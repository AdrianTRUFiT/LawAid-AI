import {
  getHiddenLawAidAISurfaces,
  getLawAidAILaunchSurfaces,
  getVisibleLawAidAILaunchSurfaces,
  getWireLaterLawAidAISurfaces,
  lawaidaiProductExecutionPolicy
} from "./lawaidaiLaunchUxPolicy";

export type LawAidAILaunchUxViewModel = {
  status: "READY";
  title: string;
  subtitle: string;
  launchMode: "LOCAL_LAUNCH_CANDIDATE";
  visibleSurfaces: ReturnType<typeof getVisibleLawAidAILaunchSurfaces>;
  hiddenSurfaces: ReturnType<typeof getHiddenLawAidAISurfaces>;
  wireLaterSurfaces: ReturnType<typeof getWireLaterLawAidAISurfaces>;
  allSurfacesCount: number;
  boundaryMessages: string[];
  nextStep: string;
};

export function createLawAidAILaunchUxViewModel(): LawAidAILaunchUxViewModel {
  return {
    status: "READY",
    title: "LawAidAI Local Launch Candidate",
    subtitle:
      "Client-side management workspace. Product output is governed; payment and activation remain non-authoritative until FundTrackerAI verification.",
    launchMode: "LOCAL_LAUNCH_CANDIDATE",
    visibleSurfaces: getVisibleLawAidAILaunchSurfaces(),
    hiddenSurfaces: getHiddenLawAidAISurfaces(),
    wireLaterSurfaces: getWireLaterLawAidAISurfaces(),
    allSurfacesCount: getLawAidAILaunchSurfaces().length,
    boundaryMessages: [
      "UI is not authority.",
      "Activation display is not Activated Transaction State.",
      "Payment event is not commitment truth.",
      "FundTrackerAI verifies commitment.",
      "LawAidAI unlock/output requires Activated Transaction State.",
      "LawAidAI remains client-side management software."
    ],
    nextStep:
      "Wire this launch UX policy into the existing interface only after confirming the target component."
  };
}

export const lawAidAILaunchUxViewModelBoundary = {
  launchModeIsLocalCandidateOnly: true,
  launchModeLiteral: "LOCAL_LAUNCH_CANDIDATE",
  launchCandidateIsNotProductionDeployment: true,
  uiIsNotAuthority: true,
  paymentEventIsNotCommitmentTruth: true,
  fundTrackerAIVerifiesCommitment: true,
  lawAidAIUnlockRequiresActivatedTransactionState: true
} as const;
