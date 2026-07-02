export * from "./girContracts";
export * from "./girStateMachine";
export * from "./girPolicy";
export * from "./girRuntime";
export * from "./girAudit";

export const GIR_DOCTRINE = {
  name: "Governed Intelligence Runtime",
  role: "Domain-neutral runtime state machine",
  sequence: "Signal -> Readiness -> Decision -> Verification -> Action -> Proof -> Expansion -> Learning",
  resultStates: ["SAFE", "HOLD", "REFUSED"],
  authorityBoundary: "GIR evaluates transition eligibility only. GIR does not authorize consequence.",
  channelStudioMapping: {
    SIGNAL: "audience friction",
    READINESS: "topic qualification",
    DECISION: "strategy packet",
    VERIFICATION: "DAVE check",
    ACTION: "asset production",
    PROOF: "performance record",
    EXPANSION: "MACE package",
    LEARNING: "replication recommendation"
  }
};
