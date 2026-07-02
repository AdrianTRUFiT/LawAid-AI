import type {
  EcosystemWalletProfile,
  JurisdictionPolicy,
  RailCapability,
  RealValuePrice,
  ValueConversionRate,
} from "../../ecosystem-value/src/index.js";
import type { DistrictType, DistrictPacket } from "../../district-adapters/src/index.js";

export type RoutingDecision =
  | "ROUTED"
  | "REFUSED_COMPLIANCE"
  | "REFUSED_SETTLEMENT"
  | "REFUSED_ACTIVATION"
  | "REFUSED_RECEIVING"
  | "REFUSED_DISTRICT"
  | "REFUSED_POLICY";

export interface OperatorRoutePolicy {
  policyId: string;
  routeName: string;
  districtType: DistrictType;
  requireComplianceAttestation: boolean;
  requireRelease: boolean;
  receivingEnvironment: string;
}

export interface OperatorRouteInput {
  wallet: EcosystemWalletProfile;
  price: RealValuePrice;
  jurisdictionPolicy: JurisdictionPolicy;
  rails: RailCapability[];
  rates: ValueConversionRate[];
  hasKyc: boolean;
  districtType: DistrictType;
  evidenceAnchorIds?: string[];
  bookingAnchorIds?: string[];
  genericTags?: string[];
}

export interface OperatorRoutingSnapshot {
  complianceTrusted: boolean;
  complianceReleased: boolean;
  settlementTrusted: boolean;
  activationTrusted: boolean;
  received: boolean;
  districtAccepted: boolean;
  districtType: DistrictType;
}

export interface OperatorRouteResult {
  routed: boolean;
  decision: RoutingDecision;
  reason: string;
  districtPacket: DistrictPacket | null;
  snapshot: OperatorRoutingSnapshot;
}