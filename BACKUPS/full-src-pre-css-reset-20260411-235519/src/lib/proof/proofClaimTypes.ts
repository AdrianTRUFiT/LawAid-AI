export const PROOF_CLAIM_TYPES = [
  "doctrinal",
  "architectural",
  "implementation",
  "runtime_proof",
  "future_state",
] as const;

export type ProofClaimType = (typeof PROOF_CLAIM_TYPES)[number];

export interface ClaimBoundaryRule {
  id: string;
  description: string;
  appliesTo: ProofClaimType[];
}

export const DEFAULT_CLAIM_BOUNDARY_RULES: ClaimBoundaryRule[] = [
  {
    id: "no_doctrine_as_runtime_proof",
    description:
      "Doctrinal statements must not be presented as runtime proof without artifact support.",
    appliesTo: ["doctrinal", "runtime_proof"],
  },
  {
    id: "no_architecture_as_implementation",
    description:
      "Architectural descriptions must not be treated as implemented merely because they are well-defined.",
    appliesTo: ["architectural", "implementation"],
  },
  {
    id: "no_future_state_as_current_proof",
    description:
      "Future-state capabilities must not be phrased as current-state proof.",
    appliesTo: ["future_state", "runtime_proof"],
  },
];