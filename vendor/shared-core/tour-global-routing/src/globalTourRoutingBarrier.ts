import {
  TourDecision,
  TourExecutionRequest,
} from "./tourContracts";
import { enforceTourExecutionRevalidation } from "./tourGate";

export interface GovernedRoutingResult {
  routeId: string;
  routingStatus: "ROUTE_EXECUTED" | "ROUTE_HELD" | "ROUTE_BLOCKED";
  tourDecision: TourDecision;
  consequenceReached: boolean;
  message: string;
}

export function routeThroughMandatoryTourBarrier(
  request: TourExecutionRequest
): GovernedRoutingResult {
  const tourDecision = enforceTourExecutionRevalidation(request);

  if (tourDecision.outcome === "EXECUTION_ALLOWED") {
    return {
      routeId: request.routeId,
      routingStatus: "ROUTE_EXECUTED",
      tourDecision,
      consequenceReached: true,
      message: "Route executed only after mandatory universal TOUR revalidation.",
    };
  }

  if (tourDecision.outcome === "EXECUTION_HELD") {
    return {
      routeId: request.routeId,
      routingStatus: "ROUTE_HELD",
      tourDecision,
      consequenceReached: false,
      message: "Route held by mandatory TOUR barrier. Consequence not reached.",
    };
  }

  return {
    routeId: request.routeId,
    routingStatus: "ROUTE_BLOCKED",
    tourDecision,
    consequenceReached: false,
    message: "Route blocked by mandatory TOUR barrier. Consequence not reached.",
  };
}
