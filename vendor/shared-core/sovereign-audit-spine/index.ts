export type AuditEventKind =
  | "AUTHORITY_COMMAND"
  | "WAR_ROOM_DECK"
  | "TRIPWIRE_DECISION"
  | "CONSEQUENCE_DECISION"
  | "LAUNCH_PACKET";

export interface SovereignAuditEvent {
  eventId: string;
  eventKind: AuditEventKind;
  transactionRef: string;
  payloadHash: string;
  createdAt: string;
  previousHash: string;
  eventHash: string;
  boundary: {
    auditEventIsNotPaymentAuthority: true;
    auditEventIsNotTransactionTruth: true;
    auditEventIsNotCustodyTransfer: true;
    auditEventIsNotRuntimeActivation: true;
  };
}

export interface SovereignAuditVerifyResult {
  verified: boolean;
  inspectedEvents: number;
  refusalReasons: string[];
  lastValidHash?: string;
  boundary: {
    verifierIsReadOnly: true;
    auditSpineIsNotPaymentAuthority: true;
    auditSpineIsNotTransactionTruth: true;
    auditSpineIsNotCustodyTransfer: true;
    auditSpineIsNotRuntimeActivation: true;
  };
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(",")}}`;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashAuditPayload(payload: unknown): Promise<string> {
  return sha256Hex(canonicalize(payload));
}

export async function appendSovereignAuditEvent(
  ledger: SovereignAuditEvent[],
  eventKind: AuditEventKind,
  transactionRef: string,
  payload: unknown,
  createdAt: string
): Promise<SovereignAuditEvent> {
  const previousHash = ledger.length > 0 ? ledger[ledger.length - 1]!.eventHash : "GENESIS";
  const payloadHash = await hashAuditPayload(payload);
  const body = {
    eventKind,
    transactionRef,
    payloadHash,
    createdAt,
    previousHash
  };
  const eventHash = await sha256Hex(canonicalize(body));

  return {
    eventId: `audit_${ledger.length + 1}_${transactionRef}`,
    eventKind,
    transactionRef,
    payloadHash,
    createdAt,
    previousHash,
    eventHash,
    boundary: {
      auditEventIsNotPaymentAuthority: true,
      auditEventIsNotTransactionTruth: true,
      auditEventIsNotCustodyTransfer: true,
      auditEventIsNotRuntimeActivation: true
    }
  };
}

export async function verifySovereignAuditSpine(
  ledger: SovereignAuditEvent[]
): Promise<SovereignAuditVerifyResult> {
  const refusalReasons: string[] = [];
  let previousHash = "GENESIS";
  let lastValidHash: string | undefined;

  for (const event of ledger) {
    if (event.previousHash !== previousHash) {
      refusalReasons.push("PREVIOUS_HASH_MISMATCH");
      break;
    }

    const expectedHash = await sha256Hex(canonicalize({
      eventKind: event.eventKind,
      transactionRef: event.transactionRef,
      payloadHash: event.payloadHash,
      createdAt: event.createdAt,
      previousHash: event.previousHash
    }));

    if (event.eventHash !== expectedHash) {
      refusalReasons.push("EVENT_HASH_MISMATCH");
      break;
    }

    lastValidHash = event.eventHash;
    previousHash = event.eventHash;
  }

  return {
    verified: refusalReasons.length === 0,
    inspectedEvents: ledger.length,
    refusalReasons,
    ...(lastValidHash ? { lastValidHash } : {}),
    boundary: {
      verifierIsReadOnly: true,
      auditSpineIsNotPaymentAuthority: true,
      auditSpineIsNotTransactionTruth: true,
      auditSpineIsNotCustodyTransfer: true,
      auditSpineIsNotRuntimeActivation: true
    }
  };
}

export const SOVEREIGN_AUDIT_SPINE_DOCTRINE = {
  name: "Sovereign Audit Spine",
  class: "PORTABLE_TAMPER_EVIDENT_AUDIT_CHAIN",
  purpose:
    "Create durable, portable, challenge-ready audit continuity without making audit records authority.",
  boundary: {
    auditIsProofSupportNotAuthority: true,
    auditVerifierIsReadOnly: true,
    sourceTruthRemainsBoundedToAuthorityLayer: true
  }
} as const;
