import { LawAidAIWorkspace } from './casePathContracts';
import { ExportLockViewModel } from './shellViewContracts';
import { evaluateExportReadiness } from './exportReadinessGate';
import { ActivatedTransactionState } from './paidActivationContracts';
import { evaluatePaidUnlock } from './paidActivationBridge';

export function buildExportLockViewModel(
  workspace: LawAidAIWorkspace,
  activation?: ActivatedTransactionState
): ExportLockViewModel {
  const readiness = evaluateExportReadiness(workspace);
  const paidUnlock = evaluatePaidUnlock(workspace, activation);

  const reasons = Array.from(new Set([
    ...readiness.reasons,
    ...(!paidUnlock.allowed ? paidUnlock.blocked : [])
  ]));

  const exportAllowed = readiness.exportAllowed && paidUnlock.allowed;

  return {
    locked: !exportAllowed,
    exportAllowed,
    reasons,
    message: exportAllowed
      ? 'Export is ready. Paid unlock proof and source-grounded readiness are present.'
      : 'Export is locked until readiness and Activated Transaction State requirements are satisfied.'
  };
}
