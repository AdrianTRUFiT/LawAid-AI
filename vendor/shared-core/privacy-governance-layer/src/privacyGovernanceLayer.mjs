import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/DEV/AIVA/shared-core/privacy-governance-layer";
const dirs = {
  identity: path.join(ROOT, "records", "identity"),
  consent: path.join(ROOT, "records", "consent"),
  erasure: path.join(ROOT, "records", "erasure"),
  restriction: path.join(ROOT, "records", "restriction"),
  portability: path.join(ROOT, "records", "portability"),
  refusals: path.join(ROOT, "records", "refusals")
};

Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));

export const PRIVACY_STATUS = {
  PERMITTED: "PERMITTED",
  RESTRICTED: "RESTRICTED",
  REFUSED: "REFUSED",
  ERASED: "ERASED"
};

export const LAWFUL_BASIS = {
  CONSENT: "CONSENT",
  LEGITIMATE_INTEREST: "LEGITIMATE_INTEREST",
  CONTRACT: "CONTRACT",
  LEGAL_OBLIGATION: "LEGAL_OBLIGATION"
};

export const RESTRICTION_REASONS = {
  LEGAL_HOLD: "LEGAL_HOLD",
  DISPUTE_PRESERVATION: "DISPUTE_PRESERVATION",
  COMPLIANCE_REVIEW: "COMPLIANCE_REVIEW",
  USER_PAUSE: "USER_PAUSE",
  PROCESSING_OBJECTION: "PROCESSING_OBJECTION"
};

export const PRIVACY_REFUSALS = {
  NO_LAWFUL_BASIS: "NO_LAWFUL_BASIS",
  CONSENT_REVOKED: "CONSENT_REVOKED",
  PROCESSING_RESTRICTED: "PROCESSING_RESTRICTED",
  ERASURE_REQUEST_ACTIVE: "ERASURE_REQUEST_ACTIVE",
  PII_SCOPE_VIOLATION: "PII_SCOPE_VIOLATION",
  DATA_MINIMIZATION_FAILURE: "DATA_MINIMIZATION_FAILURE"
};

function id(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function sha256(v) {
  return crypto.createHash("sha256").update(String(v)).digest("hex");
}

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function list(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f));
}

export function classifyPII(input = {}) {
  const piiFields = Object.keys(input).filter(f =>
    ["name", "email", "phone", "username", "ip", "address", "userId", "subjectId"].includes(f)
  );
  return {
    hasPII: piiFields.length > 0,
    piiFields,
    classification: piiFields.length ? "PII_PRESENT" : "NO_PII_DETECTED"
  };
}

export function minimizeSignalPayload(input = {}) {
  return {
    source: input.source,
    sourceId: input.sourceId,
    sourceUrl: input.sourceUrl || null,
    content: input.content,
    detectedNeed: input.detectedNeed,
    painCategory: input.painCategory,
    urgency: input.urgency,
    decisionReadinessScore: input.decisionReadinessScore,
    recommendedIntervention: input.recommendedIntervention || null,
    recommendedAIOPPath: input.recommendedAIOPPath || null,
    lawfulBasis: input.lawfulBasis || null,
    identityRef: input.identityRef || null
  };
}

export function createIdentityRef(identity = {}) {
  const identityId = id("PGL-ID");
  const record = {
    identityId,
    privacyStatus: PRIVACY_STATUS.PERMITTED,
    identityHash: sha256(JSON.stringify(identity)),
    protectedFields: {
      username: identity.username || null,
      email: identity.email || null,
      phone: identity.phone || null,
      name: identity.name || null
    },
    createdAt: new Date().toISOString()
  };
  write(path.join(dirs.identity, `${identityId}.json`), record);
  return { accepted: true, identityId, privacyStatus: record.privacyStatus };
}

export function createConsentRecord(input = {}) {
  if (!input.identityRef) return privacyRefusal(PRIVACY_REFUSALS.NO_LAWFUL_BASIS, { reason: "Missing identityRef." });

  const consentId = id("PGL-CONSENT");
  const record = {
    consentId,
    identityRef: input.identityRef,
    lawfulBasis: input.lawfulBasis || LAWFUL_BASIS.CONSENT,
    scopes: input.scopes || [],
    granted: true,
    revoked: false,
    grantedAt: new Date().toISOString()
  };
  write(path.join(dirs.consent, `${consentId}.json`), record);
  return { accepted: true, consentId, identityRef: input.identityRef, lawfulBasis: record.lawfulBasis, scopes: record.scopes };
}

export function restrictProcessing(input = {}) {
  const identityFile = path.join(dirs.identity, `${input.identityRef}.json`);
  const identity = read(identityFile);
  if (!identity) return privacyRefusal(PRIVACY_REFUSALS.PROCESSING_RESTRICTED, { reason: "Identity not found.", identityRef: input.identityRef });

  const restrictionId = id("PGL-RESTRICT");
  const restriction = {
    restrictionId,
    identityRef: input.identityRef,
    privacyStatus: PRIVACY_STATUS.RESTRICTED,
    restrictionReason: input.restrictionReason,
    restrictionTrigger: input.restrictionTrigger || "MANUAL_RESTRICTION",
    restrictedAt: new Date().toISOString(),
    restrictedBy: input.restrictedBy || "AUTHORIZED_OPERATOR",
    exitCondition: input.exitCondition || "AUTHORIZED_REVIEW_REQUIRED",
    exitAuthority: input.exitAuthority || "PRIVACY_AUTHORITY",
    reviewDueAt: input.reviewDueAt || null,
    allowedActions: input.allowedActions || ["PRESERVE_RECORD", "EXPORT_PORTABILITY_PACKET", "REVIEW_STATUS"],
    blockedActions: input.blockedActions || ["CAPTURE_SIGNAL", "QUALIFY_SIGNAL", "ROUTE_OPPORTUNITY", "PROCESS_DOWNSTREAM"]
  };

  write(identityFile, { ...identity, privacyStatus: PRIVACY_STATUS.RESTRICTED, activeRestrictionId: restrictionId });
  write(path.join(dirs.restriction, `${restrictionId}.json`), restriction);

  return { accepted: true, ...restriction };
}

