export type UniversalInputType =
  | "text"
  | "voice_transcript"
  | "uploaded_file_text"
  | "external_llm_output"
  | "kb_update"
  | "session_extraction"
  | "code_handoff"
  | "whiteboard_interpretation";

export type IntakeRouteTarget =
  | "HARD"
  | "PING"
  | "PONG"
  | "MARK"
  | "LawAidAI"
  | "FundTrackerAI"
  | "LAIW"
  | "PAID"
  | "AIVA_Command_Center"
  | "Knowledge_Intake";

export type UniversalRawInput = {
  inputType: UniversalInputType;
  title: string;
  body: string;
  submittedBy: string;
  entryMode: "PAID" | "AIVA_COMMAND" | "MANUAL_DEV" | "SYSTEM_TEST";
  sourceLabel?: string;
};

export type IntakeMark = {
  intakeMarkId: string;
  traceable: true;
  authoritative: false;
  verificationStatus: "UNVERIFIED";
  soulmarkStatus: "NOT_SEALED";
};

export type Soul256Scan = {
  scanId: string;
  purpose: string;
  riskFlags: string[];
  continuityFlags: string[];
  recommendedRoutes: IntakeRouteTarget[];
};

export type MdIntakeArtifact = {
  artifactId: string;
  intakeMark: IntakeMark;
  scan: Soul256Scan;
  markdownPath: string;
  routeTargets: IntakeRouteTarget[];
  createdAt: number;
};
