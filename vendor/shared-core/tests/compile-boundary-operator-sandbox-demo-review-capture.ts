import type {
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  OperatorReviewCaptureForm,
  OperatorReviewScore,
  OperatorSandboxDemoReviewCapturePacket,
  OperatorSandboxDemoScript,
  PublicLaunchAuthority,
  RuntimeActivationAuthority
} from "../operator-sandbox-demo-review-capture";

const script: OperatorSandboxDemoScript = {
  __brand: "OPERATOR_SANDBOX_DEMO_SCRIPT",
  scriptId: "compile_script",
  title: "Compile Script",
  openingBoundary: [],
  sections: [],
  approvedLanguage: [],
  prohibitedLanguage: [],
  boundary: {
    scriptIsSandboxOnly: true,
    scriptCreatesNoLiveRails: true,
    scriptCreatesNoPaymentProcessing: true,
    scriptCreatesNoLiveTransactionTruth: true,
    scriptCreatesNoLiveATS: true,
    scriptCreatesNoCustodyTransfer: true,
    scriptCreatesNoRuntimeActivation: true,
    scriptIsNotLaunchApproval: true
  }
};

void script;

// @ts-expect-error Script cannot become live rail authority.
const scriptAsLiveRail: LiveRailAuthority = script;

void scriptAsLiveRail;

// @ts-expect-error Script cannot create live rails.
script.boundary.scriptCreatesNoLiveRails = false;

// @ts-expect-error Script cannot authorize launch.
script.boundary.scriptIsNotLaunchApproval = false;

const form: OperatorReviewCaptureForm = {
  __brand: "OPERATOR_REVIEW_CAPTURE_FORM",
  formId: "compile_form",
  title: "Compile Form",
  questions: [],
  requiredDecisionOptions: ["READY_FOR_PRIVATE_REVIEW"],
  boundary: {
    formIsReviewOnly: true,
    formCreatesNoAuthority: true,
    formCreatesNoLiveRails: true,
    formCreatesNoPaymentProcessing: true,
    formCreatesNoRuntimeActivation: true,
    formIsNotLaunchApproval: true
  }
};

void form;

// @ts-expect-error Form cannot become payment authority.
const formAsPayment: LivePaymentProcessingAuthority = form;

void formAsPayment;

// @ts-expect-error Form cannot create authority.
form.boundary.formCreatesNoAuthority = false;

const score: OperatorReviewScore = {
  __brand: "OPERATOR_REVIEW_SCORE",
  totalQuestions: 1,
  yesCount: 1,
  noCount: 0,
  unclearCount: 0,
  blockingCount: 0,
  score: 100,
  recommendedDecision: "READY_FOR_PRIVATE_REVIEW",
  findings: [],
  boundary: {
    scoreIsRecommendationOnly: true,
    scoreCreatesNoLaunchAuthority: true,
    scoreCreatesNoPaymentAuthority: true,
    scoreCreatesNoRuntimeActivation: true
  }
};

void score;

// @ts-expect-error Score cannot become launch authority.
const scoreAsLaunch: PublicLaunchAuthority = score;

void scoreAsLaunch;

// @ts-expect-error Score cannot create runtime activation.
score.boundary.scoreCreatesNoRuntimeActivation = false;

const packet: OperatorSandboxDemoReviewCapturePacket = {
  __brand: "OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_PACKET",
  packetId: "compile_packet",
  status: "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_READY",
  dependencyStatus: "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY",
  demoScript: script,
  reviewCaptureForm: form,
  sampleScore: score,
  refusalReasons: [],
  boundary: {
    packetIsReviewOnly: true,
    packetCreatesNoLiveRails: true,
    packetCreatesNoPaymentProcessing: true,
    packetCreatesNoLiveTransactionTruth: true,
    packetCreatesNoLiveATS: true,
    packetCreatesNoCustodyTransfer: true,
    packetCreatesNoRuntimeActivation: true,
    packetIsNotLaunchApproval: true,
    packetCreatesNoLegalFinancialAuthorityClaims: true
  }
};

void packet;

// @ts-expect-error Packet cannot become public launch authority.
const packetAsLaunch: PublicLaunchAuthority = packet;

void packetAsLaunch;

// @ts-expect-error Packet cannot become runtime activation authority.
const packetAsRuntime: RuntimeActivationAuthority = packet;

void packetAsRuntime;

// @ts-expect-error Packet cannot create live rails.
packet.boundary.packetCreatesNoLiveRails = false;

// @ts-expect-error Packet cannot create runtime activation.
packet.boundary.packetCreatesNoRuntimeActivation = false;

// @ts-expect-error Packet cannot become launch approval.
packet.boundary.packetIsNotLaunchApproval = false;
