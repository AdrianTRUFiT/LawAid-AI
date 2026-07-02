import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  EcosystemWalletProfile,
  JurisdictionPolicy,
  RailCapability,
  RealValuePrice,
  SettlementRecord,
  ValueConversionRate,
} from "./contracts.js";
import { executeWalletDecision } from "./controller.js";
import { trustWrapSharedSettlement, validateIncomingTrustedSettlement } from "./trustBridgeRuntime.js";

export interface FundTrackerBridgeOutput {
  walletDecisionApproved: boolean;
  settlementRecord: SettlementRecord | null;
  bridgeTrusted: boolean;
  bridgeDecision: string;
  trustedEnvelopeId?: string;
  registryValid?: boolean;
}

export function executeSharedSettlementForFundTracker(input: {
  wallet: EcosystemWalletProfile;
  price: RealValuePrice;
  policy: JurisdictionPolicy;
  rails: RailCapability[];
  rates: ValueConversionRate[];
  hasKyc: boolean;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
}): FundTrackerBridgeOutput {
  const trustController = new TrustSpineController();

  const walletExecution = executeWalletDecision({
    wallet: input.wallet,
    price: input.price,
    policy: input.policy,
    rails: input.rails,
    rates: input.rates,
    hasKyc: input.hasKyc,
  });

  if (!walletExecution.decision.approved || !walletExecution.settlementRecord) {
    return {
      walletDecisionApproved: false,
      settlementRecord: null,
      bridgeTrusted: false,
      bridgeDecision: walletExecution.decision.reason,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  const bridged = trustWrapSharedSettlement({
    settlementRecord: walletExecution.settlementRecord,
    actor: input.actor,
    policy: input.trustPolicy,
    trustController,
  });

  return {
    walletDecisionApproved: true,
    settlementRecord: walletExecution.settlementRecord,
    bridgeTrusted: bridged.trusted,
    bridgeDecision: bridged.decision,
    trustedEnvelopeId: bridged.trustedEnvelopeId,
    registryValid: bridged.registryValid,
  };
}

export function validateSharedSettlementForReceiving(input: {
  incoming: unknown;
}) {
  return validateIncomingTrustedSettlement({
    incoming: input.incoming,
  });
}