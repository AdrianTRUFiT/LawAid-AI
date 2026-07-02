import { loadAllMemoryObjectsDirect } from "./memoryDiskReader";
import { inspectMemoryContext } from "./lineageGraph";
import { buildDerivativeFamilySnapshots } from "./derivativeFamilySnapshot";

type MemoryObject = ReturnType<typeof loadAllMemoryObjectsDirect>[number];

export type GateOverview = {
  candidates: MemoryObject[];
  acceptedNotActive: MemoryObject[];
  acceptedDerivativesPendingActivation: MemoryObject[];
  rootsNeedingHardening: Array<MemoryObject & { downstreamChildrenCount: number }>;
  activeRootsWithDescendants: Array<MemoryObject & { downstreamChildrenCount: number }>;
  retiredIds: string[];
};

function loadRetiredIds(): string[] {
  const fs = require("node:fs");
  const path = require("node:path");
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "retirement");

  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter((f: string) => f.endsWith(".retirement.json"))
    .map((f: string) => f.replace(/\.retirement\.json$/, ""));
}

function acceptedDerivativeTipIds(): Set<string> {
  const families = buildDerivativeFamilySnapshots();
  const ids = families.flatMap((f) =>
    f.members
      .filter((m) => m.isFamilyTip && m.promotion === "accepted")
      .map((m) => m.id)
  );
  return new Set(ids);
}

function isAcceptedDerivative(m: MemoryObject): boolean {
  return Boolean(
    m.tags?.includes("accepted_derivative") ||
    m.id.includes("_accepted_derivative") ||
    m.title.includes("[Accepted Derivative]")
  );
}

export function buildGateOverview(): GateOverview {
  const all = loadAllMemoryObjectsDirect();
  const retiredIds = loadRetiredIds();

  const candidates = all.filter((m) => m.promotion === "candidate");

  const accepted = all.filter((m) => m.promotion === "accepted");
  const tipIds = acceptedDerivativeTipIds();

  const acceptedDerivativesPendingActivation = accepted.filter((m) =>
    isAcceptedDerivative(m) && tipIds.has(m.id)
  );

  const acceptedNotActive = accepted.filter((m) =>
    !isAcceptedDerivative(m)
  );

  const rootsNeedingHardening = all
    .map((m) => {
      const context = inspectMemoryContext(m.id);
      const downstreamChildrenCount = context.downstreamTree?.children?.length ?? 0;
      return { ...m, downstreamChildrenCount };
    })
    .filter((m) =>
      m.downstreamChildrenCount > 0 &&
      (m.promotion === "captured" || m.verification === "unverified")
    );

  const activeRootsWithDescendants = all
    .map((m) => {
      const context = inspectMemoryContext(m.id);
      const downstreamChildrenCount = context.downstreamTree?.children?.length ?? 0;
      return { ...m, downstreamChildrenCount };
    })
    .filter((m) =>
      m.promotion === "active" &&
      m.downstreamChildrenCount > 0
    );

  return {
    candidates,
    acceptedNotActive,
    acceptedDerivativesPendingActivation,
    rootsNeedingHardening,
    activeRootsWithDescendants,
    retiredIds
  };
}
