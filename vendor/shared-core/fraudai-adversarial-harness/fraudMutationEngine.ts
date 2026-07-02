import type {
  SoulRegistryPublicAnchor,
  SoulRegistryPublicReceipt
} from "../soulregistry-anchor";
import type {
  FraudAttackVector,
  FraudMutationOutput
} from "./fraudAdversarialContracts";

function cloneAnchor(anchor: SoulRegistryPublicAnchor): SoulRegistryPublicAnchor {
  return JSON.parse(JSON.stringify(anchor)) as SoulRegistryPublicAnchor;
}

function cloneReceipt(receipt: SoulRegistryPublicReceipt): SoulRegistryPublicReceipt {
  return JSON.parse(JSON.stringify(receipt)) as SoulRegistryPublicReceipt;
}

export function mutateRegistryArtifacts(
  vector: FraudAttackVector,
  anchor: SoulRegistryPublicAnchor,
  receipt: SoulRegistryPublicReceipt
): FraudMutationOutput {
  const mutatedAnchor = cloneAnchor(anchor);
  const mutatedReceipt = cloneReceipt(receipt);
  let injectedPublicPayload: string | undefined;

  switch (vector) {
    case "ANCHOR_HASH_MUTATION":
      mutatedAnchor.anchorHash = "0".repeat(64);
      break;

    case "RECEIPT_HASH_MUTATION":
      mutatedReceipt.receiptHash = "1".repeat(64);
      break;

    case "PROJECTION_HASH_MUTATION":
      mutatedAnchor.projectionHash = "2".repeat(64);
      mutatedAnchor.publicFields.projectionHash = "2".repeat(64);
      break;

    case "LEDGER_ENTRY_HASH_MUTATION":
      mutatedAnchor.ledgerEntryHash = "3".repeat(64);
      mutatedAnchor.publicFields.ledgerEntryHash = "3".repeat(64);
      break;

    case "SOURCE_AUTHORITY_MUTATION":
      mutatedAnchor.sourceAuthority = "Processor" as "FundTrackerAI";
      mutatedAnchor.publicFields.sourceAuthority = "Processor" as "FundTrackerAI";
      break;

    case "DESTINATION_MUTATION":
      mutatedAnchor.destination = "Wallet" as "SoulBaseAI";
      mutatedAnchor.publicFields.destination = "Wallet" as "SoulBaseAI";
      break;

    case "REGISTRY_NAME_MUTATION":
      mutatedAnchor.registryName = "FakeRegistry" as "SoulRegistry?";
      break;

    case "RECEIPT_SWAP":
      mutatedReceipt.anchorId = "soulregistry_anchor_swapped";
      mutatedReceipt.anchorHash = "4".repeat(64);
      break;

    case "BOUNDARY_DOWNGRADE":
      mutatedAnchor.boundary.anchorIsNotPaymentAuthority = false as true;
      mutatedReceipt.boundary.receiptIsNotPaymentAuthority = false as true;
      break;

    case "RAW_PROJECTION_PUBLIC_LEAK":
      injectedPublicPayload = "RAW_PROJECTION_BODY_LEAK";
      break;

    case "RAW_FINANCIAL_PUBLIC_LEAK":
      injectedPublicPayload = "RAW_FINANCIAL_DATA_LEAK";
      break;

    case "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK":
      injectedPublicPayload = "D:/PRIVATE/SoulVault/source.pdf";
      break;

    case "SYNTHETIC_RECEIPT":
      mutatedReceipt.receiptId = "synthetic_receipt_fraud";
      mutatedReceipt.verificationStatement = "Fake receipt claims entitlement and payment authority.";
      mutatedReceipt.boundary.receiptIsNotPaymentAuthority = false as true;
      mutatedReceipt.boundary.receiptIsNotTransactionTruth = false as true;
      break;

    case "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION":
      mutatedAnchor.projectionId = "projection_replayed_different";
      mutatedAnchor.publicFields.projectionId = "projection_replayed_different";
      break;
  }

  return {
    vector,
    mutatedAnchor,
    mutatedReceipt,
    ...(injectedPublicPayload ? { injectedPublicPayload } : {})
  };
}

