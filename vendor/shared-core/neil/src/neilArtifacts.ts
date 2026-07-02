import type { NeilNegotiationPacket } from "./neilContracts.js";

export interface NeilNegotiationArtifact {
  packetId: string;
  createdAt: string;
  status: NeilNegotiationPacket["status"];
  matterType: NeilNegotiationPacket["matterType"];
  counterpart: string;
  primetimeModeState: NeilNegotiationPacket["primetimeMode"]["modeState"];
  strategyMoves: NeilNegotiationPacket["strategyMoves"];
  safetyReview: NeilNegotiationPacket["safetyReview"];
  conditions: string[];
  refusalReasons: string[];
  responseDraft: string;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export function createNeilNegotiationArtifact(packet: NeilNegotiationPacket): NeilNegotiationArtifact {
  return Object.freeze({
    packetId: packet.packetId,
    createdAt: packet.createdAt,
    status: packet.status,
    matterType: packet.matterType,
    counterpart: packet.counterpart,
    primetimeModeState: packet.primetimeMode.modeState,
    strategyMoves: packet.strategyMoves,
    safetyReview: packet.safetyReview,
    conditions: packet.conditions,
    refusalReasons: packet.refusalReasons,
    responseDraft: packet.responseDraft,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  });
}