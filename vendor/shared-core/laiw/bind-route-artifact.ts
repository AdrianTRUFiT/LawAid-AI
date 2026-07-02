import crypto from 'crypto';

export type LAIWRouteInput = {
  need: string;
  options: string[];
  createdAt: number;
};

export type RouteArtifact = {
  routeId: string;
  soulmark: string;
  vitTraceId: string;
  routeHash: string;
  locked: boolean;
  createdAt: number;
};

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function bindRouteArtifact(input: LAIWRouteInput): RouteArtifact {
  const routePayload = JSON.stringify(input);

  const routeHash = sha256(routePayload);

  const soulmark = "SM-" + sha256(routeHash + "SOUL").slice(0, 16);

  const vitTraceId = "VIT-" + sha256(routeHash + "TRACE").slice(0, 16);

  const routeId = "RA-" + sha256(routeHash + "ROUTE").slice(0, 12);

  return {
    routeId,
    soulmark,
    vitTraceId,
    routeHash,
    locked: true,
    createdAt: Date.now()
  };
}
