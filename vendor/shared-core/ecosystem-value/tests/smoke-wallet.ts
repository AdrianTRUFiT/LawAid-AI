import {
  autoSelectFunding,
  buildComplianceSnapshot,
  buildRealValuePrice,
  type EcosystemWalletProfile,
  type JurisdictionPolicy,
  type RailCapability,
  type ValueConversionRate,
} from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_001",
  ownerId: "owner_001",
  homeJurisdiction: "US",
  trustTier: "trusted",
  balances: [
    { balanceId: "bal_credit", valueKind: "merchant_credit", unitCode: "CREDIT_USD", amount: 10, merchantScope: ["merchant_001"], priority: 1 },
    { balanceId: "bal_stable", valueKind: "stable_value", unitCode: "USDX", amount: 20, priority: 2 },
  ],
};

const policy: JurisdictionPolicy = {
  jurisdictionCode: "US",
  acceptedValueKinds: ["merchant_credit", "stable_value", "fiat_balance"],
  allowedRails: ["internal_ledger", "stable_settlement"],
  requiresKyc: true,
  minTrustTier: "verified",
};

const rails: RailCapability[] = [
  {
    railType: "internal_ledger",
    supportedSettlementCurrencies: ["USD"],
    jurisdictions: ["US"],
    enabled: true,
    priority: 1,
    settlementFinalityClass: "instant",
  },
];

const rates: ValueConversionRate[] = [
  { unitCode: "CREDIT_USD", settlementCurrency: "USD", settlementPerUnit: 1, displayCurrency: "USD", displayPerUnit: 1 },
  { unitCode: "USDX", settlementCurrency: "USD", settlementPerUnit: 1, displayCurrency: "USD", displayPerUnit: 1 },
];

const price = buildRealValuePrice({
  merchantId: "merchant_001",
  realValueUnits: 15,
  displayCurrency: "USD",
  settlementCurrency: "USD",
  realValueToDisplayRate: 1,
  realValueToSettlementRate: 1,
});

const compliance = buildComplianceSnapshot({
  wallet,
  merchantId: "merchant_001",
  jurisdictionCode: "US",
  hasKyc: true,
  policy,
  rails,
});

const decision = autoSelectFunding({
  wallet,
  price,
  compliance,
  rails,
  rates,
});

if (!decision.approved) throw new Error(`Expected approved decision but got: ${decision.reason}`);
if (!decision.selectedRail || decision.fundingChoices.length < 2) {
  throw new Error("Expected blended funding and selected rail.");
}

console.log("SMOKE_SHARED_VALUE_WALLET=PASS");
