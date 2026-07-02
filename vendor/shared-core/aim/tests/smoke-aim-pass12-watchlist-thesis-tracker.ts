import {
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimWatchlistThesisItem,
  type AimManualEvidenceDraft
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft as AimManualEvidenceDraft);
const record = buildAimLocalRecordPacket(flow);
const watchlist = buildAimWatchlistThesisItem(record, 0);

assert(watchlist.status === "WATCHLIST_ACTIVE", "Ready record should create active watchlist item.");
assert(watchlist.assetOrSubject === record.assetOrSubject, "Watchlist must preserve asset/subject.");
assert(watchlist.thesisReference === record.thesisReference, "Watchlist must preserve thesis reference.");
assert(watchlist.latestRecordId === record.recordId, "Watchlist must point to latest record.");
assert(watchlist.latestPaiSafeStatus === record.paiSafeStatus, "Watchlist must preserve latest PAI-SAFE status.");
assert(watchlist.latestJournalStatus === record.journalStatus, "Watchlist must preserve latest journal status.");
assert(watchlist.recordCount === 1, "Watchlist should begin with one record.");
assert(watchlist.reviewCount === 0, "Watchlist should begin with zero reviews.");
assert(watchlist.readOnly === true, "Watchlist item must be read-only.");
assert(watchlist.localOnly === true, "Watchlist item must be local-only.");
assert(watchlist.humanReviewRequired === true, "Watchlist item must require human review.");
assert(watchlist.mayExecuteTrade === false, "Watchlist item must not execute trade.");
assert(watchlist.mayApproveInvestment === false, "Watchlist item must not approve investment.");
assert(watchlist.mayProvideFinancialAdvice === false, "Watchlist item must not provide financial advice.");
assert(watchlist.mayWriteSoul === false, "Watchlist item must not write S:\\SOUL.");
assert(watchlist.finalAuthority === "Human", "Human authority must remain final.");
assert(watchlist.finalAction === "", "Watchlist final action must remain blank.");
assert(Object.isFrozen(watchlist), "Watchlist item must be frozen.");

const heldFlow = buildAimOperatorEndToEndLocalFlow({
  ...(validDraft as AimManualEvidenceDraft),
  draftId: "draft_hold_001",
  evidenceStrength: "Moderate"
});
const heldRecord = buildAimLocalRecordPacket(heldFlow);
const heldWatchlist = buildAimWatchlistThesisItem(heldRecord, 0);

assert(heldWatchlist.status === "WATCHLIST_HELD", "Held record should create held watchlist item.");

console.log("AIM_PASS_12_WATCHLIST_THESIS_TRACKER_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "watchlist thesis item created",
      "asset and thesis preserved",
      "latest record pointer preserved",
      "latest PAI-SAFE status preserved",
      "latest journal status preserved",
      "active watchlist state works",
      "held watchlist state works",
      "watchlist read-only",
      "watchlist frozen",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    watchlistStatus: watchlist.status,
    heldWatchlistStatus: heldWatchlist.status
  },
  null,
  2
));