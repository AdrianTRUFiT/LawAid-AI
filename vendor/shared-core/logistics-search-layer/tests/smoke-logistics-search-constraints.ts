import { runLogisticsSearch } from "../src/index.js";

const result = runLogisticsSearch({
  queryId: "search_constraints_001",
  origin: "New York",
  destination: "Boston",
  objective: "balanced",
  budgetLimit: 250,
  maxDelayRisk: 35,
  preferredModes: ["rail", "mixed"],
});

if (!result.rankedRoutes.every((x) => x.mode === "rail" || x.mode === "mixed")) {
  throw new Error("Expected preferred mode filtering.");
}

if (!result.rankedRoutes.every((x) => x.estimatedCost <= 250 || result.rankedRoutes.length > 0)) {
  throw new Error("Expected constrained result set.");
}

console.log("SMOKE_LOGISTICS_SEARCH_CONSTRAINTS=PASS");