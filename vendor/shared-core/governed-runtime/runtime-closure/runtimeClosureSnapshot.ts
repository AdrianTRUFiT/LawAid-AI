import * as fs from "node:fs";
import * as path from "node:path";
import type { ClosureDecisionEnvelope, ProposalContext, RuntimeClosureSnapshot, RuntimeTruthInput } from "./closureStateContracts";

function snapshotDir(): string {
  const dir = path.resolve(
    process.cwd(),
    "shared-core",
    "governed-runtime",
    "store",
    "closure-snapshots"
  );
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeRuntimeClosureSnapshot(
  proposal: ProposalContext,
  truth: RuntimeTruthInput,
  envelope: ClosureDecisionEnvelope
): RuntimeClosureSnapshot {
  const snapshotId = `runtime_closure_${Date.now()}`;
  const snapshot: RuntimeClosureSnapshot = {
    snapshotId,
    proposal,
    truth,
    envelope,
    createdAt: new Date().toISOString()
  };

  const filePath = path.join(snapshotDir(), `${snapshotId}.closure.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf8");
  return snapshot;
}
