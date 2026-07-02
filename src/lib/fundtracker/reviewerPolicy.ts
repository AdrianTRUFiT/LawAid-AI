export interface ReviewerPolicy {
  reviewerId: string;
  role: "analyst" | "supervisor" | "admin";
  canApprove: boolean;
  canReject: boolean;
}

const reviewerPolicies: Record<string, ReviewerPolicy> = {
  reviewer_alpha: {
    reviewerId: "reviewer_alpha",
    role: "supervisor",
    canApprove: true,
    canReject: true,
  },
  reviewer_beta: {
    reviewerId: "reviewer_beta",
    role: "analyst",
    canApprove: false,
    canReject: true,
  },
  reviewer_http_alpha: {
    reviewerId: "reviewer_http_alpha",
    role: "admin",
    canApprove: true,
    canReject: true,
  },
  reviewer_http_beta: {
    reviewerId: "reviewer_http_beta",
    role: "supervisor",
    canApprove: false,
    canReject: true,
  },
  reviewer_block9: {
    reviewerId: "reviewer_block9",
    role: "supervisor",
    canApprove: false,
    canReject: true,
  },
};

export function getReviewerPolicy(reviewerId: string): ReviewerPolicy | null {
  return reviewerPolicies[reviewerId] ?? null;
}

export function canReviewerApprove(reviewerId: string): boolean {
  const policy = getReviewerPolicy(reviewerId);
  return Boolean(policy?.canApprove);
}

export function canReviewerReject(reviewerId: string): boolean {
  const policy = getReviewerPolicy(reviewerId);
  return Boolean(policy?.canReject);
}

export function listReviewerPolicies(): ReviewerPolicy[] {
  return Object.values(reviewerPolicies);
}
