import { runLogisticsSearch } from "../src/index.js";

const result = runLogisticsSearch({
  queryId: "search_cheapest_001",
  origin: "Dallas",
  destination: "Houston",
  objective: "cheapest",
});

if (!result.cheapestRoute || result.cheapestRoute.estimatedCost > result.bestBalancedRoute.estimatedCost + 1000) {
  throw new Error("Expected cheapest route.");
}

console.log("SMOKE_LOGISTICS_SEARCH_CHEAPEST=PASS");