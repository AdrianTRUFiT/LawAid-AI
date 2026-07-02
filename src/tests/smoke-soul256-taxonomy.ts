import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";

const defs = buildSoul256Definitions();

const counts = defs.reduce<Record<string, number>>((acc, def) => {
  acc[def.kind] = (acc[def.kind] ?? 0) + 1;
  return acc;
}, {});

const consequenceGate = defs.find((d) => d.kind === "consequence_gate");
const assignmentGate = defs.find((d) => d.kind === "assignment_gate");
const reconciliationGate = defs.find((d) => d.kind === "reconciliation_gate");

if (!assignmentGate) {
  console.error("MISSING_ASSIGNMENT_GATE");
  process.exit(1);
}

if (!reconciliationGate) {
  console.error("MISSING_RECONCILIATION_GATE");
  process.exit(1);
}

if (!consequenceGate) {
  console.error("MISSING_CONSEQUENCE_GATE");
  process.exit(1);
}

if ((counts["decoy_gate"] ?? 0) === 0) {
  console.error("MISSING_DECOY_GATES");
  process.exit(1);
}

if ((counts["sink_gate"] ?? 0) === 0) {
  console.error("MISSING_SINK_GATES");
  process.exit(1);
}

console.log("SOUL256_TAXONOMY_STATUS=PASS");
console.log("TOTAL_DEFINITIONS=", defs.length);
console.log("ASSIGNMENT_GATES=", counts["assignment_gate"] ?? 0);
console.log("REAL_GATES=", counts["real_gate"] ?? 0);
console.log("DECOY_GATES=", counts["decoy_gate"] ?? 0);
console.log("SINK_GATES=", counts["sink_gate"] ?? 0);
console.log("CONSEQUENCE_GATES=", counts["consequence_gate"] ?? 0);
console.log("RECONCILIATION_GATES=", counts["reconciliation_gate"] ?? 0);
console.log("CONSEQUENCE_GATE_ID=", consequenceGate.checkpointId);
