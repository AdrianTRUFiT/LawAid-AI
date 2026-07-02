import { evaluateUnifiedPermission } from '../unified-permission-matrix/unifiedPermissionEngine';
import { evaluateExecutionContext } from '../execution-context/executionContext';
import { evaluateProjectBox } from '../utility-container/projectBoxEvaluator';
import { evaluateSmartUtilityReadiness } from '../utility-container/smartUtilityEvaluator';
import { evaluateIdentityUsage } from '../ai-track/identityUsageEngine';
import { calculateFee } from './transactionMeter';
import { createFeeReceipt } from './feeReceipt';
import { verifyLedgerBeforeExecution } from './readTimeVerification';
import { evaluateDecisionBinding } from './decisionBindingGate';
import { enforceSystemHealth } from './systemHealthGate';
import { verifyArtifactActive } from './artifactCheckGate';
import { enforceLineage } from './lineageExecutionGate';

export function attemptExecution(input: any) {

  const system = enforceSystemHealth(input.systemStates || []);
  if (system.decision !== "ALLOW") {
    return { status: "REFUSED", layer: "SYSTEM_HEALTH", reason: system.reason };
  }

  const ledgerCheck = verifyLedgerBeforeExecution();
  if (ledgerCheck.decision !== "OK") {
    return { status: "REFUSED", layer: "LEDGER", reason: ledgerCheck.reason };
  }

  const artifactCheck = verifyArtifactActive(input.projectBox.artifactId);
  if (artifactCheck.decision !== "ALLOW") {
    return { status: "REFUSED", layer: "ARTIFACT", reason: artifactCheck.reason };
  }

  if (input.lineage) {
    const lineage = enforceLineage(input.lineage);
    if (lineage.decision !== "ALLOW") {
      return { status: "REFUSED", layer: "LINEAGE", reason: lineage.reason };
    }
  }

  const identityCheck = evaluateIdentityUsage(input.identityUsage);
  if (!identityCheck.consequenceAllowed) {
    return { status: identityCheck.decision, layer: "AI_TRACK", reason: identityCheck.reason };
  }

  const boxCheck = evaluateProjectBox(input.projectBox);
  if (boxCheck.decision !== "CONTINUE") {
    return { status: "REFUSED", layer: "PROJECT_BOX", reason: boxCheck.reason };
  }

  const smartCheck = evaluateSmartUtilityReadiness(input.projectBox);
  if (smartCheck.decision !== "CONTINUE") {
    return { status: smartCheck.decision, layer: "SMART_UTILITY", reason: smartCheck.reason };
  }

  const permission = evaluateUnifiedPermission(input.permission);
  if (permission.decision !== "ALLOW") {
    return { status: "REFUSED", layer: "PERMISSION", reason: permission.reason };
  }

  const context = evaluateExecutionContext(input.context);
  if (context.decision !== "EXECUTE") {
    return { status: context.decision, layer: "CONTEXT", reason: context.reason };
  }

  const binding = evaluateDecisionBinding(input.decisionBinding);
  if (binding.decision !== "ALLOW") {
    return { status: "REFUSED", layer: "DECISION", reason: binding.reason };
  }

  const fee = calculateFee("CONSEQUENCE");

  const proof = createFeeReceipt({
    eventId: input.eventId,
    artifactId: input.projectBox.artifactId,
    module: input.module || "UNKNOWN",
    eventType: "CONSEQUENCE",
    fee
  });

  return {
    status: "EXECUTED",
    ledger: proof.ledger,
    receipt: proof.receipt,
    fee
  };
}
