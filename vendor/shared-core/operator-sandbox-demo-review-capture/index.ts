export type OperatorDemoReviewStatus =
  | "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_READY"
  | "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_BLOCKED"
  | "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_REFUSED";

export type OperatorDemoDecision =
  | "READY_FOR_PRIVATE_REVIEW"
  | "NEEDS_COPY_REPAIR"
  | "NEEDS_FLOW_REPAIR"
  | "NEEDS_BOUNDARY_REPAIR"
  | "NOT_READY";

export type ReviewAnswer =
  | "YES"
  | "NO"
  | "UNCLEAR";

export type ReviewRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "BLOCKING";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface PublicLaunchAuthority {
  readonly __brand: "PUBLIC_LAUNCH_AUTHORITY";
  mayLaunchPublicly: true;
}

export interface RuntimeActivationAuthority {
  readonly __brand: "RUNTIME_ACTIVATION_AUTHORITY";
  mayActivateRuntime: true;
}

export interface OperatorDemoScriptSection {
  id: string;
  title: string;
  scriptText: string;
  requiredBoundaryReminder: string;
  artifactAnchor: string;
}

export interface OperatorReviewQuestion {
  id: string;
  question: string;
  required: true;
  riskIfNo: ReviewRiskLevel;
  passCondition: string;
}

export interface OperatorReviewCaptureResponse {
  questionId: string;
  answer: ReviewAnswer;
  note: string;
}

export interface OperatorSandboxDemoScript {
  readonly __brand: "OPERATOR_SANDBOX_DEMO_SCRIPT";
  scriptId: string;
  title: string;
  openingBoundary: string[];
  sections: OperatorDemoScriptSection[];
  approvedLanguage: string[];
  prohibitedLanguage: string[];
  boundary: {
    scriptIsSandboxOnly: true;
    scriptCreatesNoLiveRails: true;
    scriptCreatesNoPaymentProcessing: true;
    scriptCreatesNoLiveTransactionTruth: true;
    scriptCreatesNoLiveATS: true;
    scriptCreatesNoCustodyTransfer: true;
    scriptCreatesNoRuntimeActivation: true;
    scriptIsNotLaunchApproval: true;
  };
}

export interface OperatorReviewCaptureForm {
  readonly __brand: "OPERATOR_REVIEW_CAPTURE_FORM";
  formId: string;
  title: string;
  questions: OperatorReviewQuestion[];
  requiredDecisionOptions: OperatorDemoDecision[];
  boundary: {
    formIsReviewOnly: true;
    formCreatesNoAuthority: true;
    formCreatesNoLiveRails: true;
    formCreatesNoPaymentProcessing: true;
    formCreatesNoRuntimeActivation: true;
    formIsNotLaunchApproval: true;
  };
}

export interface OperatorReviewScore {
  readonly __brand: "OPERATOR_REVIEW_SCORE";
  totalQuestions: number;
  yesCount: number;
  noCount: number;
  unclearCount: number;
  blockingCount: number;
  score: number;
  recommendedDecision: OperatorDemoDecision;
  findings: string[];
  boundary: {
    scoreIsRecommendationOnly: true;
    scoreCreatesNoLaunchAuthority: true;
    scoreCreatesNoPaymentAuthority: true;
    scoreCreatesNoRuntimeActivation: true;
  };
}

