import type { CertifiedClosureGovernedRecord } from "../../src/lib/pong-governance";
import type { GovernanceTrigger, GovernanceTriggerKind } from "../governance-engine";

export type CertifiedClosureRecordRoutingBridgeResult = {
  sourceRecordId: string;
  governanceTrigger: GovernanceTrigger;
};

function mapRecordClassToTriggerKind(recordClass: string): GovernanceTriggerKind {
  switch (recordClass) {
    case "CERTIFIED_READY":
      return "CERTIFIED_READY";
    case "CERTIFIED_HOLD":
      return "CERTIFIED_HOLD";
    case "CERTIFIED_REFUSE_MUTATION":
      return "CERTIFIED_REFUSE_MUTATION";
    case "CERTIFIED_REFUSE_INCOMPLETE":
      return "CERTIFIED_REFUSE_INCOMPLETE";
    case "CERTIFIED_REFUSE_UNCERTIFIED":
      return "CERTIFIED_REFUSE_UNCERTIFIED";
    default:
      return "UNKNOWN";
  }
}

export function adaptCertifiedClosureRecordToGovernanceTrigger(
  record: CertifiedClosureGovernedRecord
): CertifiedClosureRecordRoutingBridgeResult {
  return {
    sourceRecordId: record.recordId,
    governanceTrigger: {
      triggerId: `routing_trigger_${record.recordId}`,
      sourceRecordId: record.recordId,
      packetId: record.packetId,
      triggerKind: mapRecordClassToTriggerKind(record.recordClass),
      sourceParent: record.sourceParent,
      receivingParent: "shared-core/governance-engine",
      certifiedClosureResult: record.certifiedClosureResult,
      hilReadyStatus: record.hilReadyStatus,
      reasonCodes: [...record.reasonCodes],
      createdAt: new Date().toISOString()
    }
  };
}
