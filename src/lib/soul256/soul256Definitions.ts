import type { Soul256CheckpointDefinition } from "./soul256Contracts";

export function buildSoul256Definitions(): Soul256CheckpointDefinition[] {
  const defs: Soul256CheckpointDefinition[] = [];

  for (let i = 1; i <= 256; i++) {
    const checkpointId = `cp_${i.toString().padStart(3, "0")}`;
    const dependsOn = i === 1 ? [] : [`cp_${(i - 1).toString().padStart(3, "0")}`];

    let kind: Soul256CheckpointDefinition["kind"] = "real_gate";
    let intelligenceDepth: Soul256CheckpointDefinition["intelligenceDepth"] = "light";
    let blocksDownstream = true;
    let consequenceBearing = false;
    let decoyOnly = false;

    if (i === 1) {
      kind = "assignment_gate";
      intelligenceDepth = "deep";
    } else if (i === 256) {
      kind = "reconciliation_gate";
      intelligenceDepth = "deep";
    } else if (i === 192) {
      kind = "consequence_gate";
      intelligenceDepth = "deep";
      consequenceBearing = true;
    } else if (i % 40 === 0) {
      kind = "sink_gate";
      intelligenceDepth = "standard";
    } else if (i % 32 === 0) {
      kind = "decoy_gate";
      intelligenceDepth = "standard";
      decoyOnly = true;
      blocksDownstream = false;
    } else if (i % 16 === 0) {
      intelligenceDepth = "standard";
    }

    defs.push({
      checkpointId,
      sequence: i,
      name: `Checkpoint ${i}`,
      kind,
      required: kind !== "decoy_gate",
      intelligenceDepth,
      dependsOn,
      blocksDownstream,
      consequenceBearing,
      decoyOnly,
    });
  }

  return defs;
}
