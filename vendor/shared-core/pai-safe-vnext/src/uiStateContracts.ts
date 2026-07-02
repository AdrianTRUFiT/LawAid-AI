import type {
  PaiSafeDecision
} from "./contracts.js";

import type {
  PaiSafeBlockedAction,
  PaiSafeConsumerSafePayReceiptView,
  PaiSafeInternalReviewPacket,
  PaiSafeMerchantSafeTransactionCard,
  PaiSafePublicAction,
  PaiSafeSurfaceContractPacket,
  PaiSafeSurfaceTone
} from "./surfaceContracts.js";

export type PaiSafeScreenRole =
  | "MERCHANT_SCREEN"
  | "CONSUMER_SCREEN"
  | "INTERNAL_REVIEW_SCREEN";

export type PaiSafeScreenMode =
  | "READY"
  | "EMPTY"
  | "LOADING"
  | "UNAVAILABLE";

export type PaiSafeScreenStateKind =
  | "SAFE_STATE"
  | "HOLD_STATE"
  | "REFUSED_STATE"
  | "EMPTY_STATE"
  | "LOADING_STATE"
  | "UNAVAILABLE_STATE";

export interface PaiSafeReadOnlyGuard {
  readOnly: true;
  canMutateSourceContract: false;
  canModifyTrustDecision: false;
  canModifyProofRecord: false;
  canAuthorizePayment: false;
  canWriteCustody: false;
  canPromoteDoctrine: false;
}

export interface PaiSafeScreenStateBase {
  screenRole: PaiSafeScreenRole;
  screenMode: PaiSafeScreenMode;
  stateKind: PaiSafeScreenStateKind;
  transactionId: string | null;
  decision: PaiSafeDecision | null;
  tone: PaiSafeSurfaceTone | "neutral";
  headline: string;
  primaryMessage: string;
  proofLabel: string | null;
  reasonLabel: string | null;
  nextStepLabel: string | null;
  timelineLabels: string[];
  allowedActions: PaiSafePublicAction[];
  blockedActions: PaiSafeBlockedAction[];
  readOnlyGuard: PaiSafeReadOnlyGuard;
  sourceSurface: string;
}

export interface PaiSafeMerchantScreenState extends PaiSafeScreenStateBase {
  screenRole: "MERCHANT_SCREEN";
  fulfillmentLabel: string | null;
  disputeSupportLabel: string | null;
}

export interface PaiSafeConsumerScreenState extends PaiSafeScreenStateBase {
  screenRole: "CONSUMER_SCREEN";
  userMessage: string | null;
}

export interface PaiSafeInternalReviewScreenState extends PaiSafeScreenStateBase {
  screenRole: "INTERNAL_REVIEW_SCREEN";
  riskCodes: string[];
  hashes: {
    requestHash: string | null;
    decisionHash: string | null;
    recordHash: string | null;
    receiptHash: string | null;
  };
  consistency: {
    proofBackConsistent: boolean | null;
    receiptConsistent: boolean | null;
  };
  reviewRequired: boolean | null;
}

export interface PaiSafeUiStatePacket {
  transactionId: string | null;
  decision: PaiSafeDecision | null;
  merchantScreen: PaiSafeMerchantScreenState;
  consumerScreen: PaiSafeConsumerScreenState;
  internalReviewScreen: PaiSafeInternalReviewScreenState;
  sourceSurfaceContractReadOnly: true;
  uiAuthority: {
    screenStatePrepares: true;
    uiRendersLater: true;
    createsTruth: false;
    mutatesState: false;
    authorizesPayment: false;
    writesCustody: false;
  };
}

export interface PaiSafeUiStateInput {
  surfaceContract: PaiSafeSurfaceContractPacket;
}

export type PaiSafeMerchantSurfaceInput = PaiSafeMerchantSafeTransactionCard;
export type PaiSafeConsumerSurfaceInput = PaiSafeConsumerSafePayReceiptView;
export type PaiSafeInternalSurfaceInput = PaiSafeInternalReviewPacket;