import type { RegistryEntry } from "./trustSpineContracts.js";
import { makeId, nowIso, sha256, stableStringify } from "./trustSpineUtils.js";

export class TrustRegistry {
  private entries: RegistryEntry[] = [];

  list(): RegistryEntry[] {
    return [...this.entries];
  }

  append(
    artifactId: string,
    action: RegistryEntry["action"],
    details: Record<string, unknown>,
  ): RegistryEntry {
    const previousHash =
      this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : null;

    const entryBase = {
      entryId: makeId("registry"),
      artifactId,
      action,
      recordedAt: nowIso(),
      previousHash,
      details,
    };

    const hash = sha256(stableStringify(entryBase));

    const entry: RegistryEntry = {
      ...entryBase,
      hash,
    };

    this.entries.push(entry);
    return entry;
  }

  verifyChain(): boolean {
    for (let i = 0; i < this.entries.length; i += 1) {
      const entry = this.entries[i];
      const expectedPreviousHash = i === 0 ? null : this.entries[i - 1].hash;

      if (entry.previousHash !== expectedPreviousHash) {
        return false;
      }

      const expectedHash = sha256(
        stableStringify({
          entryId: entry.entryId,
          artifactId: entry.artifactId,
          action: entry.action,
          recordedAt: entry.recordedAt,
          previousHash: entry.previousHash,
          details: entry.details,
        }),
      );

      if (entry.hash !== expectedHash) {
        return false;
      }
    }

    return true;
  }
}