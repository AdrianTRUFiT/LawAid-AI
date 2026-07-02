import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type { RoutingDecisionPacket } from "./routingDecisionPacketContracts";
import type {
  RoutingIntentRecord,
  RoutingIntentWriteResult
} from "./routingIntentReadContracts";

function root(): string {
  return path.resolve(
    process.cwd(),
    "shared-core",
    "operator-routing-layer",
    "store",
    "routing-intents"
  );
}

function stableHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function recordId(seed: unknown): string {
  return `routing_intent_${stableHash(seed).slice(0, 24)}`;
}

export function persistRoutingIntentRecord(args: {
  packet: RoutingDecisionPacket;
  sourceRecordId?: string;
  certifiedClosureRecordId?: string;
}): RoutingIntentWriteResult {
  fs.mkdirSync(root(), { recursive: true });

  const seed = {
    packetId: args.packet.packetId,
    sourceDecisionId: args.packet.sourceDecisionId,
    sourceTriggerId: args.packet.sourceTriggerId,
    decisionRecordId: args.packet.decisionRecordId,
    sourceRecordId: args.sourceRecordId ?? null,
    certifiedClosureRecordId: args.certifiedClosureRecordId ?? null
  };

  const id = recordId(seed);
  const recordPath = path.join(root(), `${id}.json`);

  if (fs.existsSync(recordPath)) {
    const existing = JSON.parse(fs.readFileSync(recordPath, "utf8")) as RoutingIntentRecord;
    return {
      record: existing,
      recordPath,
      repeatStatus: "EXISTING"
    };
  }

  const record: RoutingIntentRecord = {
    recordId: id,
    packetId: args.packet.packetId,
    sourceDecisionId: args.packet.sourceDecisionId,
    sourceTriggerId: args.packet.sourceTriggerId,
    decisionRecordId: args.packet.decisionRecordId,
    triggerClassification: args.packet.triggerClassification,
    branchResult: args.packet.branchResult,
    nextAction: args.packet.nextAction,
    nextActionTargetPath: args.packet.nextActionTargetPath,
    deferredPending: args.packet.deferredPending,
    pendingQueueId: args.packet.pendingQueueId,
    reasonCodes: [...args.packet.reasonCodes],
    createdAt: new Date().toISOString(),
    sourceRecordId: args.sourceRecordId,
    certifiedClosureRecordId: args.certifiedClosureRecordId
  };

  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2), "utf8");

  return {
    record,
    recordPath,
    repeatStatus: "CREATED"
  };
}
