import { STATUS_TABLES } from "./statusNormalizationTables.js";
import type {
  StatusNormalizationInput,
  StatusNormalizationOutput,
  StatusNormalizationResult,
} from "./statusNormalizationTypes.js";
import { normalizeRawStatus } from "./statusNormalizationUtils.js";

export function normalizeStatus(
  input: StatusNormalizationInput,
): StatusNormalizationResult {
  if (!input.rawStatus || input.rawStatus.trim() === "") {
    return {
      ok: false,
      output: null,
      refusal: {
        refusalCode: "EMPTY_STATUS",
        refusalReason: "Status normalization refused because rawStatus is empty.",
      },
    };
  }

  const table = STATUS_TABLES[input.domain];

  if (!table) {
    return {
      ok: false,
      output: null,
      refusal: {
        refusalCode: "INVALID_DOMAIN",
        refusalReason: "Status normalization refused because domain is invalid.",
      },
    };
  }

  const normalizedRaw = normalizeRawStatus(input.rawStatus);
  const canonical = table[normalizedRaw];

  if (!canonical) {
    return {
      ok: false,
      output: null,
      refusal: {
        refusalCode: "INVALID_STATUS",
        refusalReason: `Status normalization refused because rawStatus '${input.rawStatus}' is not recognized for domain '${input.domain}'.`,
      },
    };
  }

  const output: StatusNormalizationOutput = {
    sourceSystem: input.sourceSystem,
    domain: input.domain,
    rawStatus: input.rawStatus,
    canonicalStatus: canonical,
    recognized: true,
    reason: `Mapped '${normalizedRaw}' to canonical status '${canonical}'.`,
  };

  return {
    ok: true,
    output,
    refusal: null,
  };
}