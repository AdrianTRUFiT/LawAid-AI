import { runDefaultReadOnlyReport } from "../readOnlyReportSurface";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const report = runDefaultReadOnlyReport();

assert(report.mutationAllowed === false, "Report surface must be read-only");
assert(report.summary.total === 16, "Expected 16 total scenarios");
assert(report.summary.passed === 1, "Expected one passed scenario");
assert(report.summary.refused === 15, "Expected fifteen refused scenarios");

console.log("READ_ONLY_SIMULATOR_REPORT_SURFACE=PASS");
console.log(JSON.stringify(report, null, 2));
