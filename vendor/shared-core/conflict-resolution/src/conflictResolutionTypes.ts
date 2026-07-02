import type { AuthorizationClass } from "../../authorization-gate/src/index.js";
import type { OccupancySubjectType } from "../../occupancy-registry/src/index.js";
import type { SlotAssignmentRequest } from "../../slot-assignment/src/index.js";

export type ConflictDecision =
  | "NO_CONFLICT"
  | "KEEP_EXISTING"
  | "REPLACE_EXISTING"
  | "HOLD_CANDIDATE"
  | "REFUSE_CANDIDATE";

export type ConflictReasonCode =
  | "NO_ACTIVE_OCCUPANCY"
  | "SAME_CLAIM"
  | "LOWER_PRIORITY"
  | "HIGHER_PRIORITY"
  | "CONTINUITY_PROTECTED_EXISTING"
  | "AUTHORIZATION_INSUFFICIENT"
  | "INVALID_SLOT"
  | "EQUAL_PRIORITY_DEFAULT_KEEP"
  | "HELD_EXISTING_REPLACEABLE";

export interface ConflictCandidateRequest extends SlotAssignmentRequest {
  priorityScore?: number;
}

export interface ConflictExistingOccupancyView {
  occupancyId: string;
  slotId: string;
  subjectId: string;
  subjectType: OccupancySubjectType;
  claimId: string;
  occupancyState: "ACTIVE" | "HELD" | "RELEASED" | "EXPIRED" | "CANCELLED";
  continuityProtected: boolean;
}

export interface ConflictResolutionArtifact {
  resolutionId: string;
  slotId: string;
  decision: ConflictDecision;
  reasonCode: ConflictReasonCode;
  existingOccupancyId?: string;
  candidateAssignmentId: string;
  winningClaimId: string;
  losingClaimId?: string;
  existingPriorityScore?: number;
  candidatePriorityScore: number;
  createdAt: string;
  notes: string[];
}

export interface ConflictResolutionRefusal {
  refusalCode:
    | "INVALID_SLOT"
    | "AUTHORIZATION_INSUFFICIENT"
    | "CANDIDATE_REFUSED";
  refusalReason: string;
  slotId?: string;
  resolutionId?: string;
}

export interface ConflictResolutionResult {
  ok: boolean;
  artifact: ConflictResolutionArtifact | null;
  refusal: ConflictResolutionRefusal | null;
}

export interface ConflictResolutionInput {
  resolutionId: string;
  candidate: ConflictCandidateRequest;
  existingOccupancy: ConflictExistingOccupancyView | null;
  slotExists: boolean;
  candidateAuthorizationClass?: AuthorizationClass;
}