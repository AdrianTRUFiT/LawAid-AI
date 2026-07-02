import type {
  TripwireCorrelationCluster,
  TripwireMeshDecision,
  TripwireRefusalCode,
  TripwireRoute,
  TripwireSeverity,
  TripwireSignal,
  TripwireSignalClass,
  TripwireMeshStatus
} from "./liveSignalTripwireContracts";

function severityRank(severity: TripwireSeverity): number {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function maxSeverity(values: TripwireSeverity[]): TripwireSeverity {
  return values.reduce<TripwireSeverity>(
    (max, current) => severityRank(current) > severityRank(max) ? current : max,
    "LOW"
  );
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function sortIso(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function buildClusters(signals: TripwireSignal[]): TripwireCorrelationCluster[] {
  const grouped = new Map<string, TripwireSignal[]>();

  for (const signal of signals) {
    const key = `${signal.transactionRef}::${signal.signalClass}`;
    const existing = grouped.get(key) ?? [];
    existing.push(signal);
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries()).map(([key, items]) => {
    const first = items[0];
    if (!first) throw new Error("TRIPWIRE_CLUSTER_EMPTY");

    const observedTimes = sortIso(items.map((item) => item.observedAt));
    const seams = unique(items.map((item) => item.seam));
    const actualSignalCount = items.filter((item) => item.actualSignal).length;
    const forecastOnlyCount = items.filter((item) => item.forecastOnly).length;
    const highestSeverity = maxSeverity(items.map((item) => item.severity));

    const preBreachLikely =
      actualSignalCount > 0 &&
      (
        seams.length >= 2 ||
        severityRank(highestSeverity) >= severityRank("CRITICAL") ||
        items.length >= 3
      );

    return {
      clusterId: `cluster_${key.replace(/[^a-zA-Z0-9]/g, "_")}`,
      transactionRef: first.transactionRef,
      signalClass: first.signalClass,
      seams,
      signalIds: items.map((item) => item.signalId),
      actualSignalCount,
      forecastOnlyCount,
      highestSeverity,
      firstObservedAt: observedTimes[0] ?? "",
      lastObservedAt: observedTimes[observedTimes.length - 1] ?? "",
      preBreachLikely,
      boundary: {
        clusterIsNotEvidenceAlone: true,
        clusterRequiresActualSignalForHold: true,
        clusterDoesNotCreateAuthority: true
      }
    };
  });
}

function refusalForClass(signalClass: TripwireSignalClass): TripwireRefusalCode | undefined {
  if (signalClass === "SYNTHETIC_AUTHORITY") return "SYNTHETIC_AUTHORITY_REFUSED";
  if (signalClass === "AUTHORITY_CONFUSION") return "AUTHORITY_CONFUSION_DETECTED";
  if (signalClass === "BOUNDARY_DOWNGRADE") return "BOUNDARY_DOWNGRADE_DETECTED";
  if (signalClass === "REPLAY_PRESSURE") return "REPLAY_PRESSURE_DETECTED";
  if (signalClass === "PUBLIC_PRIVATE_LEAKAGE") return "PUBLIC_PRIVATE_LEAKAGE_DETECTED";
  if (signalClass === "TIME_WINDOW_DRIFT") return "TIME_WINDOW_EXPIRED";
  if (signalClass === "PROOF_HEALTH_DEGRADATION") return "PROOF_HEALTH_DEGRADED";
  return undefined;
}

function isAuthorityAttackClass(signalClass: TripwireSignalClass): boolean {
  return (
    signalClass === "BOUNDARY_DOWNGRADE" ||
    signalClass === "AUTHORITY_CONFUSION" ||
    signalClass === "PUBLIC_PRIVATE_LEAKAGE"
  );
}

function routeFromClusters(clusters: TripwireCorrelationCluster[]): {
  route: TripwireRoute;
  status: TripwireMeshStatus;
  refusalReasons: TripwireRefusalCode[];
} {
  const refusalReasons: TripwireRefusalCode[] = [];

  const actualClusters = clusters.filter((cluster) => cluster.actualSignalCount > 0);
  const forecastOnlyClusters = clusters.filter((cluster) => cluster.actualSignalCount === 0 && cluster.forecastOnlyCount > 0);
  const preBreachClusters = clusters.filter((cluster) => cluster.preBreachLikely);

  if (actualClusters.length === 0 && forecastOnlyClusters.length > 0) {
    refusalReasons.push("FORECAST_ONLY_CANNOT_REFUSE");
    return {
      route: "WATCH",
      status: "TRIPWIRE_MESH_WATCH",
      refusalReasons
    };
  }

  const synthetic = actualClusters.find((cluster) => cluster.signalClass === "SYNTHETIC_AUTHORITY");
  if (synthetic) {
    refusalReasons.push("SYNTHETIC_AUTHORITY_REFUSED");
    return {
      route: "INSTANT_REFUSE",
      status: "TRIPWIRE_MESH_REFUSED",
      refusalReasons
    };
  }

  const authorityAttack = actualClusters.some((cluster) =>
    isAuthorityAttackClass(cluster.signalClass)
  );

  const critical = actualClusters.some((cluster) =>
    severityRank(cluster.highestSeverity) >= severityRank("CRITICAL")
  );

  if (authorityAttack || critical) {
    for (const cluster of actualClusters) {
      const code = refusalForClass(cluster.signalClass);
      if (code) refusalReasons.push(code);
    }

    return {
      route: "CRITICAL_ESCALATION",
      status: "TRIPWIRE_MESH_ESCALATED",
      refusalReasons: unique(refusalReasons)
    };
  }

  if (preBreachClusters.length > 0) {
    refusalReasons.push("MULTI_SEAM_PRE_BREACH_DETECTED");

    for (const cluster of preBreachClusters) {
      const code = refusalForClass(cluster.signalClass);
      if (code) refusalReasons.push(code);
    }

    return {
      route: "MACHINE_HOLD",
      status: "TRIPWIRE_MESH_PRE_BREACH_HOLD",
      refusalReasons: unique(refusalReasons)
    };
  }

  if (actualClusters.length > 0) {
    return {
      route: "WATCH",
      status: "TRIPWIRE_MESH_WATCH",
      refusalReasons
    };
  }

  return {
    route: "CLEAR",
    status: "TRIPWIRE_MESH_CLEAR",
    refusalReasons
  };
}

export function evaluateLiveSignalTripwireMesh(
  transactionRef: string,
  signals: TripwireSignal[],
  evaluatedAt: string
): TripwireMeshDecision {
  const scopedSignals = signals.filter((signal) => signal.transactionRef === transactionRef);
  const clusters = buildClusters(scopedSignals);
  const routed = routeFromClusters(clusters);

  const requiredCorrections: string[] = [];

  if (routed.refusalReasons.includes("FORECAST_ONLY_CANNOT_REFUSE")) {
    requiredCorrections.push("Keep forecast-only pressure in WATCH until actual signal appears.");
  }

  if (routed.refusalReasons.includes("MULTI_SEAM_PRE_BREACH_DETECTED")) {
    requiredCorrections.push("Hold consequence and route correlated pressure to Consequence Intelligence.");
  }

  if (routed.refusalReasons.includes("SYNTHETIC_AUTHORITY_REFUSED")) {
    requiredCorrections.push("Instantly refuse synthetic authority and preserve evidence.");
  }

  if (
    routed.refusalReasons.includes("BOUNDARY_DOWNGRADE_DETECTED") ||
    routed.refusalReasons.includes("AUTHORITY_CONFUSION_DETECTED") ||
    routed.refusalReasons.includes("PUBLIC_PRIVATE_LEAKAGE_DETECTED")
  ) {
    requiredCorrections.push("Escalate authority-attack class pressure without creating transaction truth.");
  }

  const explanation =
    routed.route === "CLEAR"
      ? "No tripwire pressure detected."
      : routed.route === "WATCH"
        ? "Tripwire pressure detected; watch posture only unless actual signal requires hold."
        : routed.route === "MACHINE_HOLD"
          ? "Multi-seam pre-breach pressure detected; machine hold without authority creation."
          : routed.route === "CRITICAL_ESCALATION"
            ? "Authority-attack or critical live signal detected; escalate without creating transaction truth."
            : "Synthetic authority or equivalent critical signal refused without creating authority.";

  return {
    status: routed.status,
    route: routed.route,
    transactionRef,
    evaluatedAt,
    clusters,
    refusalReasons: unique(routed.refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    explanation,
    boundary: {
      meshIsNotPaymentAuthority: true,
      meshIsNotTransactionTruth: true,
      meshIsNotCustodyTransfer: true,
      meshIsNotRuntimeActivation: true,
      forecastIsNotEvidence: true,
      predictionCannotRefuseTransactionAlone: true,
      fundTrackerAIRemainsTransactionTruth: true,
      consequenceIntelligenceRemainsPreConsequenceGate: true
    }
  };
}
