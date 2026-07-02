import {
  getPersistedReviewGovernanceState,
  resetPersistedReviewGovernanceState,
} from "../../lib/fundtracker/reviewPersistence";

export function getReviewGovernanceStateApi() {
  return {
    ok: true,
    artifactType: "ReviewGovernanceState",
    payload: getPersistedReviewGovernanceState(),
  };
}

export function resetReviewGovernanceStateApi() {
  resetPersistedReviewGovernanceState();

  return {
    ok: true,
    artifactType: "ReviewGovernanceStateReset",
    payload: {
      reset: true,
    },
  };
}
