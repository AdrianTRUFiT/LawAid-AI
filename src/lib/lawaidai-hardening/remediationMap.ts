import type { LawAidAIRefusalCode } from "./hardeningContracts";
import type { RemediationItem } from "./remediationContracts";

function buildItem(
  code: RemediationItem["code"],
  title: string,
  description: string,
  severity: RemediationItem["severity"],
  owner: RemediationItem["owner"]
): RemediationItem {
  return {
    id: `rem_${String(code).toLowerCase()}`,
    code,
    title,
    description,
    severity,
    owner,
  };
}

export function mapRefusalCodesToRemediation(codes: LawAidAIRefusalCode[]): RemediationItem[] {
  return codes.map((code) => {
    switch (code) {
      case "WRONG_TARGET":
        return buildItem(
          code,
          "Correct receiving target",
          "Ensure the receiving environment matches the expected LawAidAI target before activation proceeds.",
          "high",
          "activation"
        );
      case "UNAPPROVED_SHELL":
        return buildItem(
          code,
          "Approve reviewed shell",
          "Activation cannot proceed until the reviewed shell exists and is explicitly approved.",
          "high",
          "shell"
        );
      case "MISSING_REQUIRED_FIELD":
        return buildItem(
          code,
          "Complete required fields",
          "Populate missing governed fields such as matterId, userId, shellId, and targetEnvironment.",
          "high",
          "workflow"
        );
      case "CONTRADICTORY_STATE":
        return buildItem(
          code,
          "Resolve contradictory state",
          "Reconcile conflicting governed state before any activation or workspace progression occurs.",
          "high",
          "workflow"
        );
      case "DUPLICATE_ACTIVATION":
        return buildItem(
          code,
          "Refuse duplicate activation",
          "Prevent repeated activation for the same governed state and preserve single valid consequence.",
          "high",
          "activation"
        );
      case "TRAPPED_STATE":
        return buildItem(
          code,
          "Clear trapped course state",
          "Resolve the trapped course condition before workspace progression can continue.",
          "high",
          "workflow"
        );
      case "BLOCKED_STATE":
        return buildItem(
          code,
          "Clear blocked course state",
          "Complete the missing dependencies that caused the blocked course state.",
          "high",
          "workflow"
        );
      case "MISSING_ACTIVATED_TRANSACTION_STATE":
        return buildItem(
          code,
          "Require Activated Transaction State",
          "Do not unlock shell behavior until the proper Activated Transaction State exists.",
          "high",
          "activation"
        );
      case "FINANCIAL_MAPPING_INVALID":
        return buildItem(
          code,
          "Repair payee/source mapping",
          "Complete financial source and payee mapping before launch-readiness can be trusted.",
          "high",
          "financial"
        );
      case "QUEUE_NOT_READY":
        return buildItem(
          code,
          "Harden queue/submission path",
          "Queue readiness must be completed before the financial substrate can be carried forward.",
          "medium",
          "financial"
        );
      case "CONFIRMATION_NOT_READY":
        return buildItem(
          code,
          "Complete confirmation path",
          "Submission and confirmation behavior must be aligned before launch.",
          "medium",
          "financial"
        );
      case "RECONCILIATION_INVALID":
        return buildItem(
          code,
          "Finalize reconciliation logic",
          "Exact-vs-partial reconciliation must be defined and enforced.",
          "high",
          "financial"
        );
      default:
        return buildItem(
          code,
          "Resolve governed issue",
          "Resolve the governed issue before launch continues.",
          "medium",
          "workflow"
        );
    }
  });
}
