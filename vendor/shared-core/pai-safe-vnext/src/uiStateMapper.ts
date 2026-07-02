import type {
  PaiSafeDecision
} from "./contracts.js";

import type {
  PaiSafeBlockedAction,
  PaiSafeSurfaceContractPacket,
  PaiSafeSurfaceTone
} from "./surfaceContracts.js";

import type {
  PaiSafeConsumerScreenState,
  PaiSafeInternalReviewScreenState,
  PaiSafeMerchantScreenState,
  PaiSafeReadOnlyGuard,
  PaiSafeScreenStateKind,
  PaiSafeUiStatePacket
} from "./uiStateContracts.js";

const READ_ONLY_GUARD: PaiSafeReadOnlyGuard = Object.freeze({
  readOnly: true,
  canMutateSourceContract: false,
  canModifyTrustDecision: false,
  canModifyProofRecord: false,
  canAuthorizePayment: false,
  canWriteCustody: false,
  canPromoteDoctrine: false
});

type NeutralMode = "EMPTY" | "LOADING" | "UNAVAILABLE";
type NeutralKind = "EMPTY_STATE" | "LOADING_STATE" | "UNAVAILABLE_STATE";

interface NeutralBaseFields {
  screenMode: NeutralMode;
  stateKind: NeutralKind;
  transactionId: null;
  decision: null;
  tone: PaiSafeSurfaceTone | "neutral";
  headline: string;
  primaryMessage: string;
  proofLabel: null;
  reasonLabel: null;
  nextStepLabel: null;
  timelineLabels: string[];
  allowedActions: [];
  blockedActions: PaiSafeBlockedAction[];
  readOnlyGuard: PaiSafeReadOnlyGuard;
}

export function buildPaiSafeUiStatePacket(
  surface: PaiSafeSurfaceContractPacket
): PaiSafeUiStatePacket {
  const decision = surface.decision;

  return deepFreeze({
    transactionId: surface.transactionId,
    decision,
    merchantScreen: buildMerchantScreenState(surface),
    consumerScreen: buildConsumerScreenState(surface),
    internalReviewScreen: buildInternalReviewScreenState(surface),
    sourceSurfaceContractReadOnly: true,
    uiAuthority: {
      screenStatePrepares: true,
      uiRendersLater: true,
      createsTruth: false,
      mutatesState: false,
      authorizesPayment: false,
      writesCustody: false
    }
  });
}

export function buildPaiSafeEmptyUiState(): PaiSafeUiStatePacket {
  return deepFreeze({
    transactionId: null,
    decision: null,
    merchantScreen: emptyMerchantScreen(),
    consumerScreen: emptyConsumerScreen(),
    internalReviewScreen: emptyInternalScreen(),
    sourceSurfaceContractReadOnly: true,
    uiAuthority: emptyAuthority()
  });
}

export function buildPaiSafeLoadingUiState(): PaiSafeUiStatePacket {
  return deepFreeze({
    transactionId: null,
    decision: null,
    merchantScreen: loadingMerchantScreen(),
    consumerScreen: loadingConsumerScreen(),
    internalReviewScreen: loadingInternalScreen(),
    sourceSurfaceContractReadOnly: true,
    uiAuthority: emptyAuthority()
  });
}

export function buildPaiSafeUnavailableUiState(message = "Transaction state is unavailable."): PaiSafeUiStatePacket {
  return deepFreeze({
    transactionId: null,
    decision: null,
    merchantScreen: unavailableMerchantScreen(message),
    consumerScreen: unavailableConsumerScreen(message),
    internalReviewScreen: unavailableInternalScreen(message),
    sourceSurfaceContractReadOnly: true,
    uiAuthority: emptyAuthority()
  });
}

function buildMerchantScreenState(surface: PaiSafeSurfaceContractPacket): PaiSafeMerchantScreenState {
  const card = surface.merchantCard;

  return {
    screenRole: "MERCHANT_SCREEN",
    screenMode: "READY",
    stateKind: stateKindForDecision(surface.decision),
    transactionId: surface.transactionId,
    decision: surface.decision,
    tone: card.tone,
    headline: card.labels.statusHeadline,
    primaryMessage: card.labels.nextStepLabel,
    proofLabel: card.labels.proofLabel,
    reasonLabel: card.labels.reasonLabel,
    nextStepLabel: card.labels.nextStepLabel,
    timelineLabels: [...card.timelineLabels],
    allowedActions: [...card.allowedActions],
    blockedActions: [...card.blockedActions],
    readOnlyGuard: READ_ONLY_GUARD,
    sourceSurface: "MERCHANT_SURFACE",
    fulfillmentLabel: card.fulfillmentLabel,
    disputeSupportLabel: card.disputeSupportLabel
  };
}

