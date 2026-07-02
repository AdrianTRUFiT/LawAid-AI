import * as fs from "node:fs";

export type NormalizedOverlapPair = {
  pairKey: string;
  leftId: string;
  rightId: string;
  sharedSourceRefCount: number;
  sharedSourceRefsKnown: boolean;
};

export type NormalizedRuntimeClosureAudit = {
  schemaVersion: string;
  auditId: string;
  proposalId: string;
  proposedAction: string;
  runtimeClosureState: string;
  deterministicReplayKey: string;
  reasons: string[];
  degradedIds: string[];
  activeHazards: string[];
  anomalySignals: string[];
  overlapPairs: NormalizedOverlapPair[];
  overlapPairKeys: string[];
};

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function pairKeyFromHazard(hazard: string): string | null {
  if (!hazard.startsWith("duplicate_active_orphan_pair:")) return null;
  return hazard.slice("duplicate_active_orphan_pair:".length);
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function buildPair(leftId: string, rightId: string, sharedSourceRefCount: number, sharedSourceRefsKnown: boolean): NormalizedOverlapPair {
  const [left, right] = sortStrings([leftId, rightId]);
  return {
    pairKey: `${left}|${right}`,
    leftId: left,
    rightId: right,
    sharedSourceRefCount,
    sharedSourceRefsKnown
  };
}

function inferOverlapPairsFromLegacyAudit(audit: any): NormalizedOverlapPair[] {
  const hazards = audit.truth?.hazardState?.activeHazards ?? [];
  const anomalySignals = audit.truth?.anomalyState?.anomalySignals ?? [];
  const degradedIds = sortStrings(audit.truth?.supportState?.degradedIds ?? []);

  const countMap = new Map<string, number>();
  for (const signal of anomalySignals) {
    if (typeof signal !== "string") continue;
    if (!signal.startsWith("source_ref_overlap_count:")) continue;

    const rest = signal.slice("source_ref_overlap_count:".length);
    const lastColon = rest.lastIndexOf(":");
    if (lastColon === -1) continue;

    const pairKey = rest.slice(0, lastColon);
    const count = Number(rest.slice(lastColon + 1));
    if (!Number.isNaN(count)) {
      countMap.set(pairKey, count);
    }
  }

  const pairStyle: NormalizedOverlapPair[] = [];
  for (const hazard of hazards) {
    const pairKey = pairKeyFromHazard(hazard);
    if (!pairKey) continue;

    const split = pairKey.split("|");
    if (split.length !== 2) continue;

    pairStyle.push(buildPair(split[0], split[1], countMap.get(pairKey) ?? 0, false));
  }

  if (pairStyle.length > 0) {
    return pairStyle.sort((a, b) => a.pairKey.localeCompare(b.pairKey));
  }

  const legacyOverlapIds = sortStrings(
    anomalySignals
      .filter((x: unknown) => typeof x === "string" && x.startsWith("overlap:"))
      .map((x: string) => x.slice("overlap:".length))
  );

  if (
    degradedIds.length === 2 &&
    legacyOverlapIds.length === 2 &&
    degradedIds[0] === legacyOverlapIds[0] &&
    degradedIds[1] === legacyOverlapIds[1]
  ) {
    return [
      buildPair(degradedIds[0], degradedIds[1], 0, false)
    ];
  }

  return [];
}

function normalizeOverlapPairs(audit: any): NormalizedOverlapPair[] {
  if (Array.isArray(audit.overlapPairs)) {
    return [...audit.overlapPairs]
      .map((pair: any) => buildPair(
        pair.leftId,
        pair.rightId,
        Array.isArray(pair.sharedSourceRefs) ? pair.sharedSourceRefs.length : 0,
        Array.isArray(pair.sharedSourceRefs)
      ))
      .sort((a, b) => a.pairKey.localeCompare(b.pairKey));
  }

  return inferOverlapPairsFromLegacyAudit(audit);
}

export function normalizeRuntimeClosureAuditFromFile(filePath: string): NormalizedRuntimeClosureAudit {
  const audit = readJson(filePath);
  const overlapPairs = normalizeOverlapPairs(audit);

  return {
    schemaVersion: audit.schemaVersion ?? "runtime_closure_audit.v1_inferred",
    auditId: audit.auditId ?? "",
    proposalId: audit.proposal?.proposalId ?? "",
    proposedAction: audit.proposal?.proposedAction ?? "",
    runtimeClosureState: audit.envelope?.runtimeClosureState ?? "UNKNOWN",
    deterministicReplayKey: audit.envelope?.deterministicReplayKey ?? "",
    reasons: sortStrings(audit.envelope?.runtimeReasons ?? []),
    degradedIds: sortStrings(audit.truth?.supportState?.degradedIds ?? []),
    activeHazards: sortStrings(audit.truth?.hazardState?.activeHazards ?? []),
    anomalySignals: sortStrings(audit.truth?.anomalyState?.anomalySignals ?? []),
    overlapPairs,
    overlapPairKeys: sortStrings(overlapPairs.map((p) => p.pairKey))
  };
}
