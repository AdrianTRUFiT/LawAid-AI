import { applyReviewFlag } from './reviewBridge';

export function overrideReviewStatus(entry: any, body: string) {
  entry.reviewStatus = applyReviewFlag(body);
  return entry;
}
