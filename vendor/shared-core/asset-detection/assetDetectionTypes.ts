export type ReadinessState = "SAFE" | "HOLD" | "REFUSED";

export type AssetCondition =
  | "COMPLETE"
  | "PARTIAL"
  | "MISSING"
  | "UNREADABLE"
  | "DUPLICATE"
  | "UNKNOWN"
  | "CONFIRMED_UNAVAILABLE";

export type AssetCategory =
  | "LEGAL_DOCUMENT"
  | "EMAIL"
  | "INVOICE"
  | "BANK_STATEMENT"
  | "COURT_ORDER"
  | "MOTION"
  | "DISCOVERY"
  | "MEDICAL_RECORD"
  | "CODE_FILE"
  | "REPORT"
  | "UNKNOWN";

export interface AssetInput {
  originalName: string;
  contentText?: string;
  sourcePath?: string;
  referencedBy?: string[];
  expectedButMissing?: boolean;
  confirmedUnavailable?: boolean;
}

export interface AssetDetectionResult {
  assetId: string;
  protocol: "ADP";
  originalName: string;
  category: AssetCategory;
  condition: AssetCondition;
  readinessState: ReadinessState;
  downstreamReferences: string[];
  missingByReference: string[];
  consequenceSummary: string;
  confidenceScore: number;
  updatedAt: string;
}
