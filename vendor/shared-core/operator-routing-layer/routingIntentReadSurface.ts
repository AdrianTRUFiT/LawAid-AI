import { buildRoutingDecisionPacketFromCertifiedClosureRecord } from "./liveRoutingDecisionBridge";
import { persistRoutingIntentRecord } from "./routingIntentWriter";
import type { CertifiedClosureGovernedRecord } from "../../src/lib/pong-governance";

export function recordLatestGovernanceRoutingIntentFromCertifiedClosureRecord(
  record: CertifiedClosureGovernedRecord
) {
  const live = buildRoutingDecisionPacketFromCertifiedClosureRecord(record);

  return persistRoutingIntentRecord({
    packet: live.routingDecisionPacket,
    sourceRecordId: live.sourceRecordId,
    certifiedClosureRecordId: record.recordId
  });
}
