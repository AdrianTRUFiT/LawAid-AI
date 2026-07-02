import { runGovernanceDecisionEngine } from "../governance-engine";
import { adaptGovernanceDecisionToRoutingPacket } from "./routingDecisionAdapter";
import { adaptCertifiedClosureRecordToGovernanceTrigger } from "./certifiedClosureRoutingBridge";
import type { CertifiedClosureGovernedRecord } from "../../src/lib/pong-governance";
import type { RoutingDecisionPacket } from "./routingDecisionPacketContracts";

export type LiveRoutingDecisionBridgeResult = {
  sourceRecordId: string;
  governanceTriggerId: string;
  routingDecisionPacket: RoutingDecisionPacket;
};

export function buildRoutingDecisionPacketFromCertifiedClosureRecord(
  record: CertifiedClosureGovernedRecord
): LiveRoutingDecisionBridgeResult {
  const triggerBridge = adaptCertifiedClosureRecordToGovernanceTrigger(record);
  const decision = runGovernanceDecisionEngine(triggerBridge.governanceTrigger);
  const routingPacket = adaptGovernanceDecisionToRoutingPacket(decision).packet;

  return {
    sourceRecordId: triggerBridge.sourceRecordId,
    governanceTriggerId: triggerBridge.governanceTrigger.triggerId,
    routingDecisionPacket: routingPacket
  };
}
