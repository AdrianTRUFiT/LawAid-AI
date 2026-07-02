import {
  getReviewQueue,
} from "../../lib/fundtracker";
import {
  getApprovedReviewRecords,
} from "../../lib/fundtracker/approvedReviewStore";
import {
  getReviewEventHistory,
} from "../../lib/fundtracker/reviewEventHistory";
import {
  listReviewerPolicies,
} from "../../lib/fundtracker/reviewerPolicy";

export function listPendingReviewsApi() {
  return {
    ok: true,
    artifactType: "PendingReviewList",
    payload: getReviewQueue().filter((item) => item.status === "pending_review"),
  };
}

export function listApprovedReviewsApi() {
  return {
    ok: true,
    artifactType: "ApprovedReviewList",
    payload: getApprovedReviewRecords(),
  };
}

export function listRejectedReviewsApi() {
  return {
    ok: true,
    artifactType: "RejectedReviewList",
    payload: getReviewQueue().filter((item) => item.status === "rejected"),
  };
}

export function listReviewEventHistoryApi() {
  return {
    ok: true,
    artifactType: "ReviewEventHistory",
    payload: getReviewEventHistory(),
  };
}

export function listReviewerPoliciesApi() {
  return {
    ok: true,
    artifactType: "ReviewerPolicyList",
    payload: listReviewerPolicies(),
  };
}