function buildConsumerScreenState(surface: PaiSafeSurfaceContractPacket): PaiSafeConsumerScreenState {
  const receipt = surface.consumerReceiptView;

  return {
    screenRole: "CONSUMER_SCREEN",
    screenMode: "READY",
    stateKind: stateKindForDecision(surface.decision),
    transactionId: surface.transactionId,
    decision: surface.decision,
    tone: receipt.tone,
    headline: receipt.labels.statusHeadline,
    primaryMessage: receipt.labels.nextStepLabel,
    proofLabel: receipt.labels.proofLabel,
    reasonLabel: receipt.labels.reasonLabel,
    nextStepLabel: receipt.labels.nextStepLabel,
    timelineLabels: [...receipt.timelineLabels],
    allowedActions: [...receipt.allowedActions],
    blockedActions: [...receipt.blockedActions],
    readOnlyGuard: READ_ONLY_GUARD,
    sourceSurface: "CONSUMER_SURFACE",
    userMessage: receipt.userMessage
  };
}

function buildInternalReviewScreenState(surface: PaiSafeSurfaceContractPacket): PaiSafeInternalReviewScreenState {
  const packet = surface.internalReviewPacket;

  return {
    screenRole: "INTERNAL_REVIEW_SCREEN",
    screenMode: "READY",
    stateKind: stateKindForDecision(surface.decision),
    transactionId: surface.transactionId,
    decision: surface.decision,
    tone: packet.tone,
    headline: `Internal review packet: ${packet.decision}`,
    primaryMessage: packet.reviewRequired ? "Internal review required." : "Internal review packet available.",
    proofLabel: packet.decision === "SAFE"
      ? "Proof available"
      : packet.decision === "HOLD"
        ? "Review record available"
        : "Refusal record available",
    reasonLabel: packet.reasonCategory,
    nextStepLabel: packet.nextStep,
    timelineLabels: [...packet.timelineLabels],
    allowedActions: [...packet.allowedActions],
    blockedActions: [...packet.blockedActions],
    readOnlyGuard: READ_ONLY_GUARD,
    sourceSurface: "INTERNAL_REVIEW_SURFACE",
    riskCodes: [...packet.riskCodes],
    hashes: {
      requestHash: packet.hashes.requestHash,
      decisionHash: packet.hashes.decisionHash,
      recordHash: packet.hashes.recordHash,
      receiptHash: packet.hashes.receiptHash
    },
    consistency: {
      proofBackConsistent: packet.consistency.proofBackConsistent,
      receiptConsistent: packet.consistency.receiptConsistent
    },
    reviewRequired: packet.reviewRequired
  };
}

function stateKindForDecision(decision: PaiSafeDecision): PaiSafeScreenStateKind {
  if (decision === "SAFE") return "SAFE_STATE";
  if (decision === "HOLD") return "HOLD_STATE";
  return "REFUSED_STATE";
}

function emptyAuthority() {
  return {
    screenStatePrepares: true as const,
    uiRendersLater: true as const,
    createsTruth: false as const,
    mutatesState: false as const,
    authorizesPayment: false as const,
    writesCustody: false as const
  };
}

function safeUnavailableActions(): PaiSafeBlockedAction[] {
  return [
    "AUTHORIZE_PAYMENT",
    "WRITE_CUSTODY",
    "PROMOTE_DOCTRINE",
    "MODIFY_TRUST_DECISION",
    "MODIFY_PROOF_RECORD",
    "VIEW_INTERNAL_RISK_CODES",
    "VIEW_INTERNAL_HASHES"
  ];
}

function neutralModeForKind(stateKind: NeutralKind): NeutralMode {
  if (stateKind === "LOADING_STATE") return "LOADING";
  if (stateKind === "EMPTY_STATE") return "EMPTY";
  return "UNAVAILABLE";
}

