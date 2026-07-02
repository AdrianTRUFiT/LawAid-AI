import type {
  InputBundle,
  InputContribution,
  NormalizedField,
  TrustClassification,
} from "./inputTrustTypes.js";
import { normalizeBySemanticType } from "./valueNormalizer.js";

function sourcePriority(input: {
  contribution: InputContribution;
  classification: TrustClassification;
}): number {
  if (input.classification.secureAllowed) return 400;
  if (input.classification.primaryRouteAuthority) return 300;
  if (input.classification.coordinateAllowed) return 200;
  if (input.classification.enrichAllowed) return 100;
  return 0;
}

export function buildNormalizedFields(input: {
  bundle: InputBundle;
  classifications: TrustClassification[];
}): { normalizedFields: NormalizedField[]; conflictMessages: string[] } {
  const bySourceId = new Map(input.classifications.map((x) => [x.sourceId, x]));
  const accepted = new Map<string, { field: NormalizedField; priority: number }>();
  const conflicts: string[] = [];

  for (const contribution of input.bundle.contributions) {
    const classification = bySourceId.get(contribution.sourceId);
    if (!classification) continue;

    for (const variable of contribution.variables) {
      const normalizedValue = normalizeBySemanticType({
        semanticType: variable.semanticType,
        value: variable.value,
      });

      const priority = sourcePriority({
        contribution,
        classification,
      });

      const existing = accepted.get(variable.key);

      const candidate: NormalizedField = {
        key: variable.key,
        semanticType: variable.semanticType,
        rawValue: variable.value,
        normalizedValue,
        acceptedFromSourceId: contribution.sourceId,
        acceptedFromTrustLevel: classification.trustLevel,
        reason: classification.reason,
      };

      if (!existing) {
        accepted.set(variable.key, {
          field: candidate,
          priority,
        });
        continue;
      }

      if (existing.field.normalizedValue !== candidate.normalizedValue) {
        conflicts.push(
          `Conflict on ${variable.key}: ${String(existing.field.normalizedValue)} vs ${String(candidate.normalizedValue)}.`,
        );
      }

      if (priority > existing.priority) {
        accepted.set(variable.key, {
          field: candidate,
          priority,
        });
      }
    }
  }

  return {
    normalizedFields: Array.from(accepted.values()).map((x) => x.field),
    conflictMessages: conflicts,
  };
}