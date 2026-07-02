import type { DistrictPacket } from "../../district-adapters/src/index.js";
import type { OperatorRouteResult } from "../../operator-routing-layer/src/index.js";

export interface LawAidAIBindingViewModel {
  routeDecision: OperatorRouteResult["decision"];
  routeReason: string;
  matterOpen: boolean;
  sourceLiveRecordId: string | null;
  ownerId: string | null;
  merchantId: string | null;
  evidenceAnchorIds: string[];
  displaySummary: string;
}

export interface TravelFlowBindingViewModel {
  routeDecision: OperatorRouteResult["decision"];
  routeReason: string;
  tripReady: boolean;
  sourceLiveRecordId: string | null;
  ownerId: string | null;
  merchantId: string | null;
  bookingAnchorIds: string[];
  displaySummary: string;
}

export interface GenericBindingViewModel {
  routeDecision: OperatorRouteResult["decision"];
  routeReason: string;
  active: boolean;
  sourceLiveRecordId: string | null;
  tags: string[];
  displaySummary: string;
}

export interface AppBindingEnvelope<TViewModel> {
  appKey: "LAWAIDAI" | "TRAVELFLOW" | "GENERIC";
  bound: boolean;
  reason: string;
  routeDecision: OperatorRouteResult["decision"];
  packet: DistrictPacket | null;
  viewModel: TViewModel;
}