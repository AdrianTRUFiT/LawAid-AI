import type { LawAidAIHardeningSnapshot } from "./hardeningContracts";
import type { LaunchBlockerReport } from "./remediationContracts";
import { mapRefusalCodesToRemediation } from "./remediationMap";

export function buildLaunchBlockerReport(
  snapshot: LawAidAIHardeningSnapshot
): LaunchBlockerReport {
  const blockers: string[] = [];
  const warnings: string[] = [];

  blockers.push(...snapshot.refusal.explanation.filter((x) => x !== "All governed refusal checks passed."));
  blockers.push(...snapshot.financial.explanation.filter((x) => x !== "Financial workspace boundary checks passed."));

  if (!snapshot.launchReady) {
    warnings.push("Launch readiness is not yet earned.");
  }

  const remediationItems = [
    ...mapRefusalCodesToRemediation(snapshot.refusal.refusalCodes),
    ...snapshot.financial.codes
      .filter((code) => !snapshot.refusal.refusalCodes.includes(code))
      .flatMap((code) => mapRefusalCodesToRemediation([code])),
  ];

  return {
    launchReady: snapshot.launchReady,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    remediationItems,
    shellGate: snapshot.shellGate,
  };
}
