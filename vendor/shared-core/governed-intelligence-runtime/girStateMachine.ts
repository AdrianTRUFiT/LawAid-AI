import { GIRStage } from "./girContracts";

export const GIR_STAGE_ORDER: GIRStage[] = [
  "SIGNAL",
  "READINESS",
  "DECISION",
  "VERIFICATION",
  "ACTION",
  "PROOF",
  "EXPANSION",
  "LEARNING"
];

export function isLegalNextStage(current: GIRStage, target: GIRStage): boolean {
  return GIR_STAGE_ORDER.indexOf(target) === GIR_STAGE_ORDER.indexOf(current) + 1;
}
