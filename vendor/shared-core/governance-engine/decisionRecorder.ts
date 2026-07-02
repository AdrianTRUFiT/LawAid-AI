import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type {
  GovernanceDecisionRecord,
  GovernanceTrigger,
  GovernanceClassificationState,
  GovernanceBranchState,
  GovernanceNextActionPacket
} from "./governanceEngineContracts";

function recordsRoot(): string {
  return path.resolve(
    process.cwd(),
    "shared-core",
    "governance-engine",
    "store",
    "decision-records"
  );
}

function stableHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function recordDecision(args: {
  trigger: GovernanceTrigger;
  classificationState: GovernanceClassificationState;
  branchState: GovernanceBranchState;
  decisionReasons: string[];
  nextActionPacket: GovernanceNextActionPacket;
}): {
  record: GovernanceDecisionRecord;
  recordPath: string;
} {
  fs.mkdirSync(recordsRoot(), { recursive: true });

  const seed = {
    triggerId: args.trigger.triggerId,
    classificationState: args.classificationState,
    branchState: args.branchState,
    decisionReasons: [...args.decisionReasons],
    nextActionId: args.nextActionPacket.actionId
  };

  const decisionId = `gov_decision_${stableHash(seed).slice(0, 24)}`;
  const recordPath = path.join(recordsRoot(), `${decisionId}.json`);

  const record: GovernanceDecisionRecord = {
    decisionId,
    triggerId: args.trigger.triggerId,
    sourceRecordId: args.trigger.sourceRecordId,
    packetId: args.trigger.packetId,
    triggerKind: args.trigger.triggerKind,
    classificationState: args.classificationState,
    branchState: args.branchState,
    decisionReasons: [...args.decisionReasons],
    nextActionPacket: args.nextActionPacket,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2), "utf8");

  return {
    record,
    recordPath
  };
}
