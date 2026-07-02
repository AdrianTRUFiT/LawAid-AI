import type { CustodyRecord, HoldingTankDecisionResult, RetentionDecision } from '../../types/custody';

function createReasonsBase(record: CustodyRecord): string[] {
  return [
    `memory layer: ${record.memoryLayer}`,
    `custody state: ${record.custodyState}`,
    `dependencies: ${record.dependencyIds.length}`,
  ];
}

export function evaluateHoldingTankDecision(
  record: CustodyRecord,
  decision: RetentionDecision,
): HoldingTankDecisionResult {
  const reasons = createReasonsBase(record);

  if (record.sealed) {
    reasons.push('sealed records cannot be casually moved or deleted');
    return {
      objectId: record.objectId,
      allowed: false,
      decision: 'refuse',
      reasons,
      resultingCustodyState: record.custodyState,
    };
  }

  if (decision === 'delete' && record.dependencyIds.length > 0) {
    reasons.push('object still has dependencies and cannot be deleted safely');
    return {
      objectId: record.objectId,
      allowed: false,
      decision: 'refuse',
      reasons,
      resultingCustodyState: record.custodyState,
    };
  }

  switch (decision) {
    case 'keep_active':
      reasons.push('kept active for continued operational use');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'active',
      };

    case 'archive':
      reasons.push('moved to archive because no blocking dependency prevents it');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'archived',
      };

    case 'compress':
      reasons.push('compressed while preserving continuity');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'staged',
      };

    case 'detach':
      reasons.push('detached from active working set without deleting truth');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'dormant',
      };

    case 'mark_dormant':
      reasons.push('marked dormant for low-activity retention');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'dormant',
      };

    case 'delete':
      reasons.push('allowed because no sealed state or blocking dependency remains');
      return {
        objectId: record.objectId,
        allowed: true,
        decision,
        reasons,
        resultingCustodyState: 'deleted',
      };

    default:
      reasons.push('decision refused because it did not pass holding-tank rules');
      return {
        objectId: record.objectId,
        allowed: false,
        decision: 'refuse',
        reasons,
        resultingCustodyState: record.custodyState,
      };
  }
}
