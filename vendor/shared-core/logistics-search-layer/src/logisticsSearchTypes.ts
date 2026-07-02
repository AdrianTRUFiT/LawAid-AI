export type SearchObjective =
  | "fastest"
  | "cheapest"
  | "balanced";

export type RouteMode =
  | "truck"
  | "air"
  | "rail"
  | "ocean"
  | "mixed";

export interface LogisticsSearchQuery {
  queryId: string;
  origin: string;
  destination: string;
  objective: SearchObjective;
  weightKg?: number;
  volumeM3?: number;
  urgencyScore?: number;
  budgetLimit?: number;
  maxDelayRisk?: number;
  preferredModes?: RouteMode[];
  localization?: {
    countryCode?: string;
    languageCode?: string;
    currencyCode?: string;
    unitSystem?: "imperial" | "metric";
    locale?: string;
  };
}

export interface NormalizedSearchQuery {
  queryId: string;
  origin: string;
  destination: string;
  objective: SearchObjective;
  weightKg: number;
  volumeM3: number;
  urgencyScore: number;
  budgetLimit: number | null;
  maxDelayRisk: number | null;
  preferredModes: RouteMode[];
  localization: {
    countryCode: string;
    languageCode: string;
    currencyCode: string;
    unitSystem: "imperial" | "metric";
    locale: string;
  };
}

export interface CandidateRoute {
  routeId: string;
  origin: string;
  destination: string;
  mode: RouteMode;
  estimatedHours: number;
  estimatedCost: number;
  delayRiskScore: number;
  checkpointBurdenScore: number;
  holdNodeBenefitScore: number;
  protectionFitScore: number;
  netValueScore: number;
}

export interface RankedRoute extends CandidateRoute {
  rank: number;
  totalScore: number;
  tags: string[];
  rankReason: string;
}

export interface LogisticsSearchResponse {
  queryId: string;
  objective: SearchObjective;
  fastestRoute: RankedRoute;
  cheapestRoute: RankedRoute;
  bestBalancedRoute: RankedRoute;
  rankedRoutes: RankedRoute[];
  generatedAt: string;
}