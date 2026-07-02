import type {
  InputContribution,
  InputTrustLevel,
  TrustClassification,
} from "./inputTrustTypes.js";

function deriveTrustLevel(contribution: InputContribution): InputTrustLevel {
  if (contribution.governanceVerified) return "governed";
  if (contribution.sourceAuthenticated) return "reliable";
  if (contribution.sourceClass === "supportive") return "supportive";
  return "raw";
}

export function classifyContribution(
  contribution: InputContribution,
): TrustClassification {
  const trustLevel = deriveTrustLevel(contribution);

  const primaryRouteAuthority = contribution.sourceClass === "route_origin";

  const enrichAllowed =
    primaryRouteAuthority ||
    trustLevel === "supportive" ||
    trustLevel === "reliable" ||
    trustLevel === "governed";

  const coordinateAllowed =
    contribution.sourceClass === "coordination" ||
    trustLevel === "reliable" ||
    trustLevel === "governed" ||
    primaryRouteAuthority;

  const secureAllowed =
    contribution.sourceClass === "securing" &&
    trustLevel === "governed";

  let reason = "Input contribution classified.";

  if (primaryRouteAuthority) {
    reason = "Route-origin contribution carries primary route authority.";
  } else if (secureAllowed) {
    reason = "Securing contribution is governance-verified and may support sealing.";
  } else if (coordinateAllowed) {
    reason = "Contribution is reliable enough to guide coordination.";
  } else if (enrichAllowed) {
    reason = "Contribution may enrich understanding but not secure commitment.";
  }

  return {
    sourceId: contribution.sourceId,
    sourceClass: contribution.sourceClass,
    trustLevel,
    primaryRouteAuthority,
    enrichAllowed,
    coordinateAllowed,
    secureAllowed,
    reason,
  };
}