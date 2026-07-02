import * as fs from "node:fs";
import * as path from "node:path";
import type {
  LatestGovernanceRoutingIntent,
  RoutingIntentQueryResult,
  RoutingIntentRecord
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

function readAll(): RoutingIntentRecord[] {
  if (!fs.existsSync(root())) {
    return [];
  }

  return fs.readdirSync(root())
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const fullPath = path.join(root(), file);
      return JSON.parse(fs.readFileSync(fullPath, "utf8")) as RoutingIntentRecord;
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function queryAllRoutingIntentRecords(): RoutingIntentQueryResult {
  const records = readAll();
  return {
    count: records.length,
    records
  };
}

export function getLatestGovernanceRoutingIntent(): LatestGovernanceRoutingIntent {
  const records = readAll();
  return {
    latestRecord: records.length > 0 ? records[records.length - 1] : null,
    totalRecords: records.length
  };
}

export function queryRoutingIntentBySourceRecordId(sourceRecordId: string): RoutingIntentQueryResult {
  const records = readAll().filter((x) => x.sourceRecordId === sourceRecordId);
  return {
    count: records.length,
    records
  };
}

export function queryRoutingIntentByPacketId(packetId: string): RoutingIntentQueryResult {
  const records = readAll().filter((x) => x.packetId === packetId);
  return {
    count: records.length,
    records
  };
}

export function queryDeferredRoutingIntents(): RoutingIntentQueryResult {
  const records = readAll().filter((x) => x.deferredPending === true);
  return {
    count: records.length,
    records
  };
}
