import type { TestedRecord } from "./fact2Contracts.js";

export function verifyTestedRecord(tested: TestedRecord): boolean {
  return (
    tested.verificationMethod.length > 0 &&
    (tested.result === "passed" ||
      tested.result === "failed" ||
      tested.result === "partial")
  );
}
