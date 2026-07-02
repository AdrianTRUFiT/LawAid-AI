import type { OpeState } from "../../types/ope";

export const initialOpeState: OpeState = {
  consumer: {
    id: "consumer_001",
    name: "Adrian TRUFiT",
    budget: 250,
    remainingBudget: 250,
    preferences: ["window_seating", "family_friendly", "premium_service"],
    status: "active",
  },
  merchant: {
    id: "merchant_001",
    name: "Harbor View Dining",
    category: "travel_merchant",
    availability: "4 tables available",
    riskFlags: [],
    fulfilledCount: 0,
    revenueCents: 0,
  },
  operator: {
    id: "operator_001",
    name: "Environment Operator",
    anomalyCount: 0,
    settledCents: 0,
    allocationCents: 0,
  },
  experiences: [
    {
      id: "exp_001",
      label: "Priority Dining Reservation",
      merchantId: "merchant_001",
      priceCents: 8900,
      category: "dining",
      requiresApproval: true,
    },
    {
      id: "exp_002",
      label: "Family Upgrade Package",
      merchantId: "merchant_001",
      priceCents: 12900,
      category: "upgrade",
      requiresApproval: true,
    },
  ],
  currentStage: "entered",
  events: [],
};
