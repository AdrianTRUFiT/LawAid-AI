import * as crypto from "node:crypto";

export type PTECEscalationState =
  | "REJECTED"
  | "HELD"
  | "ALLOW_TO_QUEUE"
  | "ALLOW_TO_EXECUTE"
  | "ESCALATION_REQUIRED";

export type PTECReason =
  | "UNTRUSTED_SIGNAL"
  | "MISSING_PROOF"
  | "MISSING_AUTHORITY"
  | "PACC_REVIEW_REQUIRED"
  | "PACC_LOCKED"
  | "DUPLICATE_RISK"
  | "VALID_LOW_RISK_SIGNAL"
  | "VALID_EXECUTION_READY_SIGNAL"
  | "HUMAN_REVIEW_REQUIRED";

export interface PTECEscalationDecision {
  signalFingerprint: string;
  escalationState: PTECEscalationState;
  reason: PTECReason;
  proofRequired: string[];
  authorityBoundary: string;
  recommendedNextStep: string;
  createdAt: string;
}

export interface PTECOptions {
  knownFingerprints?: Set<string>;
}
function fingerprintSignal(raw: string): string {
  return crypto
    .createHash("sha256")
    .update(
      raw
        .replace(/^\uFEFF/, "")
        .replace(/^---[\s\S]*?---/, "")
        .replace(/\r\n/g, "\n")
        .trim(),
      "utf8"
    )
    .digest("hex");
}


export function classifyPTECEscalation(
  rawSignal: string,
  options: PTECOptions = {}
): PTECEscalationDecision {
  const signalFingerprint = fingerprintSignal(rawSignal);
  const createdAt = new Date().toISOString();

  function decision(
    escalationState: PTECEscalationState,
    reason: PTECReason,
    proofRequired: string[],
    recommendedNextStep: string
  ): PTECEscalationDecision {
    return {
      signalFingerprint,
      escalationState,
      reason,
      proofRequired,
      authorityBoundary:
        "PTEC classifies escalation posture only. It does not execute, route, emit Live System Records, or replace Homebase Executor.",
      recommendedNextStep,
      createdAt
    };
  }

  if (/\bPACC\s+LOCK\b/i.test(rawSignal)) {
    return decision("REJECTED", "PACC_LOCKED", ["authorized_override"], "Reject escalation.");
  }

  if (/\bPACC\s+REVIEW\b|\bPACC\s+PAUSE\b/i.test(rawSignal)) {
    return decision("ESCALATION_REQUIRED", "PACC_REVIEW_REQUIRED", ["human_review"], "Escalate for authorized review.");
  }

  if (options.knownFingerprints?.has(signalFingerprint) || /\bDUPLICATE_RISK\b/i.test(rawSignal)) {
    return decision("HELD", "DUPLICATE_RISK", ["idempotency_review"], "Hold before execution.");
  }

  if (/\bUNTRUSTED_SIGNAL\b|\bUNKNOWN_SOURCE\b/i.test(rawSignal)) {
    return decision("REJECTED", "UNTRUSTED_SIGNAL", ["trusted_source"], "Reject until trusted source exists.");
  }

  if (/\bMISSING_AUTHORITY\b|\bNO_AUTHORITY\b/i.test(rawSignal)) {
    return decision("HELD", "MISSING_AUTHORITY", ["authority_artifact"], "Hold for authority proof.");
  }

  if (/\bMISSING_PROOF\b|\bNO_PROOF\b/i.test(rawSignal)) {
    return decision("HELD", "MISSING_PROOF", ["proof_artifact"], "Hold for proof.");
  }

  if (/\bHUMAN_REVIEW_REQUIRED\b|\bESCALATION_REQUIRED\b/i.test(rawSignal)) {
    return decision("ESCALATION_REQUIRED", "HUMAN_REVIEW_REQUIRED", ["human_review"], "Escalate for human review.");
  }

  if (/\bACTIVATION_READY\b|\bACTIVATION_ELIGIBLE\b|\bCREATE_LIVE_SYSTEM_RECORD\b/i.test(rawSignal)) {
    if (/\bPROOF_ATTACHED\b|\bAUTHORITY_VERIFIED\b|\bVERIFIED_STATE\b/i.test(rawSignal)) {
      return decision("ALLOW_TO_EXECUTE", "VALID_EXECUTION_READY_SIGNAL", [], "Allow Homebase Executor evaluation.");
    }
    return decision("HELD", "MISSING_PROOF", ["proof_artifact", "authority_artifact"], "Hold before execution.");
  }

  return decision("ALLOW_TO_QUEUE", "VALID_LOW_RISK_SIGNAL", [], "Allow queue placement.");
}
