import {
  buildAllTravelDashboardProfiles,
  PAI_SAFE_RAIL,
  CURRENCY_INTELLIGENCE
} from "../src/travelPaiSafeVerticalProfile.mjs";

const results = buildAllTravelDashboardProfiles();

if (PAI_SAFE_RAIL.role !== "verified_payment_safety_rail") process.exit(1);
if (!CURRENCY_INTELLIGENCE.enabled) process.exit(1);
if (results.some(r => !r.accepted)) process.exit(1);
if (results.length !== 6) process.exit(1);
if (!results.find(r => r.dashboardType === "CRUISE_LINE")) process.exit(1);

console.log("TRAVEL PAI-SAFE VERTICAL PROFILE PASS");
console.log("Profiles created:", results.length);
console.log("Dashboard types:", results.map(r => r.dashboardType).join(", "));
console.log("Currency Intelligence:", CURRENCY_INTELLIGENCE.role);
console.log("Boundary:", results[0].outputBoundary);
console.log("Rail:", PAI_SAFE_RAIL.name, PAI_SAFE_RAIL.expansion);
