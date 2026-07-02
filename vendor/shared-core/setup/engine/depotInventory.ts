import type { AidDepotItem } from "../contracts/setupContracts";

export const AID_DEPOT_INVENTORY: AidDepotItem[] = [
  {
    itemId: "AID-PAI-SAFE-CONSUMER-SHIELD",
    name: "PAI-SAFE Consumer Shield Setup",
    category: "transaction_safety",
    allowedUserTypes: ["consumer", "bank_customer"],
    deliverySurfaces: ["PAID_DASHBOARD", "MOBILE_GUIDE"],
    requiresProofPath: true,
    active: true
  },
  {
    itemId: "AID-TPS-MERCHANT-PROOF",
    name: "TPS Merchant Proof Package",
    category: "merchant_proof",
    allowedUserTypes: ["merchant", "business"],
    deliverySurfaces: ["MERCHANT_PORTAL", "WEB_DASHBOARD"],
    requiresProofPath: true,
    active: true
  },
  {
    itemId: "AID-LAWAIDAI-CLIENT-SETUP",
    name: "LawAidAI Client Management Setup",
    category: "legal_client_management",
    allowedUserTypes: ["consumer", "pro_se_user"],
    deliverySurfaces: ["WEB_DASHBOARD", "PAID_DASHBOARD"],
    requiresProofPath: false,
    active: true
  },
  {
    itemId: "AID-TRAVELFLOW-TRIP-SETUP",
    name: "TravelFlowAI Trip Setup",
    category: "travel_continuity",
    allowedUserTypes: ["consumer", "traveler", "business"],
    deliverySurfaces: ["MOBILE_GUIDE", "WEB_DASHBOARD"],
    requiresProofPath: true,
    active: true
  }
];