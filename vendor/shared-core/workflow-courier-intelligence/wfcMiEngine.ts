import {
  ConsequenceState,
  FailureInvestigation,
  ImpactRadius,
  MiStamp,
  MovementIntelligenceSnapshot,
  Soul256Projection,
  SoulRegistryLookupRequest,
  SoulRegistryLookupResult,
  VerificationStatus,
  WfcEnvelope
} from "./wfcMiContracts";

const isoNow = () => new Date().toISOString();

const requiredArtifact = "SIGNED-RECEIPT-001";

export function createWfcEnvelope(input: {
  envelopeId: string;
  recordId: string;
  transactionId: string;
  payloadReference: string;
  currentHolder: string;
  intendedReceiver: string;
}): WfcEnvelope {
  return {
    envelopeId: input.envelopeId,
    recordId: input.recordId,
    transactionId: input.transactionId,
    payloadReference: input.payloadReference,
    currentHolder: input.currentHolder,
    intendedReceiver: input.intendedReceiver,
    status: "created",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

export function createMiStamp(input: {
  envelopeId: string;
  type: MiStamp["type"];
  checkpointId: string;
  from?: string;
  to?: string;
  status: VerificationStatus;
  note: string;
  artifactRef?: string;
}): MiStamp {
  return {
    stampId: `MI-STAMP-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    envelopeId: input.envelopeId,
    type: input.type,
    checkpointId: input.checkpointId,
    from: input.from,
    to: input.to,
    status: input.status,
    note: input.note,
    artifactRef: input.artifactRef,
    timestamp: isoNow()
  };
}

export function lookupSoulRegistry(
  request: SoulRegistryLookupRequest,
  stamps: MiStamp[]
): SoulRegistryLookupResult {
  const signatureStamp = stamps.find(
    stamp =>
      stamp.type === "signature_check" &&
      stamp.artifactRef === requiredArtifact &&
      stamp.status === "verified"
  );

  const routeVerified = stamps.some(
    stamp => stamp.type === "route_check" && stamp.status === "verified"
  );

  const miVerified = stamps.length > 0 && stamps.every(stamp => stamp.status !== "refused");

  if (request.question === "was_signed_for") {
    if (signatureStamp && routeVerified && miVerified) {
      return {
        lookupId: request.lookupId,
        envelopeId: request.envelopeId,
        status: "verified",
        signedArtifact: requiredArtifact,
        signerIdentity: "CLIENT-001",
        signerAuthority: "verified",
        timestamp: signatureStamp.timestamp,
        custodyRouteVerified: true,
        miStampVerified: true,
        releaseAuthorized: true,
        reason: "Signed artifact, signer authority, route stamp, and MI record match."
      };
    }

    return {
      lookupId: request.lookupId,
      envelopeId: request.envelopeId,
      status: "not_verified",
      custodyRouteVerified: routeVerified,
      miStampVerified: miVerified,
      releaseAuthorized: false,
      reason: "Signed artifact could not be verified. Consequence remains blocked."
    };
  }

  const refusedStamp = stamps.find(stamp => stamp.status === "refused");

  return {
    lookupId: request.lookupId,
    envelopeId: request.envelopeId,
    status: refusedStamp ? "refused" : "held_for_review",
    custodyRouteVerified: routeVerified,
    miStampVerified: miVerified,
    releaseAuthorized: false,
    reason: refusedStamp
      ? `Refusal detected at ${refusedStamp.checkpointId}.`
      : "Lookup requires additional review."
  };
}

export function calculateImpactRadius(lookup: SoulRegistryLookupResult): ImpactRadius {
  if (lookup.status === "verified" && lookup.releaseAuthorized) {
    return {
      allowed: [
        "release-condition-review",
        "consumer-safe-display",
        "operator-status-update"
      ],
      blocked: [],
      delayed: [],
      atRisk: []
      ,
      affectedParties: ["client", "law-studio", "financial-institution"]
    };
  }

  return {
    allowed: ["manual-review", "registry-recheck"],
    blocked: [
      "fund-release",
      "final-confirmation",
      "live-consequence"
    ],
    delayed: [
      "studio-payout",
      "client-confirmation",
      "receiving-environment-finalization"
    ],
    atRisk: [
      "deadline-confidence",
      "transaction-completion",
      "trust-continuity"
    ],
    affectedParties: ["client", "law-studio", "financial-institution", "receiving-environment"]
  };
}

export function investigateFailure(
  envelope: WfcEnvelope,
  stamps: MiStamp[],
  lookup: SoulRegistryLookupResult
): FailureInvestigation {
  const refusedStamp = stamps.find(stamp => stamp.status === "refused");
  const missingSignature = lookup.status !== "verified";

  if (!refusedStamp && !missingSignature) {
    return {
      investigationId: `INV-${envelope.envelopeId}`,
      envelopeId: envelope.envelopeId,
      status: "no_failure_detected",
      whatWasSupposedToHappen: "Envelope should move with verified signature, custody route, and release-ready proof.",
      whatActuallyHappened: "Envelope moved with required proof intact.",
      consequenceState: "allowed"
    };
  }

  return {
    investigationId: `INV-${envelope.envelopeId}`,
    envelopeId: envelope.envelopeId,
    status: "failure_detected",
    failurePoint: refusedStamp?.checkpointId ?? "signature_check",
    failureCode: refusedStamp ? "CHECKPOINT_REFUSED" : "SIGNED_ARTIFACT_NOT_VERIFIED",
    whatWasSupposedToHappen: "Signed artifact, authority, route, MI stamp, and registry record were supposed to match before consequence.",
    whatActuallyHappened: refusedStamp
      ? refusedStamp.note
      : "Registry could not confirm the signed artifact.",
    proofBreak: refusedStamp?.artifactRef ?? requiredArtifact,
    movedAnyway: false,
    checkpointThatShouldHaveStoppedIt: refusedStamp?.checkpointId ?? "signature_check",
    consequenceState: "blocked"
  };
}

export function projectSoul256(status: VerificationStatus): Soul256Projection {
  if (status === "verified") {
    return {
      totalCheckpoints: 256,
      yesCount: 256,
      noCount: 0,
      requiredNoCount: 0,
      verified: true,
      status: "verified",
      consequenceState: "allowed"
    };
  }

  return {
    totalCheckpoints: 256,
    yesCount: 255,
    noCount: 1,
    requiredNoCount: 1,
    verified: false,
    status: "not_verified",
    blockedCheckpoint: "cp_signature_authority_or_route",
    consequenceState: "blocked"
  };
}

export function buildMovementIntelligenceSnapshot(input: {
  signed: boolean;
  refused?: boolean;
}): MovementIntelligenceSnapshot {
  const envelope = createWfcEnvelope({
    envelopeId: "WFC-ENV-001",
    recordId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    payloadReference: "RECORD-PACKAGE-001",
    currentHolder: "PAI-SAFE",
    intendedReceiver: "FI-SANDBOX-001"
  });

  const stamps: MiStamp[] = [
    createMiStamp({
      envelopeId: envelope.envelopeId,
      type: "intake",
      checkpointId: "cp_001",
      from: "client",
      to: "PAI-SAFE",
      status: "verified",
      note: "Client opened the record. Display is not authority.",
      artifactRef: "RAW-SIGNAL-001"
    }),
    createMiStamp({
      envelopeId: envelope.envelopeId,
      type: "route_check",
      checkpointId: "cp_064",
      from: "PAI-SAFE",
      to: "DICE-AIOP",
      status: "verified",
      note: "Route integrity verified. Envelope stayed on lawful path.",
      artifactRef: "CAPTURED-SIGNAL-001"
    }),
    createMiStamp({
      envelopeId: envelope.envelopeId,
      type: "condition_check",
      checkpointId: "cp_128",
      from: "AIOP",
      to: "FundTrackerAI",
      status: "verified",
      note: "Verified Opportunity entered transaction truth evaluation.",
      artifactRef: "VERIFIED-OPPORTUNITY-001"
    })
  ];

  if (input.signed) {
    stamps.push(
      createMiStamp({
        envelopeId: envelope.envelopeId,
        type: "signature_check",
        checkpointId: "cp_192",
        from: "client",
        to: "SoulRegistry",
        status: "verified",
        note: "Signed artifact verified against signer authority and route record.",
        artifactRef: requiredArtifact
      })
    );
  } else {
    stamps.push(
      createMiStamp({
        envelopeId: envelope.envelopeId,
        type: "signature_check",
        checkpointId: "cp_192",
        from: "client",
        to: "SoulRegistry",
        status: input.refused ? "refused" : "not_verified",
        note: "Signed artifact missing or not verified. Consequence cannot proceed.",
        artifactRef: requiredArtifact
      })
    );
  }

  const registryLookup = lookupSoulRegistry(
    {
      lookupId: "LOOKUP-WAS-SIGNED-001",
      envelopeId: envelope.envelopeId,
      question: "was_signed_for"
    },
    stamps
  );

  const impactRadius = calculateImpactRadius(registryLookup);
  const failureInvestigation = investigateFailure(envelope, stamps, registryLookup);
  const soul256Projection = projectSoul256(registryLookup.status);

  return {
    envelope,
    stamps,
    registryLookup,
    impactRadius,
    failureInvestigation,
    soul256Projection,
    boundary: {
      wfcCreatesTruth: false,
      miCreatesTruth: false,
      registryCreatesTruth: false,
      fundTrackerAIRemainsTruthAuthority: true,
      displayIsAuthority: false,
      transportIsTruth: false
    }
  };
}
