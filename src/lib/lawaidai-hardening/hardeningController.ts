import { validateFinancialWorkspace } from "./financialWorkspaceValidators";
import { evaluateLawAidAIRefusal } from "./refusalGuards";
import { deriveLawAidAIShellGate } from "./shellStateGuards";
import type {
  FinancialWorkspaceSnapshot,
  LawAidAIGovernedStateInput,
  LawAidAIHardeningSnapshot,
  LawAidAIRefusalInput,
} from "./hardeningContracts";

export function buildLawAidAIHardeningSnapshot(args: {
  refusalInput: LawAidAIRefusalInput;
  financialSnapshot: FinancialWorkspaceSnapshot;
  governedState: Omit<LawAidAIGovernedStateInput, "refusal">;
}): LawAidAIHardeningSnapshot {
  const refusal = evaluateLawAidAIRefusal(args.refusalInput);
  const financial = validateFinancialWorkspace(args.financialSnapshot);

  const shellGate = deriveLawAidAIShellGate({
    ...args.governedState,
    refusal,
  });

  const launchReady =
    refusal.approved &&
    financial.valid &&
    (shellGate === "activation_ready" || shellGate === "active_workspace");

  return {
    refusal,
    financial,
    shellGate,
    launchReady,
  };
}