function neutralBase(
  stateKind: NeutralKind,
  headline: string,
  primaryMessage: string
): NeutralBaseFields {
  return {
    screenMode: neutralModeForKind(stateKind),
    stateKind,
    transactionId: null,
    decision: null,
    tone: "neutral",
    headline,
    primaryMessage,
    proofLabel: null,
    reasonLabel: null,
    nextStepLabel: null,
    timelineLabels: [],
    allowedActions: [],
    blockedActions: safeUnavailableActions(),
    readOnlyGuard: READ_ONLY_GUARD
  };
}

function emptyMerchantScreen(): PaiSafeMerchantScreenState {
  return {
    screenRole: "MERCHANT_SCREEN",
    ...neutralBase("EMPTY_STATE", "No transaction selected.", "Select a transaction to view its safety state."),
    sourceSurface: "EMPTY_STATE",
    fulfillmentLabel: null,
    disputeSupportLabel: null
  };
}

function emptyConsumerScreen(): PaiSafeConsumerScreenState {
  return {
    screenRole: "CONSUMER_SCREEN",
    ...neutralBase("EMPTY_STATE", "No transaction selected.", "Select a transaction to view safe-pay status."),
    sourceSurface: "EMPTY_STATE",
    userMessage: null
  };
}

function emptyInternalScreen(): PaiSafeInternalReviewScreenState {
  return {
    screenRole: "INTERNAL_REVIEW_SCREEN",
    ...neutralBase("EMPTY_STATE", "No transaction selected.", "Select a transaction to view internal review state."),
    sourceSurface: "EMPTY_STATE",
    riskCodes: [],
    hashes: {
      requestHash: null,
      decisionHash: null,
      recordHash: null,
      receiptHash: null
    },
    consistency: {
      proofBackConsistent: null,
      receiptConsistent: null
    },
    reviewRequired: null
  };
}

function loadingMerchantScreen(): PaiSafeMerchantScreenState {
  return {
    screenRole: "MERCHANT_SCREEN",
    ...neutralBase("LOADING_STATE", "Loading transaction state.", "Preparing merchant screen state."),
    sourceSurface: "LOADING_STATE",
    fulfillmentLabel: null,
    disputeSupportLabel: null
  };
}

function loadingConsumerScreen(): PaiSafeConsumerScreenState {
  return {
    screenRole: "CONSUMER_SCREEN",
    ...neutralBase("LOADING_STATE", "Loading safe-pay status.", "Preparing consumer screen state."),
    sourceSurface: "LOADING_STATE",
    userMessage: null
  };
}

function loadingInternalScreen(): PaiSafeInternalReviewScreenState {
  return {
    screenRole: "INTERNAL_REVIEW_SCREEN",
    ...neutralBase("LOADING_STATE", "Loading internal review packet.", "Preparing internal review screen state."),
    sourceSurface: "LOADING_STATE",
    riskCodes: [],
    hashes: {
      requestHash: null,
      decisionHash: null,
      recordHash: null,
      receiptHash: null
    },
    consistency: {
      proofBackConsistent: null,
      receiptConsistent: null
    },
    reviewRequired: null
  };
}

function unavailableMerchantScreen(message: string): PaiSafeMerchantScreenState {
  return {
    screenRole: "MERCHANT_SCREEN",
    ...neutralBase("UNAVAILABLE_STATE", "Transaction unavailable.", message),
    sourceSurface: "UNAVAILABLE_STATE",
    fulfillmentLabel: null,
    disputeSupportLabel: null
  };
}

function unavailableConsumerScreen(message: string): PaiSafeConsumerScreenState {
  return {
    screenRole: "CONSUMER_SCREEN",
    ...neutralBase("UNAVAILABLE_STATE", "Safe-pay state unavailable.", message),
    sourceSurface: "UNAVAILABLE_STATE",
    userMessage: null
  };
}

function unavailableInternalScreen(message: string): PaiSafeInternalReviewScreenState {
  return {
    screenRole: "INTERNAL_REVIEW_SCREEN",
    ...neutralBase("UNAVAILABLE_STATE", "Internal review unavailable.", message),
    sourceSurface: "UNAVAILABLE_STATE",
    riskCodes: [],
    hashes: {
      requestHash: null,
      decisionHash: null,
      recordHash: null,
      receiptHash: null
    },
    consistency: {
      proofBackConsistent: null,
      receiptConsistent: null
    },
    reviewRequired: null
  };
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);

    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];

      if (child && typeof child === "object" && !Object.isFrozen(child)) {
        deepFreeze(child);
      }
    }
  }

  return value;
}