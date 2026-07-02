import type { LawAidAIShellMode } from "./integrationContracts";

export function deriveShellPermissions(shellMode: LawAidAIShellMode): {
  canActivate: boolean;
  canEdit: boolean;
  canUseAI: boolean;
  isReadOnly: boolean;
  showUpgradePrompt: boolean;
} {
  switch (shellMode) {
    case "blocked":
      return {
        canActivate: false,
        canEdit: false,
        canUseAI: false,
        isReadOnly: false,
        showUpgradePrompt: false,
      };

    case "read_only":
      return {
        canActivate: false,
        canEdit: false,
        canUseAI: false,
        isReadOnly: true,
        showUpgradePrompt: true,
      };

    case "billing_gate":
      return {
        canActivate: false,
        canEdit: false,
        canUseAI: false,
        isReadOnly: false,
        showUpgradePrompt: true,
      };

    case "activation_ready":
      return {
        canActivate: true,
        canEdit: true,
        canUseAI: true,
        isReadOnly: false,
        showUpgradePrompt: false,
      };

    case "active":
    default:
      return {
        canActivate: false,
        canEdit: true,
        canUseAI: true,
        isReadOnly: false,
        showUpgradePrompt: false,
      };
  }
}