export function liftRestriction(identityRef, liftedBy = "PRIVACY_AUTHORITY") {
  const identityFile = path.join(dirs.identity, `${identityRef}.json`);
  const identity = read(identityFile);
  if (!identity) return privacyRefusal(PRIVACY_REFUSALS.PROCESSING_RESTRICTED, { reason: "Identity not found.", identityRef });

  write(identityFile, {
    ...identity,
    privacyStatus: PRIVACY_STATUS.PERMITTED,
    activeRestrictionId: null,
    restrictionLiftedAt: new Date().toISOString(),
    restrictionLiftedBy: liftedBy
  });

  return { accepted: true, identityRef, privacyStatus: PRIVACY_STATUS.PERMITTED };
}

export function requestErasure(identityRef, reason = "DATA_SUBJECT_REQUEST") {
  const identityFile = path.join(dirs.identity, `${identityRef}.json`);
  const identity = read(identityFile);
  if (!identity) return privacyRefusal(PRIVACY_REFUSALS.ERASURE_REQUEST_ACTIVE, { identityRef, reason: "Identity not found." });

  const requestId = id("PGL-ERASURE");
  write(identityFile, {
    identityId: identity.identityId,
    privacyStatus: PRIVACY_STATUS.ERASED,
    identityHash: identity.identityHash,
    protectedFields: { username: null, email: null, phone: null, name: null },
    erasedAt: new Date().toISOString(),
    erasureReason: reason
  });

  write(path.join(dirs.erasure, `${requestId}.json`), {
    requestId,
    identityRef,
    action: "IDENTITY_PAYLOAD_ERASED_ARTIFACT_SHELL_PRESERVED",
    reason,
    completedAt: new Date().toISOString()
  });

  return { accepted: true, requestId, identityRef, privacyStatus: PRIVACY_STATUS.ERASED };
}

export function exportPortabilityPacket(identityRef) {
  const identity = read(path.join(dirs.identity, `${identityRef}.json`));
  if (!identity) return privacyRefusal(PRIVACY_REFUSALS.NO_LAWFUL_BASIS, { reason: "Identity not found.", identityRef });

  const packetId = id("PGL-PORTABILITY");
  const consents = list(dirs.consent).map(read).filter(c => c?.identityRef === identityRef);
  const restrictions = list(dirs.restriction).map(read).filter(r => r?.identityRef === identityRef);
  const erasures = list(dirs.erasure).map(read).filter(e => e?.identityRef === identityRef);

  const packet = {
    packetId,
    identityRef,
    privacyStatus: identity.privacyStatus,
    protectedFields: identity.protectedFields,
    consents,
    restrictions,
    erasures,
    exportedAt: new Date().toISOString()
  };

  write(path.join(dirs.portability, `${packetId}.json`), packet);
  return { accepted: true, packetId, identityRef, privacyStatus: identity.privacyStatus };
}

export function verifyPrivacyPermission(input = {}) {
  if (!input.lawfulBasis) return { accepted: false, privacyStatus: PRIVACY_STATUS.REFUSED, refusalType: PRIVACY_REFUSALS.NO_LAWFUL_BASIS };

  const identity = input.identityRef ? read(path.join(dirs.identity, `${input.identityRef}.json`)) : null;

  if (identity?.privacyStatus === PRIVACY_STATUS.ERASED) {
    return { accepted: false, privacyStatus: PRIVACY_STATUS.ERASED, refusalType: PRIVACY_REFUSALS.ERASURE_REQUEST_ACTIVE };
  }

  if (identity?.privacyStatus === PRIVACY_STATUS.RESTRICTED) {
    return { accepted: false, privacyStatus: PRIVACY_STATUS.RESTRICTED, refusalType: PRIVACY_REFUSALS.PROCESSING_RESTRICTED };
  }

  if (input.lawfulBasis === LAWFUL_BASIS.CONSENT) {
    const valid = list(dirs.consent).map(read).find(c =>
      c?.identityRef === input.identityRef &&
      c.granted === true &&
      c.revoked === false &&
      (!input.requiredScope || c.scopes.includes(input.requiredScope))
    );
    if (!valid) return { accepted: false, privacyStatus: PRIVACY_STATUS.REFUSED, refusalType: PRIVACY_REFUSALS.CONSENT_REVOKED };
  }

  return { accepted: true, privacyStatus: PRIVACY_STATUS.PERMITTED, privacyState: "PERMISSION_VERIFIED" };
}

export function privacyRefusal(type, detail = {}) {
  const refusal = { accepted: false, refusalType: type, detail, refusedAt: new Date().toISOString() };
  write(path.join(dirs.refusals, `PGL-REFUSAL-${Date.now()}.json`), refusal);
  return refusal;
}
