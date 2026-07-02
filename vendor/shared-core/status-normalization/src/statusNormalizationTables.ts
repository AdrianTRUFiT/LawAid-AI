import type { CanonicalStatus, StatusDomain } from "./statusNormalizationTypes.js";

type DomainMap = Record<string, CanonicalStatus>;

export const STATUS_TABLES: Record<StatusDomain, DomainMap> = {
  slot: {
    open: "OPEN",
    available: "OPEN",
    reserved: "RESERVED",
    held: "RESERVED",
    pending: "RESERVED",
    occupied: "OCCUPIED",
    active: "OCCUPIED",
    blocked: "BLOCKED",
    unavailable: "BLOCKED",
    restricted: "BLOCKED",
    authorization_required: "AUTHORIZATION_REQUIRED",
    approval_required: "AUTHORIZATION_REQUIRED",
    released: "RELEASED",
  },
  booking: {
    booking_ready: "BOOKING_READY",
    ready: "BOOKING_READY",
    reserved: "RESERVED",
    blocked: "BLOCKED",
    refused: "REFUSED",
  },
  agreement: {
    sealed: "SEALED",
    confirmed: "SEALED",
    refused: "REFUSED",
  },
  commitment: {
    commitment_ready: "COMMITMENT_READY",
    committed: "COMMITMENT_READY",
    refused: "REFUSED",
  },
  transport: {
    open: "OPEN",
    in_transit: "IN_TRANSIT",
    active: "IN_TRANSIT",
    blocked: "BLOCKED",
    refused: "REFUSED",
    released: "RELEASED",
  },
  generic: {
    open: "OPEN",
    reserved: "RESERVED",
    occupied: "OCCUPIED",
    blocked: "BLOCKED",
    authorization_required: "AUTHORIZATION_REQUIRED",
    sealed: "SEALED",
    booking_ready: "BOOKING_READY",
    commitment_ready: "COMMITMENT_READY",
    in_transit: "IN_TRANSIT",
    released: "RELEASED",
    refused: "REFUSED",
    unknown: "UNKNOWN",
  },
};