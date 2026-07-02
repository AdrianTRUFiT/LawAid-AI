import type { OperatorRouteResult } from "../../operator-routing-layer/src/index.js";
import type { AppBindingEnvelope, LawAidAIBindingViewModel } from "./contracts.js";
import { validateRouteResultForBinding } from "./validators.js";

export function bindLawAidAIView(
  result: OperatorRouteResult,
): AppBindingEnvelope<LawAidAIBindingViewModel> {
  const validation = validateRouteResultForBinding(result);

  if (!validation.ok || !result.districtPacket || result.districtPacket.districtType !== "LAWAIDAI") {
    return {
      appKey: "LAWAIDAI",
      bound: false,
      reason: validation.reason,
      routeDecision: result.decision,
      packet: result.districtPacket,
      viewModel: {
        routeDecision: result.decision,
        routeReason: result.reason,
        matterOpen: false,
        sourceLiveRecordId: null,
        ownerId: null,
        merchantId: null,
        evidenceAnchorIds: [],
        displaySummary: result.reason,
      },
    };
  }

  const packet = result.districtPacket;

  return {
    appKey: "LAWAIDAI",
    bound: true,
    reason: "LawAidAI binding created.",
    routeDecision: result.decision,
    packet,
    viewModel: {
      routeDecision: result.decision,
      routeReason: result.reason,
      matterOpen: packet.matterStatus === "open",
      sourceLiveRecordId: packet.sourceLiveRecordId,
      ownerId: packet.ownerId,
      merchantId: packet.merchantId,
      evidenceAnchorIds: packet.evidenceAnchorIds,
      displaySummary: packet.summary,
    },
  };
}