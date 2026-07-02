export type AuthorityMarker =
  | "working"
  | "review_required"
  | "human_approved"
  | "verified";

export interface AuthorityStamped {
  authorityMarker: AuthorityMarker;
  authorityNote?: string;
}
