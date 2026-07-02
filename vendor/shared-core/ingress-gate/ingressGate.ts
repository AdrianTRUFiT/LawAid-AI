import crypto from 'crypto';
import { runOneSignalClosureProof } from '../one-signal-closure-proof/oneSignalClosureProof';

export type IngressDecision = "ACCEPTED" | "REFUSED" | "HELD";

export type IngressInput = {
  source: "LAWAIDAI" | "AI_TRACK" | "LAIW" | "SYSTEM_TEST" | "UNKNOWN";
  rawSignal: string;
  actorId?: string;
  intendedPath?: "LAW_AID_CLARITY" | "IDENTITY_USAGE" | "LOGISTICS_ROUTE" | "TEST_PATH";
  consent?: boolean;
  timestamp?: number;
};

export type IngressPacket = {
  ingressId: string;
  decision: IngressDecision;
  reason: string;
  receivedAt: number;
  normalized?: {
    source: string;
    actorId: string;
    rawSignalHash: string;
    intendedPath: string;
    consent: boolean;
  };
  proof?: any;
};

function sha(input: any) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function evaluateIngress(input: IngressInput): IngressPacket {
  const receivedAt = Date.now();
  const ingressId = "ING-" + sha({ input, receivedAt }).slice(0, 12);

  if (!input.rawSignal || input.rawSignal.trim().length < 5) {
    return {
      ingressId,
      decision: "REFUSED",
      reason: "RAW_SIGNAL_REQUIRED",
      receivedAt
    };
  }

  if (!input.actorId) {
    return {
      ingressId,
      decision: "HELD",
      reason: "ACTOR_ID_REQUIRED",
      receivedAt
    };
  }

  if (!input.intendedPath) {
    return {
      ingressId,
      decision: "HELD",
      reason: "INTENDED_PATH_REQUIRED",
      receivedAt
    };
  }

  if (input.source === "UNKNOWN") {
    return {
      ingressId,
      decision: "REFUSED",
      reason: "UNKNOWN_SOURCE_REFUSED",
      receivedAt
    };
  }

  if (input.consent !== true) {
    return {
      ingressId,
      decision: "REFUSED",
      reason: "CONSENT_REQUIRED_AT_INGRESS",
      receivedAt
    };
  }

  const normalized = {
    source: input.source,
    actorId: input.actorId,
    rawSignalHash: sha(input.rawSignal),
    intendedPath: input.intendedPath,
    consent: true
  };

  const proof = runOneSignalClosureProof();

  return {
    ingressId,
    decision: "ACCEPTED",
    reason: "INGRESS_ACCEPTED_AND_NORMALIZED",
    receivedAt,
    normalized,
    proof
  };
}
