import type {
  InputSourceClass,
  TrustClassification,
  ValidationReport,
} from "./verificationAdmissionsTypes.js";

function classifyBaseTrust(sourceClass: InputSourceClass): Omit<TrustClassification, "reason"> {
  switch (sourceClass) {
    case "live":
    case "operator":
      return {
        trustClass: "production_trusted",
        productionEligible: true,
        weighting: 1.0,
      };
    case "external_feed":
    case "historical":
      return {
        trustClass: "conditionally_trusted",
        productionEligible: true,
        weighting: 0.8,
      };
    case "synthetic":
    case "simulated":
      return {
        trustClass: "synthetic_only",
        productionEligible: false,
        weighting: 0.35,
      };
  }
}

export function classifyTrust(
  sourceClass: InputSourceClass,
  validation: ValidationReport,
): TrustClassification {
  const base = classifyBaseTrust(sourceClass);

  if (!validation.valid) {
    return {
      trustClass: "quarantined",
      productionEligible: false,
      weighting: 0,
      reason: "Validation failed; item is quarantined.",
    };
  }

  if (base.trustClass === "synthetic_only") {
    return {
      ...base,
      reason: "Schema-valid synthetic/simulated input accepted for processability but not production consequence.",
    };
  }

  if (validation.warnings.length > 0 && base.trustClass === "production_trusted") {
    return {
      trustClass: "conditionally_trusted",
      productionEligible: true,
      weighting: 0.75,
      reason: "Validation passed with warnings; downgraded to conditional trust.",
    };
  }

  return {
    ...base,
    reason: "Validation passed and source class supports governed admission.",
  };
}