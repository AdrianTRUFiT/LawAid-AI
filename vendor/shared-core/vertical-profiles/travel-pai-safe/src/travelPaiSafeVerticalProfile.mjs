import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/DEV/AIVA/shared-core/vertical-profiles/travel-pai-safe";
const recordsDir = path.join(ROOT, "records");
fs.mkdirSync(recordsDir, { recursive: true });

export const PAI_SAFE_RAIL = {
  name: "PAI-SAFE",
  expansion: "Pay Securely",
  role: "verified_payment_safety_rail",
  vap: ["VERIFY", "AUTHORIZE", "PROOF"],
  boundary: "rail_not_wallet_first_product"
};

export const TRAVEL_DASHBOARD_TYPES = {
  TOUR_OPERATOR: "TOUR_OPERATOR",
  AIRLINE: "AIRLINE",
  HOTEL: "HOTEL",
  CAR_RENTAL: "CAR_RENTAL",
  TRAVEL_CONGLOMERATE: "TRAVEL_CONGLOMERATE",
  CRUISE_LINE: "CRUISE_LINE"
};

export const CURRENCY_INTELLIGENCE = {
  enabled: true,
  role: "traveler_currency_protection",
  boundary: "profile_capability_only_no_live_fx_integration",
  capabilities: [
    "location_based_currency_options",
    "merchant_requested_currency_capture",
    "best_available_rate_selection",
    "conversion_rate_proof_record",
    "traveler_authorization_before_payment",
    "post_transaction_currency_proof"
  ],
  doctrineLine:
    "The traveler should not have to trust the merchant's conversion blindly. PAI-SAFE should verify, compare, authorize, and preserve the currency decision before payment consequence."
};

export const DASHBOARD_PROFILES = {
  TOUR_OPERATOR: [
    "bookings","deposits","waivers","add_ons","cancellations","group_payments",
    "guide_vendor_payouts","refund_rules","customer_proof_records","loyalty_continuity",
    "currency_conversion"
  ],
  AIRLINE: [
    "ticket_payments","upgrades","baggage","cancellations","vouchers","loyalty_points",
    "refunds","disruption_compensation","cross_border_payment_proof",
    "kiosk_mobile_continuity","currency_conversion"
  ],
  HOTEL: [
    "reservations","deposits","room_holds","incidentals","upgrades","cancellations",
    "no_show_rules","loyalty_rewards","guest_payment_history","proof_backed_disputes",
    "currency_conversion"
  ],
  CAR_RENTAL: [
    "reservation_deposits","insurance_add_ons","damage_holds","tolls","fuel_charges",
    "late_returns","refunds","customer_authorization_proof","charge_dispute_defense",
    "currency_conversion"
  ],
  TRAVEL_CONGLOMERATE: [
    "airlines","hotels","rentals","loyalty","kiosks","mobile_apps","web_booking",
    "call_centers","partner_operators","refund_centers","customer_support",
    "currency_conversion"
  ],
  CRUISE_LINE: [
    "reservations","deposits","cabin_upgrades","excursion_bookings","drink_packages",
    "dining_packages","port_fees","onboard_spend","casino_or_restricted_spend_flags",
    "cancellations","refunds","travel_credits","loyalty_status","family_group_payments",
    "vendor_excursion_payouts","charge_dispute_proof","passenger_authorization_records",
    "currency_conversion","port_location_currency_options","best_available_rate_capture"
  ]
};

export const TRAVEL_TRANSACTION_MOMENTS = [
  "planning","booking","deposit","installment","upgrade","seat_selection","baggage",
  "hotel_hold","car_rental_hold","excursion_payment","travel_protection","cancellation",
  "refund","reschedule","voucher","loyalty_redemption","currency_conversion",
  "post_trip_expense_reconciliation","vendor_payout","wholesale_inventory_settlement"
];

export const TRAVEL_CONTINUITY_FIELDS = [
  "who_paid","what_was_approved","what_was_promised","what_changed","what_was_refunded",
  "what_credit_was_issued","what_loyalty_value_was_earned","what_customer_state_carries_forward",
  "what_currency_was_requested","what_conversion_rate_was_applied",
  "what_best_rate_option_was_available","what_location_based_currency_option_was_chosen"
];

export function buildTravelPaiSafeVerticalProfile(input = {}) {
  const dashboardType = input.dashboardType || TRAVEL_DASHBOARD_TYPES.TOUR_OPERATOR;

  if (!DASHBOARD_PROFILES[dashboardType]) {
    return { accepted: false, refusalType: "UNKNOWN_TRAVEL_DASHBOARD_PROFILE", dashboardType };
  }

  const profile = {
    profileId: `TRAVEL-PAI-SAFE-${Date.now()}-${dashboardType}`,
    profileType: "TRAVEL_PAI_SAFE_VERTICAL_PROFILE_V1",
    architectureBoundary: {
      travelIsEngine: false,
      travelIsVerticalProfile: true,
      paiSafeIsRail: true,
      paidIsControlSurface: true,
      tpsIsMerchantPackage: true,
      fundTrackerAIIsTransactionTruth: true,
      fintechionAIIsOperatorGovernance: true,
      rateRemainsWorkflowLaw: true
    },
    rail: PAI_SAFE_RAIL,
    dashboardType,
    dashboardFields: DASHBOARD_PROFILES[dashboardType],
    transactionMoments: TRAVEL_TRANSACTION_MOMENTS,
    continuityFields: TRAVEL_CONTINUITY_FIELDS,
    currencyIntelligence: CURRENCY_INTELLIGENCE,
    proofLanguage: {
      cleanLine: "Free dashboard. Embedded trusted processing. Proof-backed transactions.",
      travelLine: "Travel needs verified continuity across every payment moment.",
      loyaltyLine: "PAI-SAFE turns travel loyalty from points into verified continuity.",
      cruiseLine: "Cruise lines are floating travel ecosystems.",
      currencyLine: CURRENCY_INTELLIGENCE.doctrineLine
    },
    outputBoundary: "demo_profile_only_no_live_integration",
    createdAt: new Date().toISOString()
  };

  const file = path.join(recordsDir, `${profile.profileId}.json`);
  fs.writeFileSync(file, JSON.stringify(profile, null, 2));

  return { accepted: true, profileId: profile.profileId, dashboardType, outputBoundary: profile.outputBoundary, file };
}

export function buildAllTravelDashboardProfiles() {
  return Object.values(TRAVEL_DASHBOARD_TYPES).map((dashboardType) =>
    buildTravelPaiSafeVerticalProfile({ dashboardType })
  );
}
