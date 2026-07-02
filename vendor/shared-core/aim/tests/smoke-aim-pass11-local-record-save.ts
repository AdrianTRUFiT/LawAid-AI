import {
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  type AimManualEvidenceDraft
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft as AimManualEvidenceDraft);
const record = buildAimLocalRecordPacket(flow);
const recordB = buildAimLocalRecordPacket(flow);

assert(record.recordId === recordB.recordId, "Local record ID must be deterministic.");
assert(record.recordStatus === "LOCAL_RECORD_READY", "Safe flow should create ready local record.");
assert(record.paiSafeStatus === "SAFE TO REVIEW", "Local record should preserve PAI-SAFE status.");
assert(record.journalStatus === "JOURNAL_READY", "Local record should preserve journal status.");
assert(record.localRecordPath.includes("D:\\DEV\\AIVA\\shared-core\\aim\\records"), "Local record path must stay inside AIM records.");
assert(record.readOnly === true, "Local record must be read-only.");
assert(record.deterministic === true, "Local record must be deterministic.");
assert(record.localOnly === true, "Local record must be local-only.");
assert(record.preservationRequired === true, "Local record must require preservation.");
assert(record.humanReviewRequired === true, "Local record must require human review.");
assert(record.mayWriteSoul === false, "Local record must not write S:\\SOUL.");
assert(record.mayExecuteTrade === false, "Local record must not execute trade.");
assert(record.mayApproveInvestment === false, "Local record must not approve investment.");
assert(record.mayProvideFinancialAdvice === false, "Local record must not provide financial advice.");
assert(record.mayMutateSource === false, "Local record must not mutate source.");
assert(record.finalAuthority === "Human", "Human authority must remain final.");
assert(record.finalAction === "", "Final action must remain blank.");
assert(Object.isFrozen(record), "Local record packet must be frozen.");

const badFlow = buildAimOperatorEndToEndLocalFlow({
  ...(validDraft as AimManualEvidenceDraft),
  draftId: "draft_bad_001",
  proposedAction: "Buy now and execute trade immediately."
});

const refusedRecord = buildAimLocalRecordPacket(badFlow);

assert(refusedRecord.recordStatus === "LOCAL_RECORD_REFUSED", "Refused flow should create refused local record.");
assert(refusedRecord.decisionId === "", "Refused local record must not invent decision ID.");
assert(refusedRecord.journalPacketId === "", "Refused local record must not invent journal ID.");
assert(refusedRecord.mayExecuteTrade === false, "Refused local record must not execute trade.");
assert(refusedRecord.finalAction === "", "Refused local record final action must remain blank.");

console.log("AIM_PASS_11_LOCAL_RECORD_SAVE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "local record packet created",
      "local record deterministic",
      "safe flow creates ready local record",
      "refused flow creates refused local record",
      "local record path bounded to AIM records",
      "record read-only",
      "record frozen",
      "no S:\\SOUL write",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no source mutation",
      "final action remains blank",
      "human authority remains final"
    ],
    recordStatus: record.recordStatus,
    refusedRecordStatus: refusedRecord.recordStatus
  },
  null,
  2
));