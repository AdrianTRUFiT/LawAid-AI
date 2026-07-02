import type {
  ComplianceSnapshot,
  EcosystemWalletProfile,
  FundingChoice,
  RailCapability,
  RealValuePrice,
  ValueBalance,
  ValueConversionRate,
} from "./contracts.js";
import { getUnitsRequired } from "./pricing.js";
import { selectBestRail } from "./railRouter.js";

function isBalanceUsable(input: {
  balance: ValueBalance;
  compliance: ComplianceSnapshot;
  merchantId: string;
  jurisdictionCode: string;
}): boolean {
  const { balance } = input;

  if (!input.compliance.acceptedValueKinds.includes(balance.valueKind)) return false;
  if (balance.merchantScope?.length && !balance.merchantScope.includes(input.merchantId)) return false;
  if (balance.jurisdictionScope?.length && !balance.jurisdictionScope.includes(input.jurisdictionCode)) return false;
  if (balance.expiresAt && new Date(balance.expiresAt).getTime() < Date.now()) return false;

  return balance.amount > 0;
}

export function autoSelectFunding(input: {
  wallet: EcosystemWalletProfile;
  price: RealValuePrice;
  compliance: ComplianceSnapshot;
  rails: RailCapability[];
  rates: ValueConversionRate[];
}): {
  approved: boolean;
  reason: string;
  fundingChoices: FundingChoice[];
  selectedRail?: RailCapability;
} {
  if (input.compliance.status !== "compliant") {
    return {
      approved: false,
      reason: `Compliance status is ${input.compliance.status}.`,
      fundingChoices: [],
    };
  }

  const selectedRail = selectBestRail({
    rails: input.rails,
    allowedRails: input.compliance.allowedRails,
    jurisdictionCode: input.compliance.jurisdictionCode,
    settlementCurrency: input.price.settlementCurrency,
  });

  if (!selectedRail) {
    return {
      approved: false,
      reason: "No eligible rail was found for settlement.",
      fundingChoices: [],
    };
  }

  const balances = [...input.wallet.balances]
    .filter((balance) =>
      isBalanceUsable({
        balance,
        compliance: input.compliance,
        merchantId: input.price.merchantId,
        jurisdictionCode: input.compliance.jurisdictionCode,
      }),
    )
    .sort((a, b) => a.priority - b.priority);

  let remaining = input.price.settlementAmount;
  const fundingChoices: FundingChoice[] = [];

  for (const balance of balances) {
    if (remaining <= 0) break;

    const unitsRequired = getUnitsRequired({
      unitCode: balance.unitCode,
      settlementCurrency: input.price.settlementCurrency,
      settlementAmount: remaining,
      rates: input.rates,
    });

    if (!Number.isFinite(unitsRequired)) continue;

    const unitsToConsume = Math.min(balance.amount, unitsRequired);
    if (unitsToConsume <= 0) continue;

    const rate = input.rates.find(
      (r) =>
        r.unitCode === balance.unitCode &&
        r.settlementCurrency === input.price.settlementCurrency,
    );
    if (!rate) continue;

    const settlementValueProvided = Number((unitsToConsume * rate.settlementPerUnit).toFixed(2));

    fundingChoices.push({
      balanceId: balance.balanceId,
      valueKind: balance.valueKind,
      unitCode: balance.unitCode,
      unitsConsumed: Number(unitsToConsume.toFixed(4)),
      settlementValueProvided,
    });

    remaining = Number((remaining - settlementValueProvided).toFixed(2));
  }

  if (remaining > 0.001) {
    return {
      approved: false,
      reason: "Wallet has insufficient eligible governed value for settlement.",
      fundingChoices,
      selectedRail,
    };
  }

  return {
    approved: true,
    reason: "Wallet auto-selection approved.",
    fundingChoices,
    selectedRail,
  };
}
