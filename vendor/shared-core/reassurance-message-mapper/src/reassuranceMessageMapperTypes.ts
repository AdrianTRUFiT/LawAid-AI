import type { MeshServiceAccessActivationArtifact } from "../../mesh-service-access-activation-bridge/src/index.js";

export type ReassuranceMessageClass =
  | "live_confirmation"
  | "held_guidance"
  | "blocked_guidance";

export interface ReassuranceMessageMapperInput {
  subjectId: string;
  accessActivation: MeshServiceAccessActivationArtifact | null;
}

export interface ReassuranceMessageArtifact {
  reassuranceMessageId: string;
  subjectId: string;
  accessActivationId: string;
  messageClass: ReassuranceMessageClass;
  headline: string;
  body: string;
  nextStep: string;
  continuityPriorityVisible: boolean;
  serviceReadyVisible: boolean;
  createdAt: string;
}

export interface ReassuranceMessageMapperRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ReassuranceMessageMapperResult {
  ok: boolean;
  artifact: ReassuranceMessageArtifact | null;
  refusal: ReassuranceMessageMapperRefusal | null;
}