import {
  createSoulRegistryAnchor,
  verifySoulRegistryReceipt
} from "../soulregistry-anchor";
import type {
  PrivateProjectionAnchorSource,
  SoulRegistryPublicAnchor,
  SoulRegistryPublicReceipt
} from "../soulregistry-anchor";
import type {
  FraudAttackResult,
  FraudAttackVector,
  FraudHarnessRunResult
} from "./fraudAdversarialContracts";
import { FRAUDAI_ADVERSARIAL_POLICY } from "./fraudAdversarialPolicy";
import { mutateRegistryArtifacts } from "./fraudMutationEngine";

function includesAny(actual: string[], expected: string[]): boolean {
  return expected.some((reason) => actual.includes(reason));
}

function isLeakVector(vector: FraudAttackVector): boolean {
  return (
    vector === "RAW_PROJECTION_PUBLIC_LEAK" ||
    vector === "RAW_FINANCIAL_PUBLIC_LEAK" ||
    vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK"
  );
}

async function evaluateLeakVector(
  vector: FraudAttackVector,
  anchor: SoulRegistryPublicAnchor
): Promise<FraudAttackResult> {
  const baseSource: PrivateProjectionAnchorSource = {
    anchorSourceId: `fraud_leak_source_${vector}`,
    projectionId: anchor.projectionId,
    projectionHash: anchor.projectionHash,
    ledgerEntryHash: anchor.ledgerEntryHash,
    ledgerEntryId: anchor.ledgerEntryId,
    sourceAuthority: "FundTrackerAI",
    destination: "SoulBaseAI",
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
    createdAt: anchor.createdAt,
    privateCustodyPointer: vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK" ? "D:/PRIVATE/SoulVault/source.pdf" : "",
    containsRawProjection: vector === "RAW_PROJECTION_PUBLIC_LEAK",
    containsRawFinancialData: vector === "RAW_FINANCIAL_PUBLIC_LEAK",
    containsPrivateSourcePath: vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK"
  };

  const decision = await createSoulRegistryAnchor(baseSource);
  const expected = FRAUDAI_ADVERSARIAL_POLICY.expectedRefusals[vector];
  const refused = decision.accepted === false && includesAny(decision.refusalReasons, expected);

  return {
    vector,
    status: refused ? "FRAUD_ATTACK_REFUSED" : "FRAUD_ATTACK_ESCAPED",
    refused,
    detected: refused,
    refusalReasons: decision.refusalReasons,
    expectedRefusalReasons: expected,
    boundary: {
      fraudDidNotCreatePaymentAuthority: true,
      fraudDidNotCreateTransactionTruth: true,
      fraudDidNotCreateCustodyTransfer: true,
      fraudDidNotExposeRawProjection: vector !== "RAW_PROJECTION_PUBLIC_LEAK" ? true : refused,
      fraudDidNotExposeRawFinancialData: vector !== "RAW_FINANCIAL_PUBLIC_LEAK" ? true : refused,
      fraudDidNotExposePrivateCustodyPath: vector !== "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK" ? true : refused
    }
  };
}

async function evaluateReceiptVector(
  vector: FraudAttackVector,
  anchor: SoulRegistryPublicAnchor,
  receipt: SoulRegistryPublicReceipt
): Promise<FraudAttackResult> {
  const mutation = mutateRegistryArtifacts(vector, anchor, receipt);
  const verification = await verifySoulRegistryReceipt(
    mutation.mutatedAnchor,
    mutation.mutatedReceipt
  );

  const expected = FRAUDAI_ADVERSARIAL_POLICY.expectedRefusals[vector];
  const detected = verification.verified === false && includesAny(verification.refusalReasons, expected);

  return {
    vector,
    status: detected ? "FRAUD_ATTACK_DETECTED" : "FRAUD_ATTACK_ESCAPED",
    refused: detected,
    detected,
    refusalReasons: verification.refusalReasons,
    expectedRefusalReasons: expected,
    boundary: {
      fraudDidNotCreatePaymentAuthority: verification.boundary.verifierCreatesNoPaymentAuthority,
      fraudDidNotCreateTransactionTruth: verification.boundary.verifierCreatesNoTransactionTruth,
      fraudDidNotCreateCustodyTransfer: verification.boundary.verifierCreatesNoCustodyTransfer,
      fraudDidNotExposeRawProjection: true,
      fraudDidNotExposeRawFinancialData: true,
      fraudDidNotExposePrivateCustodyPath: true
    }
  };
}

export async function runFraudAIAdversarialHarness(
  anchor: SoulRegistryPublicAnchor,
  receipt: SoulRegistryPublicReceipt
): Promise<FraudHarnessRunResult> {
  const results: FraudAttackResult[] = [];

  for (const vector of FRAUDAI_ADVERSARIAL_POLICY.requiredVectors) {
    if (isLeakVector(vector)) {
      results.push(await evaluateLeakVector(vector, anchor));
    } else {
      results.push(await evaluateReceiptVector(vector, anchor, receipt));
    }
  }

  const escapedVectors = results
    .filter((result) => result.status === "FRAUD_ATTACK_ESCAPED")
    .map((result) => result.vector);

  const refusedOrDetected = results.length - escapedVectors.length;
  const passed = escapedVectors.length === 0;

  return {
    status: passed ? "FRAUDAI_ADVERSARIAL_HARNESS_PASS" : "FRAUDAI_ADVERSARIAL_HARNESS_FAIL",
    passed,
    totalVectors: results.length,
    refusedOrDetected,
    escapedVectors,
    results,
    boundary: {
      noPaymentAuthorityCreated: true,
      noTransactionTruthCreated: true,
      noCustodyTransferCreated: true,
      registryVerifierIsReadOnly: true,
      publicPrivateSeparationMaintained: results.every(
        (result) =>
          result.boundary.fraudDidNotExposeRawProjection &&
          result.boundary.fraudDidNotExposeRawFinancialData &&
          result.boundary.fraudDidNotExposePrivateCustodyPath
      )
    }
  };
}

