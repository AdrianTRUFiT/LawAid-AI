import assert from "node:assert/strict";
import {
  DeviceClass,
  RuntimePortabilityProfile,
  routeThroughMandatoryTourBarrier,
  TourExecutionRequest,
  portableDigest,
} from "../src";

function runtime(deviceClass: DeviceClass): RuntimePortabilityProfile {
  return {
    deviceClass,
    osBound: false,
    absolutePathRequired: false,
    shellRequired: "NONE",
    supportsRelativePaths: true,
    supportsOfflineQueue: true,
  };
}

function baseRequest(deviceClass: DeviceClass): TourExecutionRequest {
  const payload = {
    opportunityId: "VO-001",
    amountCents: 4900,
    purpose: "protected-launch-activation",
  };

  return {
    routeId: "ROUTE-TOUR-001",
    requestedAt: "2026-05-07T18:30:00.000Z",
    requestedBy: "HARD_4_TEST",
    consequenceClass: "HIGH",
    runtime: runtime(deviceClass),
    candidatePayload: payload,
    artifact: {
      artifactId: "ART-VO-001",
      artifactType: "VERIFIED_OPPORTUNITY",
      stage: "TRANSACT",
      createdAt: "2026-05-07T18:00:00.000Z",
      expiresAt: "2026-05-07T19:00:00.000Z",
      payload,
      payloadHash: portableDigest(payload),
      truthSeal: "TRUTH-SEAL-001",
      dependencies: [
        {
          dependencyId: "DICE-CAPTURED-SIGNAL-001",
          required: true,
          status: "SATISFIED",
          artifactType: "CAPTURED_SIGNAL",
        },
      ],
    },
  };
}

const deviceTargets: DeviceClass[] = [
  "WINDOWS_PC",
  "MAC",
  "IOS_PHONE",
  "IPAD",
  "ANDROID_PHONE",
  "ANDROID_TABLET",
  "MOBILE_BROWSER",
  "PWA",
  "FUTURE_DEVICE",
];

for (const device of deviceTargets) {
  const result = routeThroughMandatoryTourBarrier(baseRequest(device));
  assert.equal(result.routingStatus, "ROUTE_EXECUTED", device);
  assert.equal(result.consequenceReached, true, device);
  assert.equal(result.tourDecision.outcome, "EXECUTION_ALLOWED", device);
}

const mutated = baseRequest("IOS_PHONE");
mutated.candidatePayload = {
  opportunityId: "VO-001",
  amountCents: 999999,
  purpose: "protected-launch-activation",
};
const blocked = routeThroughMandatoryTourBarrier(mutated);
assert.equal(blocked.routingStatus, "ROUTE_BLOCKED");
assert.equal(blocked.consequenceReached, false);
assert.ok(blocked.tourDecision.refusalCodes.includes("TOUR_PAYLOAD_MUTATED"));

const stale = baseRequest("ANDROID_PHONE");
stale.artifact.expiresAt = "2026-05-07T18:01:00.000Z";
stale.requestedAt = "2026-05-07T18:30:00.000Z";
const heldStale = routeThroughMandatoryTourBarrier(stale);
assert.equal(heldStale.routingStatus, "ROUTE_HELD");
assert.equal(heldStale.consequenceReached, false);
assert.ok(heldStale.tourDecision.refusalCodes.includes("TOUR_ARTIFACT_STALE"));

const missingDependency = baseRequest("MAC");
missingDependency.artifact.dependencies[0].status = "MISSING";
const heldDependency = routeThroughMandatoryTourBarrier(missingDependency);
assert.equal(heldDependency.routingStatus, "ROUTE_HELD");
assert.equal(heldDependency.consequenceReached, false);
assert.ok(heldDependency.tourDecision.refusalCodes.includes("TOUR_DEPENDENCY_MISSING"));

const osBound = baseRequest("WINDOWS_PC");
osBound.runtime.osBound = true;
osBound.runtime.absolutePathRequired = true;
const blockedRuntime = routeThroughMandatoryTourBarrier(osBound);
assert.equal(blockedRuntime.routingStatus, "ROUTE_BLOCKED");
assert.equal(blockedRuntime.consequenceReached, false);
assert.ok(blockedRuntime.tourDecision.refusalCodes.includes("TOUR_RUNTIME_NOT_PORTABLE"));

console.log("TOUR_GLOBAL_ROUTING_BIND=PASS");
console.log("UNIVERSAL_DEVICE_TARGETS=" + deviceTargets.join(","));
console.log("MOBILE_TARGETS=IOS_PHONE,IPAD,ANDROID_PHONE,ANDROID_TABLET,MOBILE_BROWSER,PWA");
console.log("MUTATED_OUTCOME=" + blocked.tourDecision.outcome);
console.log("STALE_OUTCOME=" + heldStale.tourDecision.outcome);
console.log("DEPENDENCY_OUTCOME=" + heldDependency.tourDecision.outcome);
console.log("OS_BOUND_OUTCOME=" + blockedRuntime.tourDecision.outcome);
