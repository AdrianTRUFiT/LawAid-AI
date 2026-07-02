import {
  buildRealValuePrice,
  previewWalletDecision,
  createSettlementRecord,
  validateSharedSettlementForReceiving,
  type EcosystemWalletProfile,
  type JurisdictionPolicy,
  type RailCapability,
  type ValueConversionRate,
} from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_tb_002",
  ownerId: "owner_tb_002",
  homeJurisdiction: "US",
  trustTier: "trusted",
  balances: [
    {
      balanceId: "bal_credit",
      valueKind: "merchant_credit",
      unitCode: "CREDIT_USD",
      amount: 50,
      merchantScope: ["merchant_tb_002"],
      priority: 1,
    },
  ],
};

const price = buildRealValuePrice({
  merchantId: "merchant_tb_002",
  realValueUnits: 15,
  displayCurrency: "USD",
  settlementCurrency: "USD",
  realValueToDisplayRate: 1,
  realValueToSettlementRate: 1,
});

const policy: JurisdictionPolicy = {
  jurisdictionCode: "US",
  acceptedValueKinds: ["merchant_credit", "stable_value", "fiat_balance"],
  allowedRails: ["internal_ledger"],
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
  {
    unitCode: "CREDIT_USD",
    settlementCurrency: "USD",
    settlementPerUnit: 1,
    displayCurrency: "USD",
    displayPerUnit: 1,
  },
];

const decision = previewWalletDecision({
  wallet,
  price,
  policy,
  rails,
  rates,
  hasKyc: true,
});

if (!decision.approved) {
  throw new Error(`Expected preview approval but got ${decision.reason}`);
}

const settlement = createSettlementRecord({
  walletId: wallet.walletId,
  ownerId: wallet.ownerId,
  merchantId: price.merchantId,
  jurisdictionCode: policy.jurisdictionCode,
  displayCurrency: price.displayCurrency,
  displayAmount: price.displayAmount,
  realValueUnits: price.realValueUnits,
  decision,
});

const incoming = validateSharedSettlementForReceiving({
  incoming: settlement,
});

if (!incoming.accepted || incoming.decision !== "TRUSTED") {
  throw new Error(`Expected trusted incoming settlement, received ${incoming.decision}`);
}

console.log("SMOKE_SHARED_VALUE_TO_SHARED_TRUST_RECEIVE=PASS");
console.log(`INCOMING_DECISION=${incoming.decision}`);