export type OccupancyState =
  | "ACTIVE"
  | "HELD"
  | "RELEASED"
  | "EXPIRED"
  | "CANCELLED";

export type OccupancySubjectType =
  | "person"
  | "child"
  | "family"
  | "animal"
  | "package"
  | "product"
  | "service"
  | "digital_file"
  | "payment_commitment"
  | "reservation"
  | "contractor"
  | "delivery"
  | "repair_process"
  | "workflow_state"
  | "protected_record"
  | "generic";

export interface OccupancyWindow {
  startAt: string;
  endAt?: string;
}

export interface OccupancyRecord {
  occupancyId: string;
  slotId: string;
  subjectId: string;
  subjectType: OccupancySubjectType;
  claimId: string;
  occupancyState: OccupancyState;
  continuityProtected: boolean;
  window: OccupancyWindow;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: Record<string, string>;
}

export interface OccupancySnapshot {
  totalOccupancies: number;
  activeCount: number;
  heldCount: number;
  releasedCount: number;
  expiredCount: number;
  cancelledCount: number;
}

export interface OccupancyRefusal {
  refusalCode:
    | "DUPLICATE_OCCUPANCY"
    | "SLOT_ALREADY_OCCUPIED"
    | "OCCUPANCY_NOT_FOUND"
    | "INVALID_STATE_TRANSITION"
    | "INVALID_WINDOW"
    | "INVALID_SLOT_REFERENCE";
  refusalReason: string;
  slotId?: string;
  occupancyId?: string;
}

export interface OccupancyResult<T> {
  ok: boolean;
  value: T | null;
  refusal: OccupancyRefusal | null;
}