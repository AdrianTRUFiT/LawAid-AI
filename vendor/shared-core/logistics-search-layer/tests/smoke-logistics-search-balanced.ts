import { runLogisticsSearch } from "../src/index.js";

const result = runLogisticsSearch({
  queryId: "search_balanced_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "balanced",
});

if (!result.bestBalancedRoute || result.rankedRoutes[0].routeId !== result.bestBalancedRoute.routeId) {
  throw new Error("Expected best balanced route to rank first.");
}

console.log("SMOKE_LOGISTICS_SEARCH_BALANCED=PASS");