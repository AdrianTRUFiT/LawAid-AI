export const STAGE_2_POLICY = {
  name: "FundTrackerAI ? SoulBaseAI Artifact Contract",
  status: "STAGE_2_AUTHORIZED_FOR_CONTRACT_DESIGN",
  artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
  sourceAuthority: "FundTrackerAI",
  destination: "SoulBaseAI",
  defaultPosture: "DENY",
  governingLine:
    "FundTrackerAI emits financial truth. SoulBaseAI may receive only authorized, redacted, retention-bounded memory projections. SoulVault? retains custody of source material.",
  requiredForProjection: [
    "explicit Stage 2 authorization",
    "Activated Transaction State",
    "verified commitment",
    "transaction proof reference",
    "entitlement state",
    "custody class",
    "redaction level",
    "retention rule",
    "user/container scope",
    "downstream consumer permission",
    "SoulMemory? governance pass",
    "SoulVault? / SoulBaseAI boundary pass"
  ],
  prohibitedByDefault: [
    "raw processor object",
    "raw bank statement",
    "full account number",
    "unredacted payment method",
    "private source document",
    "legal evidence file",
    "unrestricted financial history",
    "processor event treated as truth"
  ],
  boundary: {
    paymentEventIsNotCommitmentTruth: true,
    commitmentTruthRequiresFundTrackerAI: true,
    soulBaseAIIsNotTransactionTruth: true,
    soulBaseAIIsNotPaymentAuthority: true,
    soulVaultRemainsCustodyPlane: true,
    soulMemoryGovernsPersistence: true
  }
} as const;




