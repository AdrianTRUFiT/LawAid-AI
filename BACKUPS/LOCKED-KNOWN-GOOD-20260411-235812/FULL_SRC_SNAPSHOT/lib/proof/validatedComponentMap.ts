import type { ExistenceClass, GapStatus } from "./existenceClasses";

export interface ValidatedComponentMapEntry {
  componentId: string;
  currentName: string;
  existenceClass: ExistenceClass;
  currentLocation: string;
  currentRole: string;
  receives: string[];
  emits: string[];
  enforcement: string[];
  refusal: string[];
  freshness: string[];
  trustBoundary: string;
  gapStatus: GapStatus;
  ownerAuthority?: string;
  reentryCondition?: string;
}

export const INITIAL_VALIDATED_COMPONENT_MAP: ValidatedComponentMapEntry[] = [
  {
    componentId: "codex",
    currentName: "The Codex",
    existenceClass: "canonical_doctrine",
    currentLocation: "docs / uploaded authority artifacts",
    currentRole: "Canonical execution model for authored invocation",
    receives: ["authored intent"],
    emits: ["execution model", "invocation grammar", "verification structure"],
    enforcement: ["doctrinal authority"],
    refusal: ["claim discipline", "invalid invocation grammar"],
    freshness: ["manual revision only"],
    trustBoundary: "constitutional doctrine",
    gapStatus: "present_and_aligned",
    ownerAuthority: "Adrian TRUFiT McKenzie · MAIN",
  },
  {
    componentId: "lawaid_activation_seam",
    currentName: "LawAidAI Step 6 Activation Seam",
    existenceClass: "partial_implementation",
    currentLocation: "src/lib/activation + records/live + records/activation",
    currentRole: "Transforms reviewed shell + Activated Transaction State into Live System Record",
    receives: ["reviewed shell state", "Activated Transaction State"],
    emits: ["Activation Envelope", "Live System Record"],
    enforcement: ["activation contract", "activation engine"],
    refusal: ["duplicate activation refusal"],
    freshness: ["input-state dependent"],
    trustBoundary: "receiving environment / activation boundary",
    gapStatus: "present_but_weak",
    ownerAuthority: "LawAidAI receiving environment",
    reentryCondition: "Complete refusal hardening and workflow integration",
  },
];