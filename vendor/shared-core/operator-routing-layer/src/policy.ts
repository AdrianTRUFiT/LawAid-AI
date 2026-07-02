import type { DistrictType } from "../../district-adapters/src/index.js";
import type { OperatorRoutePolicy } from "./contracts.js";

export function createOperatorRoutePolicy(input: {
  districtType: DistrictType;
  receivingEnvironment?: string;
}): OperatorRoutePolicy {
  return {
    policyId: `operator-route-${input.districtType.toLowerCase()}`,
    routeName: `${input.districtType.toLowerCase()}-governed-route`,
    districtType: input.districtType,
    requireComplianceAttestation: true,
    requireRelease: true,
    receivingEnvironment: input.receivingEnvironment ?? `${input.districtType.toLowerCase()}-receiving-environment`,
  };
}