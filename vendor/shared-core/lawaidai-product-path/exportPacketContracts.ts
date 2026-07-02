import { LawAidAIWorkspace } from './casePathContracts';
import { MissingItem } from './workspaceCompletion';

export type ExportPacketSection =
  | 'case_timeline'
  | 'issue_summary'
  | 'evidence_index'
  | 'communication_log'
  | 'expense_summary'
  | 'missing_item_checklist'
  | 'attorney_handoff_packet'
  | 'personal_readiness_packet';

export type PacketSectionReadiness = {
  section: ExportPacketSection;
  ready: boolean;
  sourceGrounded: boolean;
  reasons: string[];
};

export type ExportPacketManifest = {
  status: 'EXPORT_PACKET_READY' | 'EXPORT_PACKET_BLOCKED' | 'EXPORT_PACKET_PREVIEW_ONLY';
  packetId: string;
  workspaceId: string;
  createdAt: string;
  mode: 'preview' | 'export';
  sections: PacketSectionReadiness[];
  missingItems: MissingItem[];
  boundary: string[];
};

export type AttorneyHandoffPacket = {
  packetType: 'ATTORNEY_HANDOFF_PACKET';
  workspaceId: string;
  caseType: string;
  timeline: string[];
  issues: string[];
  evidenceIndex: string[];
  communications: string[];
  expenses: string[];
  missingItems: MissingItem[];
  reviewNotice: string;
};

export type PersonalReadinessPacket = {
  packetType: 'PERSONAL_READINESS_PACKET';
  workspaceId: string;
  caseType: string;
  nextTasks: string[];
  deadlines: string[];
  notes: string[];
  missingItems: MissingItem[];
  readinessSummary: string;
};

export type PacketBuildResult = {
  manifest: ExportPacketManifest;
  attorneyPacket?: AttorneyHandoffPacket;
  personalPacket?: PersonalReadinessPacket;
};

export function hasPacketSources(workspace: LawAidAIWorkspace) {
  return {
    timeline: workspace.timelineEntries.length > 0,
    issues: workspace.issueBuckets.length > 0,
    evidence: workspace.evidenceItems.length > 0,
    communications: workspace.communications.length > 0,
    expenses: workspace.expenses.length > 0,
    tasks: workspace.tasks.length > 0,
    deadlines: workspace.deadlines.length > 0,
    notes: workspace.notes.length > 0,
    confirmedFacts: workspace.userConfirmedFacts.length > 0
  };
}
