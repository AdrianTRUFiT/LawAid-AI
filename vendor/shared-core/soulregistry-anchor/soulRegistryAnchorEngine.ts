import type {
  PrivateProjectionAnchorSource,
  SoulRegistryAnchorDecision,
  SoulRegistryPublicAnchor,
  SoulRegistryPublicReceipt,
  SoulRegistryReceiptVerificationDecision,
  SoulRegistryRefusalCode
} from "./soulRegistryAnchorContracts";

import { canonicalize, sha256Hex } from "../projection-ledger";

function nowIso(): string {
  return new Date().toISOString();
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function hashPublicAnchorBody(anchor: Omit<SoulRegistryPublicAnchor, "anchorHash">): Promise<string> {
  return sha256Hex(canonicalize(anchor));
}

async function hashReceiptBody(receipt: Omit<SoulRegistryPublicReceipt, "receiptHash">): Promise<string> {
  return sha256Hex(canonicalize(receipt));
}

function validatePrivateAnchorSource(source: PrivateProjectionAnchorSource): {
  refusalReasons: SoulRegistryRefusalCode[];
  requiredCorrections: string[];
} {
  const refusalReasons: SoulRegistryRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (!hasText(source.anchorSourceId)) {
    refusalReasons.push("ANCHOR_ID_MISSING");
    requiredCorrections.push("Provide anchorSourceId.");
  }

  if (!hasText(source.projectionHash)) {
    refusalReasons.push("PROJECTION_HASH_MISSING");
    requiredCorrections.push("Provide projection hash.");
  }

  if (!hasText(source.ledgerEntryHash)) {
    refusalReasons.push("LEDGER_ENTRY_HASH_MISSING");
    requiredCorrections.push("Provide ledger entry hash.");
  }

  if (source.sourceAuthority !== "FundTrackerAI") {
    refusalReasons.push("SOURCE_AUTHORITY_INVALID");
    requiredCorrections.push("SoulRegistry? anchor sourceAuthority must remain FundTrackerAI.");
  }

  if (source.destination !== "SoulBaseAI") {
    refusalReasons.push("DESTINATION_INVALID");
    requiredCorrections.push("SoulRegistry? anchor destination must remain SoulBaseAI.");
  }

  if (source.containsRawProjection) {
    refusalReasons.push("RAW_PROJECTION_EXPOSURE_REFUSED");
    requiredCorrections.push("Remove raw projection before creating public anchor.");
  }

  if (source.containsRawFinancialData) {
    refusalReasons.push("RAW_FINANCIAL_EXPOSURE_REFUSED");
    requiredCorrections.push("Remove raw financial data before creating public anchor.");
  }

  if (source.containsPrivateSourcePath || hasText(source.privateCustodyPointer)) {
    refusalReasons.push("PRIVATE_CUSTODY_PATH_EXPOSURE_REFUSED");
    requiredCorrections.push("Do not expose private custody path in public anchor.");
  }

  return {
    refusalReasons: Array.from(new Set(refusalReasons)),
    requiredCorrections: Array.from(new Set(requiredCorrections))
  };
}

export async function createSoulRegistryAnchor(
  source: PrivateProjectionAnchorSource
): Promise<SoulRegistryAnchorDecision> {
  const validation = validatePrivateAnchorSource(source);

  if (validation.refusalReasons.length > 0) {
    return {
      status: "SOULREGISTRY_ANCHOR_REFUSED",
      accepted: false,
      refusalReasons: validation.refusalReasons,
      requiredCorrections: validation.requiredCorrections,
      boundary: {
        publicAnchorOnly: true,
        privateCustodySeparated: true,
        noRawProjectionPublished: true,
        noPaymentAuthorityCreated: true,
        noCustodyTransferCreated: true,
        noRuntimeActivationCreated: true
      }
    };
  }

  const createdAt = nowIso();

  const publicFields = {
    projectionId: source.projectionId,
    projectionHash: source.projectionHash,
    ledgerEntryHash: source.ledgerEntryHash,
    ledgerEntryId: source.ledgerEntryId,
    sourceAuthority: source.sourceAuthority,
    destination: source.destination,
    artifactType: source.artifactType,
    createdAt
  } as const;

  const anchorBody: Omit<SoulRegistryPublicAnchor, "anchorHash"> = {
    anchorId: `soulregistry_anchor_${source.projectionId}`,
    registryName: "SoulRegistry?",
    anchorType: "PUBLIC_VERIFICATION_ANCHOR",
    projectionId: source.projectionId,
    projectionHash: source.projectionHash,
    ledgerEntryHash: source.ledgerEntryHash,
    ledgerEntryId: source.ledgerEntryId,
    sourceAuthority: source.sourceAuthority,
    destination: source.destination,
    artifactType: source.artifactType,
    createdAt,
    publicFields,
    boundary: {
      anchorIsNotPaymentAuthority: true,
      anchorIsNotTransactionTruth: true,
      anchorIsNotCustodyTransfer: true,
      anchorExposesNoRawProjection: true,
      anchorExposesNoRawFinancialData: true,
      anchorExposesNoPrivateCustodyPath: true,
      fundTrackerAIRemainsTransactionTruth: true,
      soulBaseAIRemainsMemorySubstrate: true,
      soulVaultRemainsCustodyPlane: true
    }
  };

  const anchorHash = await hashPublicAnchorBody(anchorBody);

  const anchor: SoulRegistryPublicAnchor = {
    ...anchorBody,
    anchorHash
  };

  const receiptBody: Omit<SoulRegistryPublicReceipt, "receiptHash"> = {
    receiptId: `soulregistry_receipt_${source.projectionId}`,
    receiptType: "PUBLIC_VERIFICATION_RECEIPT",
    registryName: "SoulRegistry?",
    anchorId: anchor.anchorId,
    projectionId: anchor.projectionId,
    projectionHash: anchor.projectionHash,
    ledgerEntryHash: anchor.ledgerEntryHash,
    anchorHash: anchor.anchorHash,
    issuedAt: createdAt,
    verificationStatement:
      "This receipt verifies the existence of a public-safe anchor. It does not expose raw projection data, raw financial data, custody paths, payment authority, transaction truth, entitlement, or activation.",
    boundary: {
      receiptIsNotPaymentAuthority: true,
      receiptIsNotTransactionTruth: true,
      receiptIsNotEntitlementAuthority: true,
      receiptIsNotCustodyTransfer: true,
      receiptExposesNoRawProjection: true,
      receiptExposesNoRawFinancialData: true,
      receiptExposesNoPrivateCustodyPath: true
    }
  };

  const receiptHash = await hashReceiptBody(receiptBody);

  const receipt: SoulRegistryPublicReceipt = {
    ...receiptBody,
    receiptHash
  };

  return {
    status: "SOULREGISTRY_ANCHOR_ACCEPTED",
    accepted: true,
    anchor,
    receipt,
    refusalReasons: [],
    requiredCorrections: [],
    boundary: {
      publicAnchorOnly: true,
      privateCustodySeparated: true,
      noRawProjectionPublished: true,
      noPaymentAuthorityCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true
    }
  };
}

export async function verifySoulRegistryReceipt(
  anchor: SoulRegistryPublicAnchor,
  receipt: SoulRegistryPublicReceipt
): Promise<SoulRegistryReceiptVerificationDecision> {
  const refusalReasons: SoulRegistryRefusalCode[] = [];

  if (!hasText(anchor.anchorId)) {
    refusalReasons.push("ANCHOR_ID_MISSING");
  }

  if (!hasText(receipt.receiptId)) {
    refusalReasons.push("RECEIPT_ID_MISSING");
  }

  const expectedAnchorHash = await hashPublicAnchorBody({
    anchorId: anchor.anchorId,
    registryName: anchor.registryName,
    anchorType: anchor.anchorType,
    projectionId: anchor.projectionId,
    projectionHash: anchor.projectionHash,
    ledgerEntryHash: anchor.ledgerEntryHash,
    ledgerEntryId: anchor.ledgerEntryId,
    sourceAuthority: anchor.sourceAuthority,
    destination: anchor.destination,
    artifactType: anchor.artifactType,
    createdAt: anchor.createdAt,
    publicFields: anchor.publicFields,
    boundary: anchor.boundary
  });

  if (anchor.anchorHash !== expectedAnchorHash) {
    refusalReasons.push("ANCHOR_HASH_MISMATCH");
  }

  const expectedReceiptHash = await hashReceiptBody({
    receiptId: receipt.receiptId,
    receiptType: receipt.receiptType,
    registryName: receipt.registryName,
    anchorId: receipt.anchorId,
    projectionId: receipt.projectionId,
    projectionHash: receipt.projectionHash,
    ledgerEntryHash: receipt.ledgerEntryHash,
    anchorHash: receipt.anchorHash,
    issuedAt: receipt.issuedAt,
    verificationStatement: receipt.verificationStatement,
    boundary: receipt.boundary
  });

  if (receipt.receiptHash !== expectedReceiptHash) {
    refusalReasons.push("RECEIPT_HASH_MISMATCH");
  }

  if (receipt.anchorId !== anchor.anchorId || receipt.anchorHash !== anchor.anchorHash) {
    refusalReasons.push("RECEIPT_HASH_MISMATCH");
  }

  const boundaryOk =
    anchor.boundary.anchorIsNotPaymentAuthority === true &&
    anchor.boundary.anchorIsNotTransactionTruth === true &&
    anchor.boundary.anchorIsNotCustodyTransfer === true &&
    anchor.boundary.anchorExposesNoRawProjection === true &&
    anchor.boundary.anchorExposesNoRawFinancialData === true &&
    anchor.boundary.anchorExposesNoPrivateCustodyPath === true &&
    receipt.boundary.receiptIsNotPaymentAuthority === true &&
    receipt.boundary.receiptIsNotTransactionTruth === true &&
    receipt.boundary.receiptIsNotEntitlementAuthority === true &&
    receipt.boundary.receiptIsNotCustodyTransfer === true &&
    receipt.boundary.receiptExposesNoRawProjection === true &&
    receipt.boundary.receiptExposesNoRawFinancialData === true &&
    receipt.boundary.receiptExposesNoPrivateCustodyPath === true;

  if (!boundaryOk) {
    refusalReasons.push("PUBLIC_RECEIPT_CANNOT_CREATE_AUTHORITY");
  }

  const uniqueRefusals = Array.from(new Set(refusalReasons));
  const verified = uniqueRefusals.length === 0;

  return {
    status: verified ? "SOULREGISTRY_RECEIPT_VERIFIED" : "SOULREGISTRY_RECEIPT_REFUSED",
    verified,
    refusalReasons: uniqueRefusals,
    anchorId: anchor.anchorId,
    receiptId: receipt.receiptId,
    boundary: {
      verifierIsReadOnly: true,
      verifierCreatesNoPaymentAuthority: true,
      verifierCreatesNoTransactionTruth: true,
      verifierCreatesNoCustodyTransfer: true
    }
  };
}


