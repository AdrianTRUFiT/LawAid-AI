import type { AuthorizationClass } from "../../authorization-gate/src/index.js";
import type { OccupancySubjectType } from "../../occupancy-registry/src/index.js";

export type SlotAssignmentDecision =
  | "ASSIGNED"
  | "REFUSED"
  | "HELD";

export interface SlotAssignmentRequest {
  assignmentId: string;
  slotId: string;
  subjectId: string;
  subjectType: OccupancySubjectType;
  claimId: string;
  requestedBy: string;
  requiredAuthorizationClass: AuthorizationClass;
  providedAuthorizationClass?: AuthorizationClass;
  continuityProtected?: boolean;
  holdAllowed?: boolean;
  window: {
    startAt: string;
    endAt?: string;
  };
  metadata?: Record<string, string>;
}

export interface SlotAssignmentArtifact {
  assignmentId: string;
  slotId: string;
  occupancyId: string;
  subjectId: string;
  subjectType: OccupancySubjectType;
  claimId: string;
  assignedBy: string;
  decision: SlotAssignmentDecision;
  slotCanonicalStatus: string;
  authorizationDecision: string;
  continuityProtected: boolean;
  createdAt: string;
  window: {
    startAt: string;
    endAt?: string;
  };
  metadata?: Record<string, string>;
}

export interface SlotAssignmentRefusal {
  refusalCode:
    | "SLOT_NOT_FOUND"
    | "SLOT_STATE_INELIGIBLE"
    | "SLOT_ALREADY_OCCUPIED"
    | "AUTHORIZATION_REQUIRED"
    | "INSUFFICIENT_AUTHORIZATION"
    | "INVALID_WINDOW"
    | "ASSIGNMENT_HELD";
  refusalReason: string;
  slotId?: string;
  assignmentId?: string;
}

export interface SlotAssignmentResult {
  ok: boolean;
  artifact: SlotAssignmentArtifact | null;
  refusal: SlotAssignmentRefusal | null;
}