export type KnowledgeSourceType =
  | "pasted_text"
  | "spoken_reflection"
  | "uploaded_file"
  | "legal_document"
  | "strategy_note"
  | "external_llm_output"
  | "session_extraction"
  | "kb_update"
  | "code_handoff"
  | "whiteboard_interpretation";

export type KnowledgeDomain =
  | "ecosystem_architecture"
  | "legal"
  | "financial"
  | "supply_chain"
  | "attention_integrity"
  | "synthetic_conditions"
  | "continuity_resilience"
  | "launch"
  | "frontend"
  | "backend"
  | "unknown";

export type WorkspaceTarget =
  | "HARD"
  | "PING"
  | "PONG"
  | "MARK"
  | "LawAidAI"
  | "LAIW"
  | "FundTrackerAI"
  | "FinTechionAI"
  | "BEEAT"
  | "ThinkBaseAI"
  | "SoulBaseAI"
  | "AIVA_Command_Center"
  | "PAID";

export type RiskClass =
  | "verification_gap"
  | "authority_gap"
  | "workflow_dependency_failure"
  | "route_failure"
  | "payment_finality_risk"
  | "document_custody_risk"
  | "attention_capture_risk"
  | "continuity_disruption"
  | "doctrine_mutation_risk"
  | "none";

export type ArtifactStage =
  | "RAW_SIGNAL"
  | "CAPTURED_SIGNAL"
  | "VERIFIED_OPPORTUNITY"
  | "ACTIVATED_TRANSACTION_STATE"
  | "LIVE_SYSTEM_RECORD"
  | "RUNTIME_KNOWLEDGE_REGISTRY_ENTRY";

export type ReviewStatus =
  | "REFERENCE_ONLY"
  | "NEEDS_REVIEW"
  | "APPROVED_RUNTIME_REFERENCE"
  | "REFUSED_DOCTRINE_MUTATION";

export type RawKnowledgeInput = {
  sourceType: KnowledgeSourceType;
  title: string;
  body: string;
  submittedBy: string;
  sourceLabel?: string;
};

export type CapturedKnowledgeSignal = {
  signalId: string;
  sourceType: KnowledgeSourceType;
  title: string;
  bodyHash: string;
  bodyPreview: string;
  submittedBy: string;
  sourceLabel?: string;
  capturedAt: number;
};

export type ParsedIntelligenceObject = {
  parsedId: string;
  signalId: string;
  summary: string;
  keywords: string[];
};

export type ClassifiedSystemPattern = {
  patternId: string;
  parsedId: string;
  domain: KnowledgeDomain;
  riskClasses: RiskClass[];
  artifactStages: ArtifactStage[];
  reusablePatterns: string[];
};

export type WorkspaceRelevanceMap = {
  mapId: string;
  patternId: string;
  workspaces: WorkspaceTarget[];
  modules: string[];
};

export type EconomicImpactProfile = {
  timeSavings: "low" | "medium" | "high";
  errorReduction: "low" | "medium" | "high";
  riskAvoidance: "low" | "medium" | "high";
  throughputGain: "low" | "medium" | "high";
};

export type RuntimeKnowledgeRegistryEntry = {
  entryId: string;
  signal: CapturedKnowledgeSignal;
  parsed: ParsedIntelligenceObject;
  pattern: ClassifiedSystemPattern;
  relevance: WorkspaceRelevanceMap;
  economicImpact: EconomicImpactProfile;
  reviewStatus: ReviewStatus;
  createdAt: number;
  updatedAt: number;
};

export type ReviewPacket = {
  packetId: string;
  entryId: string;
  reason: string;
  requestedReviewBy: WorkspaceTarget[];
  doctrineMutationBlocked: boolean;
};
