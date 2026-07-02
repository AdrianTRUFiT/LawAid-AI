import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_006",
  entitlement: null,
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_INPUT") {
  throw new Error("Expected missing-input refusal.");
}

console.log("SMOKE_MESH_ACCESS_MISSING_INPUT=PASS");