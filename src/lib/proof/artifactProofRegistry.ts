import type { ProofClaimType } from "./proofClaimTypes";
import type { VerificationResult } from "./verificationLevels";

export interface ArtifactProofRecord {
  proofId: string;
  title: string;
  claimType: ProofClaimType;
  scope: string;
  artifactType: string;
  sourceArtifacts: string[];
  outputArtifacts: string[];
  refusalArtifacts: string[];
  verification: VerificationResult[];
  notes?: string;
}

export const INITIAL_ARTIFACT_PROOF_REGISTRY: ArtifactProofRecord[] = [
  {
    proofId: "step6-foundational-runtime-seam",
    title: "LawAidAI Foundational Runtime Seam",
    claimType: "runtime_proof",
    scope: "Foundational Runtime Seam v1",
    artifactType: "activation_seam",
    sourceArtifacts: [
      "reviewed-shell-record",
      "activated-transaction-state",
    ],
    outputArtifacts: [
      "activation-envelope",
      "live-system-record",
    ],
    refusalArtifacts: [
      "duplicate-activation-refusal",
    ],
    verification: [
      {
        level: "technical",
        passed: true,
        notes: "Positive path executed.",
      },
      {
        level: "architectural",
        passed: true,
        notes: "Artifact-governed seam preserved.",
      },
      {
        level: "governance",
        passed: true,
        notes: "Bounded proof only; broader hardening remains ahead.",
      },
    ],
    notes:
      "Current strongest runtime proof claim in the white paper.",
  },
];