export interface OperatorSandboxDemoReviewCapturePacket {
  readonly __brand: "OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_PACKET";
  packetId: string;
  status: OperatorDemoReviewStatus;
  dependencyStatus: string;
  demoScript: OperatorSandboxDemoScript;
  reviewCaptureForm: OperatorReviewCaptureForm;
  sampleScore: OperatorReviewScore;
  refusalReasons: string[];
  boundary: {
    packetIsReviewOnly: true;
    packetCreatesNoLiveRails: true;
    packetCreatesNoPaymentProcessing: true;
    packetCreatesNoLiveTransactionTruth: true;
    packetCreatesNoLiveATS: true;
    packetCreatesNoCustodyTransfer: true;
    packetCreatesNoRuntimeActivation: true;
    packetIsNotLaunchApproval: true;
    packetCreatesNoLegalFinancialAuthorityClaims: true;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function buildOperatorSandboxDemoScript(): OperatorSandboxDemoScript {
  return {
    __brand: "OPERATOR_SANDBOX_DEMO_SCRIPT",
    scriptId: "operator_sandbox_demo_script_001",
    title: "GTIS / FundTrackerAI Sandbox Transaction Truth Demo",
    openingBoundary: [
      "This is a sandbox-only operator review.",
      "No live payment rail is connected.",
      "No live payment is processed.",
      "No live transaction truth is created.",
      "No live Activated Transaction State is created.",
      "No custody transfer occurs.",
      "No runtime activation occurs.",
      "This review does not authorize public launch."
    ],
    sections: [
      {
        id: "section_001",
        title: "What This Demo Proves",
        scriptText:
          "This demo proves the sandbox transaction path can intake a sandbox event, route it to FundTrackerAI, preserve proof references, display governed state through PAI-SAFE, and refuse unsafe pressure cases.",
        requiredBoundaryReminder:
          "This proves sandbox behavior only. It does not prove live payment processing.",
        artifactAnchor:
          "D:\\DEV\\AIVA\\shared-data\\private-sandbox-review-demo-prep\\private-sandbox-review-demo-prep.json"
      },
      {
        id: "section_002",
        title: "FundTrackerAI Truth Boundary",
        scriptText:
          "FundTrackerAI remains the sandbox transaction truth authority. Processor events are inputs, not authority. PAI-SAFE displays governed state only.",
        requiredBoundaryReminder:
          "PAI-SAFE does not verify payment truth and does not override FundTrackerAI.",
        artifactAnchor:
          "D:\\DEV\\AIVA\\shared-data\\sandbox-launch-readiness-evidence-packet\\sandbox-launch-readiness-evidence-packet.json"
      },
      {
        id: "section_003",
        title: "Pressure Refusal",
        scriptText:
          "The replay suite refused live rail attempts, mutation attempts, missing references, partial and failed payment cases, and tampered ledger-chain pressure.",
        requiredBoundaryReminder:
          "Refusal evidence does not authorize live rails or public launch.",
        artifactAnchor:
          "D:\\DEV\\AIVA\\shared-data\\controlled-sandbox-transaction-replay-suite\\controlled-sandbox-transaction-replay-suite.json"
      },
      {
        id: "section_004",
        title: "Operator Decision",
        scriptText:
          "The operator reviews whether the demo is understandable, bounded, traceable, and safe for private review.",
        requiredBoundaryReminder:
          "Operator review is not public launch approval.",
        artifactAnchor:
          "D:\\DEV\\AIVA\\homebase\\REPORTS\\private-sandbox-operator-review-script.md"
      }
    ],
    approvedLanguage: [
      "The sandbox replay suite passed.",
      "The sandbox path refused live rail attempts.",
      "The sandbox path refused mutation attempts.",
      "The sandbox path refused missing-reference attempts.",
      "The sandbox path refused partial and failed payment conditions.",
      "The sandbox path refused tampered ledger-chain attempts.",
      "PAI-SAFE displays governed state only.",
      "FundTrackerAI remains the transaction truth authority."
    ],
    prohibitedLanguage: [
      "This processes live payments.",
      "This connects to live payment rails.",
      "This creates live transaction truth.",
      "This creates live Activated Transaction State.",
      "This authorizes public launch.",
      "This creates custody transfer.",
      "This provides legal or financial authority claims.",
      "PAI-SAFE verifies transaction truth."
    ],
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
}

export function buildOperatorReviewCaptureForm(): OperatorReviewCaptureForm {
  return {
    __brand: "OPERATOR_REVIEW_CAPTURE_FORM",
    formId: "operator_review_capture_form_001",
    title: "Operator Sandbox Review Capture Form",
    questions: [
      {
        id: "q001",
        question: "Did the demo clearly communicate that it is sandbox-only?",
        required: true,
        riskIfNo: "BLOCKING",
        passCondition: "Operator answers YES."
      },
      {
        id: "q002",
        question: "Could the operator distinguish FundTrackerAI truth authority from PAI-SAFE display?",
        required: true,
        riskIfNo: "BLOCKING",
        passCondition: "Operator answers YES."
      },
      {
        id: "q003",
        question: "Did any language sound like live payment processing?",
        required: true,
        riskIfNo: "BLOCKING",
        passCondition: "Operator answers NO."
      },
      {
        id: "q004",
        question: "Did any language sound like legal or financial authority?",
        required: true,
        riskIfNo: "BLOCKING",
        passCondition: "Operator answers NO."
      },
      {
        id: "q005",
        question: "Could the operator trace demo claims to verified artifacts?",
        required: true,
        riskIfNo: "HIGH",
        passCondition: "Operator answers YES."
      },
      {
        id: "q006",
        question: "Was the refusal behavior understandable?",
        required: true,
        riskIfNo: "MEDIUM",
        passCondition: "Operator answers YES."
      },
      {
        id: "q007",
        question: "Is the demo ready for private review without public launch language?",
        required: true,
        riskIfNo: "HIGH",
        passCondition: "Operator answers YES."
      }
    ],
    requiredDecisionOptions: [
      "READY_FOR_PRIVATE_REVIEW",
      "NEEDS_COPY_REPAIR",
      "NEEDS_FLOW_REPAIR",
      "NEEDS_BOUNDARY_REPAIR",
      "NOT_READY"
    ],
    boundary: {
      formIsReviewOnly: true,
      formCreatesNoAuthority: true,
      formCreatesNoLiveRails: true,
      formCreatesNoPaymentProcessing: true,
      formCreatesNoRuntimeActivation: true,
      formIsNotLaunchApproval: true
    }
  };
}

export function scoreOperatorReviewCapture(
  form: OperatorReviewCaptureForm,
  responses: OperatorReviewCaptureResponse[]
): OperatorReviewScore {
  const findings: string[] = [];
  let yesCount = 0;
  let noCount = 0;
  let unclearCount = 0;
  let blockingCount = 0;

  for (const question of form.questions) {
    const response = responses.find((item) => item.questionId === question.id);

    if (!response) {
      unclearCount++;
      findings.push(`Missing response for ${question.id}.`);
      if (question.riskIfNo === "BLOCKING") blockingCount++;
      continue;
    }

    if (response.answer === "YES") yesCount++;
    if (response.answer === "NO") noCount++;
    if (response.answer === "UNCLEAR") unclearCount++;

    if (question.id === "q001" && response.answer !== "YES") blockingCount++;
    if (question.id === "q002" && response.answer !== "YES") blockingCount++;
    if (question.id === "q003" && response.answer !== "NO") blockingCount++;
    if (question.id === "q004" && response.answer !== "NO") blockingCount++;

    if (response.answer === "UNCLEAR") {
      findings.push(`${question.id} requires clarification.`);
    }
  }

  const totalQuestions = form.questions.length;
  const passPoints = form.questions.filter((question) => {
    const response = responses.find((item) => item.questionId === question.id);
    if (!response) return false;

    if (question.id === "q003" || question.id === "q004") {
      return response.answer === "NO";
    }

    return response.answer === "YES";
  }).length;

  const score = Math.round((passPoints / totalQuestions) * 100);

  let recommendedDecision: OperatorDemoDecision = "READY_FOR_PRIVATE_REVIEW";

  if (blockingCount > 0) {
    recommendedDecision = "NEEDS_BOUNDARY_REPAIR";
  } else if (score < 70) {
    recommendedDecision = "NOT_READY";
  } else if (score < 85) {
    recommendedDecision = "NEEDS_FLOW_REPAIR";
  } else if (score < 100) {
    recommendedDecision = "NEEDS_COPY_REPAIR";
  }

  if (findings.length === 0) {
    findings.push("Operator review capture meets private review readiness conditions.");
  }

  return {
    __brand: "OPERATOR_REVIEW_SCORE",
    totalQuestions,
    yesCount,
    noCount,
    unclearCount,
    blockingCount,
    score,
    recommendedDecision,
    findings: unique(findings),
    boundary: {
      scoreIsRecommendationOnly: true,
      scoreCreatesNoLaunchAuthority: true,
      scoreCreatesNoPaymentAuthority: true,
      scoreCreatesNoRuntimeActivation: true
    }
  };
}

export function buildPassingOperatorResponses(): OperatorReviewCaptureResponse[] {
  return [
    { questionId: "q001", answer: "YES", note: "Sandbox-only was clear." },
    { questionId: "q002", answer: "YES", note: "FundTrackerAI vs PAI-SAFE distinction was clear." },
    { questionId: "q003", answer: "NO", note: "No live payment processing language heard." },
    { questionId: "q004", answer: "NO", note: "No legal or financial authority language heard." },
    { questionId: "q005", answer: "YES", note: "Claims traced to artifacts." },
    { questionId: "q006", answer: "YES", note: "Refusal behavior was understandable." },
    { questionId: "q007", answer: "YES", note: "Ready for private review." }
  ];
}

export function buildBoundaryFailingOperatorResponses(): OperatorReviewCaptureResponse[] {
  return [
    { questionId: "q001", answer: "UNCLEAR", note: "Sandbox boundary unclear." },
    { questionId: "q002", answer: "NO", note: "Truth/display distinction unclear." },
    { questionId: "q003", answer: "YES", note: "Sounded like live payment processing." },
    { questionId: "q004", answer: "YES", note: "Sounded like authority claim." },
    { questionId: "q005", answer: "UNCLEAR", note: "Artifact trace unclear." },
    { questionId: "q006", answer: "UNCLEAR", note: "Refusal behavior unclear." },
    { questionId: "q007", answer: "NO", note: "Not ready." }
  ];
}

export function buildOperatorSandboxDemoReviewCapturePacket(
  dependencyStatus = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY"
): OperatorSandboxDemoReviewCapturePacket {
  const refusalReasons: string[] = [];

  if (dependencyStatus !== "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY") {
    refusalReasons.push("PRIVATE_SANDBOX_REVIEW_DEMO_PREP_NOT_READY");
  }

  const demoScript = buildOperatorSandboxDemoScript();
  const reviewCaptureForm = buildOperatorReviewCaptureForm();
  const sampleScore = scoreOperatorReviewCapture(reviewCaptureForm, buildPassingOperatorResponses());

  const status: OperatorDemoReviewStatus =
    refusalReasons.length === 0 && sampleScore.recommendedDecision === "READY_FOR_PRIVATE_REVIEW"
      ? "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_READY"
      : "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_BLOCKED";

  return {
    __brand: "OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_PACKET",
    packetId: "operator_sandbox_demo_review_capture_001",
    status,
    dependencyStatus,
    demoScript,
    reviewCaptureForm,
    sampleScore,
    refusalReasons: unique(refusalReasons),
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
}

export const OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE = {
  name: "Operator Sandbox Demo Script + Review Capture Form",
  class: "OPERATOR_REVIEW_SCRIPT_AND_CAPTURE_LAYER",
  purpose:
    "Provide a bounded operator sandbox demo script, review capture form, scoring rubric, and decision packet without creating launch, live rail, payment, custody, ATS, runtime, legal, or financial authority.",
  boundary: {
    reviewOnly: true,
    sandboxOnly: true,
    notLaunchApproval: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalFinancialAuthorityClaimsCreated: true
  }
} as const;
