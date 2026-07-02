import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type {
  GovernanceAdmissionDecision,
  GovernanceAdmissionPendingRecord
} from "./governanceAdmissionContracts";

function root(queue: "bounded_pending_recovery" | "bounded_governance_review"): string {
  return path.resolve(
    process.cwd(),
    "shared-core",
    "verification-admissions-layer",
    "store",
    queue
  );
}

function stableHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function persistGovernanceAdmissionDecision(
  decision: GovernanceAdmissionDecision
): {
  decisionPath: string;
  pendingPath?: string;
  pendingStatus?: "CREATED" | "EXISTING";
} {
  const decisionRoot = path.resolve(
    process.cwd(),
    "shared-core",
    "verification-admissions-layer",
    "store",
    "decisions"
  );
  fs.mkdirSync(decisionRoot, { recursive: true });

  const decisionId = `gov_admission_${stableHash({
    intakeId: decision.intakeId,
    governanceResult: decision.governanceResult,
    nextQueue: decision.nextQueue,
    reasonCodes: decision.reasonCodes
  }).slice(0, 24)}`;

  const decisionPath = path.join(decisionRoot, `${decisionId}.json`);
  fs.writeFileSync(decisionPath, JSON.stringify({ decisionId, ...decision }, null, 2), "utf8");

  if (decision.nextQueue === "normal_admission_flow") {
    return { decisionPath };
  }

  const queue = decision.nextQueue;
  fs.mkdirSync(root(queue), { recursive: true });

  const pendingId = `gov_admission_pending_${stableHash({
    intakeId: decision.intakeId,
    queue,
    reasonCodes: decision.reasonCodes
  }).slice(0, 24)}`;

  const pendingPath = path.join(root(queue), `${pendingId}.json`);

  if (fs.existsSync(pendingPath)) {
    return {
      decisionPath,
      pendingPath,
      pendingStatus: "EXISTING"
    };
  }

  const pending: GovernanceAdmissionPendingRecord = {
    pendingId,
    intakeId: decision.intakeId,
    governanceResult: decision.governanceResult,
    reasonCodes: [...decision.reasonCodes],
    status: "pending",
    queue,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2), "utf8");

  return {
    decisionPath,
    pendingPath,
    pendingStatus: "CREATED"
  };
}
