import type { ActorIdentity, PolicySnapshot } from "../../trust-spine/src/index.js";
import {
  buildRealValuePrice,
  executeSharedSettlementForFundTracker,
  type JurisdictionPolicy,
} from "../../ecosystem-value/src/index.js";
import { activateTrustedSettlementForFundTracker } from "../../fundtracker-bridge/src/index.js";
import { receiveTrustedActivation, createDefaultReceivingPolicy } from "../../receiving-bridge/src/index.js";
import {
  createDefaultDisclosurePolicy,
  issueComplianceTrustAttestation,
  releaseComplianceTrustInstruction,
} from "../../compliance-trust-layer/src/index.js";
import type { OperatorRouteInput, OperatorRoutePolicy, OperatorRouteResult } from "./contracts.js";
import { routeLiveRecordToDistrict } from "./districtRouting.js";

export function executeOperatorRoute(input: {
  routePolicy: OperatorRoutePolicy;
  routeInput: OperatorRouteInput;
  complianceActor: ActorIdentity;
  fundActor: ActorIdentity;
  receiveActor: ActorIdentity;
  complianceAttestPolicy: PolicySnapshot;
  complianceReleasePolicy: PolicySnapshot;
  bridgeTrustPolicy: PolicySnapshot;
  activationTrustPolicy: PolicySnapshot;
  receivingTrustPolicy: PolicySnapshot;
}): OperatorRouteResult {
  const snapshot = {
    complianceTrusted: false,
    complianceReleased: false,
    settlementTrusted: false,
    activationTrusted: false,
    received: false,
    districtAccepted: false,
    districtType: input.routeInput.districtType,
  };

  if (input.routePolicy.requireComplianceAttestation) {
    const compliance = issueComplianceTrustAttestation({
      request: {
        requestId: `route-${input.routePolicy.routeName}-${Date.now()}`,
        subject: {
          subjectId: input.routeInput.wallet.ownerId,
          subjectType: "workflow",
          jurisdictionCode: input.routeInput.jurisdictionPolicy.jurisdictionCode,
        },
        claims: [
          {
            claimId: "claim_base_eligibility",
            claimType: "base_eligibility",
            status: input.routeInput.hasKyc ? "eligible" : "review_required",
          },
        ],
        policy: createDefaultDisclosurePolicy(),
        requestedArtifactType: "ComplianceEligibilityAttestation",
        nonce: `nonce-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        validFrom: new Date(Date.now() - 60000).toISOString(),
        validUntil: new Date(Date.now() + 60000).toISOString(),
        usageLimit: 1,
        requestedAt: new Date().toISOString(),
      },
      actor: input.complianceActor,
      trustPolicy: input.complianceAttestPolicy,
    });

    if (!compliance.trusted) {
      return {
        routed: false,
        decision: "REFUSED_COMPLIANCE",
        reason: compliance.reason,
        districtPacket: null,
        snapshot,
      };
    }

    snapshot.complianceTrusted = true

    if (input.routePolicy.requireRelease) {
      const released = releaseComplianceTrustInstruction({
        trustedResult: compliance,
        actor: input.complianceActor,
        trustPolicy: input.complianceReleasePolicy,
        releaseConditionMet: true,
      });

      if (!released.released) {
        return {
          routed: false,
          decision: "REFUSED_COMPLIANCE",
          reason: released.reason,
          districtPacket: null,
          snapshot,
        };
      }

      snapshot.complianceReleased = true
    }
  }

  const wrapped = executeSharedSettlementForFundTracker({
    wallet: input.routeInput.wallet,
    price: input.routeInput.price,
    policy: input.routeInput.jurisdictionPolicy,
    rails: input.routeInput.rails,
    rates: input.routeInput.rates,
    hasKyc: input.routeInput.hasKyc,
    actor: input.fundActor,
    trustPolicy: input.bridgeTrustPolicy,
  });

  if (!wrapped.bridgeTrusted || !wrapped.settlementRecord) {
    return {
      routed: false,
      decision: "REFUSED_SETTLEMENT",
      reason: wrapped.bridgeDecision,
      districtPacket: null,
      snapshot,
    };
  }

  snapshot.settlementTrusted = true

  const activation = activateTrustedSettlementForFundTracker({
    wrapped: {
      trusted: wrapped.bridgeTrusted,
      decision: wrapped.bridgeDecision as "TRUSTED",
      reason: "Bridge trusted.",
      settlementRecord: wrapped.settlementRecord,
      trustedEnvelopeId: wrapped.trustedEnvelopeId,
      authorizationDecision: "approved",
      registryValid: wrapped.registryValid,
    },
    actor: input.fundActor,
    trustPolicy: input.activationTrustPolicy,
  });

  if (!activation.activated || !activation.activationRecord) {
    return {
      routed: false,
      decision: "REFUSED_ACTIVATION",
      reason: activation.reason,
      districtPacket: null,
      snapshot,
    };
  }

  snapshot.activationTrusted = true

  const receiving = receiveTrustedActivation({
    wrapped: {
      trusted: true,
      decision: "TRUSTED",
      reason: "Activation trusted.",
      activationRecord: activation.activationRecord,
      trustedEnvelopeId: activation.trustedEnvelopeId,
      authorizationDecision: "approved",
      registryValid: activation.registryValid,
    },
    actor: input.receiveActor,
    trustPolicy: input.receivingTrustPolicy,
    receivingPolicy: {
      ...createDefaultReceivingPolicy(),
      receivingEnvironment: input.routePolicy.receivingEnvironment,
    },
  });

  if (!receiving.received || !receiving.liveSystemRecord) {
    return {
      routed: false,
      decision: "REFUSED_RECEIVING",
      reason: receiving.reason,
      districtPacket: null,
      snapshot,
    };
  }

  snapshot.received = true

  const district = routeLiveRecordToDistrict({
    districtType: input.routeInput.districtType,
    liveSystemRecord: receiving.liveSystemRecord,
    evidenceAnchorIds: input.routeInput.evidenceAnchorIds,
    bookingAnchorIds: input.routeInput.bookingAnchorIds,
    genericTags: input.routeInput.genericTags,
  });

  if (!district.accepted || !district.packet) {
    return {
      routed: false,
      decision: "REFUSED_DISTRICT",
      reason: district.reason,
      districtPacket: null,
      snapshot,
    };
  }

  snapshot.districtAccepted = true

  return {
    routed: true,
    decision: "ROUTED",
    reason: "Operator route completed across shared-core stack.",
    districtPacket: district.packet,
    snapshot,
  };
}