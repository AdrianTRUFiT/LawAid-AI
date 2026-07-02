import { runLogisticsSearch } from "../src/index.js";

const result = runLogisticsSearch({
  queryId: "search_fastest_001",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "fastest",
});

if (!result.fastestRoute || result.fastestRoute.estimatedHours > result.bestBalancedRoute.estimatedHours + 100) {
  throw new Error("Expected fastest route.");
}

console.log("SMOKE_LOGISTICS_SEARCH_FASTEST=PASS");