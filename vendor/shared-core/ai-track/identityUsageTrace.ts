import crypto from 'crypto';
import { IdentityUsageInput, IdentityUsageResult } from './aiTrackContracts';

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function createIdentityUsageTrace(input: IdentityUsageInput, result: IdentityUsageResult) {
  const payload = {
    identityId: input.identityId,
    assetId: input.assetId,
    usageId: input.usageId,
    zoneType: input.zoneType,
    decision: result.decision,
    reason: result.reason,
    consequenceAllowed: result.consequenceAllowed,
    timestamp: Date.now()
  };

  const traceHash = sha256(JSON.stringify(payload));

  return {
    traceId: "AITRACK-" + traceHash.slice(0, 16),
    traceHash,
    payload
  };
}
