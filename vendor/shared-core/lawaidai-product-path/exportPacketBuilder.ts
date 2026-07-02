import crypto from 'crypto';
import { LawAidAIWorkspace } from './casePathContracts';
import {
  ExportPacketManifest,
  PacketSectionReadiness,
  PacketBuildResult,
  AttorneyHandoffPacket,
  PersonalReadinessPacket,
  hasPacketSources
} from './exportPacketContracts';
import { getMissingItems } from './workspaceCompletion';
import { evaluateExportReadiness } from './exportReadinessGate';

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function evaluatePacketSections(workspace: LawAidAIWorkspace): PacketSectionReadiness[] {
  const src = hasPacketSources(workspace);
  const missingItems = getMissingItems(workspace);

  return [
    {
      section: 'case_timeline',
      ready: src.timeline,
      sourceGrounded: src.timeline && src.confirmedFacts,
      reasons: src.timeline ? [] : ['TIMELINE_REQUIRED']
    },
    {
      section: 'issue_summary',
      ready: src.issues,
      sourceGrounded: src.issues && src.confirmedFacts,
      reasons: src.issues ? [] : ['ISSUE_BUCKETS_REQUIRED']
    },
    {
      section: 'evidence_index',
      ready: src.evidence,
      sourceGrounded: src.evidence,
      reasons: src.evidence ? [] : ['EVIDENCE_ITEMS_REQUIRED']
    },
    {
      section: 'communication_log',
      ready: true,
      sourceGrounded: src.communications,
      reasons: src.communications ? [] : ['NO_COMMUNICATIONS_ENTERED_OPTIONAL']
    },
    {
      section: 'expense_summary',
      ready: true,
      sourceGrounded: src.expenses,
      reasons: src.expenses ? [] : ['NO_EXPENSES_ENTERED_OPTIONAL']
    },
    {
      section: 'missing_item_checklist',
      ready: true,
      sourceGrounded: true,
      reasons: missingItems.map(item => item.code)
    },
    {
      section: 'attorney_handoff_packet',
      ready: src.timeline && src.issues && src.evidence && src.confirmedFacts,
      sourceGrounded: src.timeline && src.issues && src.evidence && src.confirmedFacts,
      reasons: [
        ...(!src.timeline ? ['TIMELINE_REQUIRED'] : []),
        ...(!src.issues ? ['ISSUE_BUCKETS_REQUIRED'] : []),
        ...(!src.evidence ? ['EVIDENCE_ITEMS_REQUIRED'] : []),
        ...(!src.confirmedFacts ? ['USER_CONFIRMED_FACTS_REQUIRED'] : [])
      ]
    },
    {
      section: 'personal_readiness_packet',
      ready: src.timeline && src.issues,
      sourceGrounded: src.timeline && src.issues,
      reasons: [
        ...(!src.timeline ? ['TIMELINE_REQUIRED'] : []),
        ...(!src.issues ? ['ISSUE_BUCKETS_REQUIRED'] : [])
      ]
    }
  ];
}

export function buildAttorneyHandoffPacket(workspace: LawAidAIWorkspace): AttorneyHandoffPacket {
  return {
    packetType: 'ATTORNEY_HANDOFF_PACKET',
    workspaceId: workspace.workspaceId,
    caseType: workspace.caseType,
    timeline: workspace.timelineEntries,
    issues: workspace.issueBuckets,
    evidenceIndex: workspace.evidenceItems,
    communications: workspace.communications,
    expenses: workspace.expenses,
    missingItems: getMissingItems(workspace),
    reviewNotice: 'Client-side organization packet. Not legal advice. Attorney/user review required before use.'
  };
}

export function buildPersonalReadinessPacket(workspace: LawAidAIWorkspace): PersonalReadinessPacket {
  const missingItems = getMissingItems(workspace);

  return {
    packetType: 'PERSONAL_READINESS_PACKET',
    workspaceId: workspace.workspaceId,
    caseType: workspace.caseType,
    nextTasks: workspace.tasks,
    deadlines: workspace.deadlines,
    notes: workspace.notes,
    missingItems,
    readinessSummary: missingItems.length === 0
      ? 'Workspace appears complete enough for export readiness review.'
      : 'Workspace still has missing items before full export readiness.'
  };
}

export function buildExportPacketManifest(workspace: LawAidAIWorkspace, mode: 'preview' | 'export'): PacketBuildResult {
  const sections = evaluatePacketSections(workspace);
  const missingItems = getMissingItems(workspace);
  const exportGate = evaluateExportReadiness(workspace);

  const packetId = 'LWIPACKET-' + sha(workspace.workspaceId + mode + JSON.stringify(sections)).slice(0, 12);

  const exportSectionsReady = sections
    .filter(section => section.section === 'attorney_handoff_packet' || section.section === 'personal_readiness_packet')
    .every(section => section.ready && section.sourceGrounded);

  const status =
    mode === 'preview'
      ? 'EXPORT_PACKET_PREVIEW_ONLY'
      : exportGate.exportAllowed && exportSectionsReady
        ? 'EXPORT_PACKET_READY'
        : 'EXPORT_PACKET_BLOCKED';

  const manifest: ExportPacketManifest = {
    status,
    packetId,
    workspaceId: workspace.workspaceId,
    createdAt: new Date().toISOString(),
    mode,
    sections,
    missingItems,
    boundary: [
      'LawAidAI provides client-side organization support.',
      'Packet output is not legal advice.',
      'Court-facing or attorney-facing use requires human review.',
      'Export requires paid unlock and source-grounded readiness.'
    ]
  };

  if (status === 'EXPORT_PACKET_READY' || mode === 'preview') {
    return {
      manifest,
      attorneyPacket: buildAttorneyHandoffPacket(workspace),
      personalPacket: buildPersonalReadinessPacket(workspace)
    };
  }

  return { manifest };
}
