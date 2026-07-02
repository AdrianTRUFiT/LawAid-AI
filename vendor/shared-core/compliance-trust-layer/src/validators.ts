import type {
  ComplianceTrustRequest,
  DisclosurePolicy,
} from "./contracts.js";

export function validateComplianceTrustRequestShape(
  input: unknown,
): input is ComplianceTrustRequest {
  if (!input || typeof input !== "object") return false;

  const request = input as Record<string, unknown>;

  const stringFields = [
    "requestId",
    "requestedArtifactType",
    "nonce",
    "validFrom",
    "validUntil",
    "requestedAt",
  ];

  for (const field of stringFields) {
    if (typeof request[field] !== "string" || !request[field]) return false;
  }

  if (typeof request["usageLimit"] !== "number") return false;
  if (!Array.isArray(request["claims"])) return false;

  const subject = request["subject"];
  if (!subject || typeof subject !== "object") return false;

  const policy = request["policy"];
  if (!policy || typeof policy !== "object") return false;

  return true;
}

export function validatePolicySatisfaction(input: {
  claims: ComplianceTrustRequest["claims"];
  policy: DisclosurePolicy;
}): { ok: boolean; reason: string } {
  const activeClaimTypes = new Set(
    input.claims
      .filter((claim) => claim.status === "eligible")
      .map((claim) => claim.claimType),
  );

  for (const required of input.policy.requiredClaims) {
    if (!activeClaimTypes.has(required)) {
      return {
        ok: false,
        reason: `Missing required eligible claim: ${required}.`,
      };
    }
  }

  return {
    ok: true,
    reason: "Policy satisfied.",
  };
}

export function validateTimeWindow(input: {
  validFrom: string;
  validUntil: string;
  allowExpiredUse: boolean;
  now?: Date;
}): { ok: boolean; reason: string } {
  const now = input.now ?? new Date();
  const from = new Date(input.validFrom);
  const until = new Date(input.validUntil);

  if (Number.isNaN(from.getTime()) || Number.isNaN(until.getTime())) {
    return {
      ok: false,
      reason: "Invalid time window.",
    };
  }

  if (now < from) {
    return {
      ok: false,
      reason: "Attestation is not yet valid.",
    };
  }

  if (!input.allowExpiredUse && now > until) {
    return {
      ok: false,
      reason: "Attestation has expired.",
    };
  }

  return {
    ok: true,
    reason: "Time window valid.",
  };
}