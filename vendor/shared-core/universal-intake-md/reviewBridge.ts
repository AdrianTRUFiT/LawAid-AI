import { requiresReview } from './reviewClassifier';

export function applyReviewFlag(body: string) {
  return requiresReview(body) ? 'NEEDS_REVIEW' : 'AUTO_APPROVED';
}
