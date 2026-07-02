import fs from 'fs';
import {
  LawAidAIWorkspace,
  buildExportPacketManifest,
  evaluatePacketSections,
  writeExportPacket
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const previewWorkspace: LawAidAIWorkspace = {
  workspaceId: 'lwi3-preview',
  userId: 'user-001',
  caseType: 'family_case',
  currentStep: 'preview_ready',
  trialState: 'trial_active',
  paid: false,
  documents: ['petition.pdf'],
  timelineEntries: ['2026-04-01 intake event'],
  issueBuckets: ['parenting'],
  evidenceItems: [],
  communications: [],
  expenses: [],
  deadlines: ['2026-05-01 hearing'],
  tasks: ['Upload financial affidavit'],
  notes: ['Prepare missing records'],
  userConfirmedFacts: [],
  confidence: 0.74,
  outputStatus: 'validated_preview'
};

const previewManifest = buildExportPacketManifest(previewWorkspace, 'preview');
assert(previewManifest.manifest.status === 'EXPORT_PACKET_PREVIEW_ONLY', 'Preview packet remains preview-only');
assert(!!previewManifest.attorneyPacket, 'Preview can build attorney packet draft');
assert(!!previewManifest.personalPacket, 'Preview can build personal readiness packet draft');
assert(previewManifest.manifest.sections.some(s => s.section === 'evidence_index' && s.ready === false), 'Preview packet shows evidence section not ready');

const exportWorkspace: LawAidAIWorkspace = {
  ...previewWorkspace,
  workspaceId: 'lwi3-export',
  trialState: 'paid_unlocked',
  paid: true,
  evidenceItems: ['petition.pdf#page1'],
  communications: ['2026-04-03 email to counsel'],
  expenses: ['Filing fee 400'],
  userConfirmedFacts: ['User confirmed filing date', 'User confirmed issue bucket labels'],
  confidence: 0.92,
  outputStatus: 'export_ready'
};

const sections = evaluatePacketSections(exportWorkspace);
assert(sections.every(section => section.ready === true), 'All export packet sections ready when source-grounded data exists');

const exportManifest = buildExportPacketManifest(exportWorkspace, 'export');
assert(exportManifest.manifest.status === 'EXPORT_PACKET_READY', 'Export packet becomes ready after paid unlock and source-grounded readiness');
assert(exportManifest.attorneyPacket?.packetType === 'ATTORNEY_HANDOFF_PACKET', 'Attorney handoff packet model created');
assert(exportManifest.personalPacket?.packetType === 'PERSONAL_READINESS_PACKET', 'Personal readiness packet model created');

const written = writeExportPacket(exportWorkspace, 'export');
assert(written.status === 'LWI_EXPORT_PACKET_WRITTEN', 'Export packet files written');
assert(fs.existsSync(written.manifestPath), 'Export manifest file exists');
assert(!!written.attorneyPacketPath && fs.existsSync(written.attorneyPacketPath), 'Attorney packet file exists');
assert(!!written.personalPacketPath && fs.existsSync(written.personalPacketPath), 'Personal readiness packet file exists');

const blockedWorkspace: LawAidAIWorkspace = {
  ...previewWorkspace,
  workspaceId: 'lwi3-blocked',
  paid: false,
  trialState: 'trial_active',
  evidenceItems: [],
  userConfirmedFacts: [],
  confidence: 0.55,
  outputStatus: 'validated_preview'
};

const blockedManifest = buildExportPacketManifest(blockedWorkspace, 'export');
assert(blockedManifest.manifest.status === 'EXPORT_PACKET_BLOCKED', 'Export packet blocks unpaid non-source-grounded workspace');
assert(!blockedManifest.attorneyPacket, 'Blocked export does not emit attorney packet');
assert(!blockedManifest.personalPacket, 'Blocked export does not emit personal packet');

console.log('');
console.log('LWI_3_EXPORT_PACKET_SMOKE=PASS');









