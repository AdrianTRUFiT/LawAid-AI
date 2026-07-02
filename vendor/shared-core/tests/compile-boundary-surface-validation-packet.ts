import type {
  ProcessorIntegrationAuthority,
  ReadOnlyValidationPacket,
  SurfaceValidationAuthority,
  TenUserReadOnlyTestScript
} from "../surface-validation-packet";

const packet: ReadOnlyValidationPacket = {
  __brand: "READ_ONLY_SURFACE_VALIDATION_PACKET",
  packetId: "packet_compile_001",
  title: "Surface Validation Packet",
  status: "SURFACE_VALIDATION_PACKET_READY",
  userCountTarget: 10,
  scope: {
    readOnlyDemo: true,
    oneNarrowWorkflow: true,
    noLiveRails: true,
    noPaymentProcessing: true,
    noLegalAdvice: true,
    noInternalStackExposure: true,
    noRuntimeActivation: true
  },
  validatedSurfaces: {
    paiSafeUiStateMapping: true,
    surfaceContract: true,
    failureTaxonomy: true
  },
  userPrompt: "Test prompt.",
  successCriteria: ["Complete without help."],
  failureCriteria: ["Confused."],
  phase2Gate: {
    processorSelectionBlocked: true,
    merchantAccountBlocked: true,
    pciScopeBlocked: true,
    launchMarketBlocked: true,
    phase2RequiresHumanDecision: true
  },
  boundary: {
    packetIsNotPublicLaunch: true,
    packetCreatesNoPaymentAuthority: true,
    packetCreatesNoTransactionTruth: true,
    packetCreatesNoCustodyTransfer: true,
    packetCreatesNoRuntimeActivation: true,
    packetDoesNotAuthorizeProcessorWork: true
  }
};

void packet;

// @ts-expect-error Surface validation packet cannot authorize launch.
const packetAsLaunchAuthority: SurfaceValidationAuthority = packet;

void packetAsLaunchAuthority;

// @ts-expect-error Surface validation packet cannot authorize processor integration.
const packetAsProcessorAuthority: ProcessorIntegrationAuthority = packet;

void packetAsProcessorAuthority;

// @ts-expect-error Surface validation cannot allow live rails.
packet.scope.noLiveRails = false;

// @ts-expect-error Surface validation cannot become legal advice.
packet.scope.noLegalAdvice = false;

// @ts-expect-error Surface validation cannot unblock processor selection.
packet.phase2Gate.processorSelectionBlocked = false;

// @ts-expect-error Surface validation cannot authorize processor work.
packet.boundary.packetDoesNotAuthorizeProcessorWork = false;

const script: TenUserReadOnlyTestScript = {
  __brand: "TEN_USER_READ_ONLY_TEST_SCRIPT",
  scriptId: "script_compile_001",
  title: "10-User Script",
  introLanguage: "Read-only demo.",
  testerInstructions: ["Observe."],
  observerRules: ["Do not sell."],
  questions: ["What happened?"],
  prohibitedClaims: ["This is launch."],
  completionDefinition: "Complete workflow without help.",
  boundary: {
    scriptIsReadOnly: true,
    scriptIsNotSalesPressure: true,
    scriptIsNotLegalAdvice: true,
    scriptUsesNoLiveRails: true,
    scriptCreatesNoAuthority: true
  }
};

void script;

// @ts-expect-error Test script cannot use live rails.
script.boundary.scriptUsesNoLiveRails = false;

// @ts-expect-error Test script cannot create authority.
script.boundary.scriptCreatesNoAuthority = false;
