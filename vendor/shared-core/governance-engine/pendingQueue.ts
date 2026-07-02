import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type {
  GovernancePendingQueueItem,
  GovernanceTrigger
} from "./governanceEngineContracts";

function queueRoot(): string {
  return path.resolve(
    process.cwd(),
    "shared-core",
    "governance-engine",
    "store",
    "pending-queue"
  );
}

function stableHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function enqueuePendingItem(args: {
  trigger: GovernanceTrigger;
  reasons: string[];
}): {
  item: GovernancePendingQueueItem;
  itemPath: string;
  repeatStatus: "CREATED" | "EXISTING";
} {
  fs.mkdirSync(queueRoot(), { recursive: true });

  const seed = {
    triggerId: args.trigger.triggerId,
    sourceRecordId: args.trigger.sourceRecordId,
    packetId: args.trigger.packetId,
    triggerKind: args.trigger.triggerKind,
    reasons: [...args.reasons]
  };

  const pendingId = `gov_pending_${stableHash(seed).slice(0, 24)}`;
  const itemPath = path.join(queueRoot(), `${pendingId}.json`);

  if (fs.existsSync(itemPath)) {
    const existing = JSON.parse(fs.readFileSync(itemPath, "utf8")) as GovernancePendingQueueItem;
    return {
      item: existing,
      itemPath,
      repeatStatus: "EXISTING"
    };
  }

  const item: GovernancePendingQueueItem = {
    pendingId,
    triggerId: args.trigger.triggerId,
    sourceRecordId: args.trigger.sourceRecordId,
    packetId: args.trigger.packetId,
    triggerKind: args.trigger.triggerKind,
    status: "pending",
    reasonCodes: [...args.reasons],
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(itemPath, JSON.stringify(item, null, 2), "utf8");

  return {
    item,
    itemPath,
    repeatStatus: "CREATED"
  };
}
