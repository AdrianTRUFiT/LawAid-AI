import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  review: path.join(HB_ROOT, 'REVIEW'),
  decisions: path.join(HB_ROOT, 'DECISIONS'),
  approved: path.join(HB_ROOT, 'APPROVED'),
  rejected: path.join(HB_ROOT, 'REJECTED'),
  hold: path.join(HB_ROOT, 'HOLD'),
  index: path.join(HB_ROOT, 'INDEX')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function ensureDirs() {
  for (const dir of Object.values(PATHS)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractTitle(content: string) {
  const line = content.split('\n').find(l => l.trim().startsWith('#'));
  return line ? line.replace(/^#+\s*/, '').trim() : 'Untitled Review Item';
}

function decide(content: string, file: string) {
  const text = content.toLowerCase();

  const hardMarkers = [
    'authority',
    'doctrine',
    'boundary',
    'authorship',
    'governance',
    'review requirement',
    'must not',
    'human approval',
    'artifact law',
    'maps',
    'processor'
  ];

  const rejectMarkers = [
    '[paste session handoff here]',
    'placeholder only',
    'test/noise',
    'do not import'
  ];

  const approveMarkers = [
    'kb update',
    'captured for hb-sos intake',
    'official current-state update',
    'external pattern intake',
    'execution capacity doctrine',
    'expanded operating doctrine'
  ];

  if (rejectMarkers.some(m => text.includes(m))) {
    return {
      decision: 'REJECTED',
      reason: 'PLACEHOLDER_OR_NOISE',
      route: 'REJECTED'
    };
  }

  if (hardMarkers.some(m => text.includes(m))) {
    return {
      decision: 'HOLD',
      reason: 'GOVERNANCE_REVIEW_REQUIRED',
      route: 'HOLD'
    };
  }

  if (approveMarkers.some(m => text.includes(m))) {
    return {
      decision: 'APPROVED',
      reason: 'APPROVED_FOR_ROUTING_AND_EXECUTION_SELECTION',
      route: 'APPROVED'
    };
  }

  return {
    decision: 'HOLD',
    reason: 'INSUFFICIENT_DECISION_CONFIDENCE',
    route: 'HOLD'
  };
}

function writeDecisionManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-decision-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-decision-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_DECISION_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const lines = [
    '# HB-SOS Decision Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Decisions',
    '',
    ...records.map(r =>
      '- ' + r.decisionId + ' | ' + r.decision + ' | ' + r.reason + ' | ' + r.sourceFile
    )
  ];

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');

  return { jsonPath, mdPath };
}

export function runHomebaseDecisionEngine() {
  ensureDirs();

  const files = fs.readdirSync(PATHS.review)
    .filter(f => f.endsWith('.md'));

  const records: any[] = [];

  if (files.length === 0) {
    const manifest = writeDecisionManifest([]);
    return {
      status: 'HB-SOS_DECISION_NO_REVIEW_ITEMS',
      decided: 0,
      records: [],
      manifest
    };
  }

  for (const file of files) {
    const sourcePath = path.join(PATHS.review, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const hash = sha(content).slice(0, 16);
    const title = extractTitle(content);
    const result = decide(content, file);

    const decisionId = 'HBDEC-' + sha(file + hash + result.decision).slice(0, 12);
    const targetDir =
      result.route === 'APPROVED' ? PATHS.approved :
      result.route === 'REJECTED' ? PATHS.rejected :
      PATHS.hold;

    const targetName = file.replace('.md', '') + '__' + result.decision + '_' + decisionId + '.md';
    const targetPath = path.join(targetDir, targetName);

    const packet = [
      '---',
      'decision_packet: "HB-SOS_DECISION_PACKET_V1"',
      'decision_id: "' + decisionId + '"',
      'source_file: "' + file + '"',
      'source_hash: "' + hash + '"',
      'decision: "' + result.decision + '"',
      'reason: "' + result.reason + '"',
      'authority: "LOCAL_DECISION_RECOMMENDATION_ONLY"',
      'decided_at: "' + new Date().toISOString() + '"',
      '---',
      '',
      '# HB-SOS Decision Packet',
      '',
      'Title: ' + title,
      '',
      'Decision: ' + result.decision,
      '',
      'Reason: ' + result.reason,
      '',
      'Authority: LOCAL_DECISION_RECOMMENDATION_ONLY',
      '',
      'Boundary: This decision packet recommends movement inside HB-SOS only. It does not mutate doctrine, authorize public release, approve runtime execution, or bypass human custody.',
      '',
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(targetPath, packet, 'utf8');

    records.push({
      decisionId,
      sourceFile: file,
      sourceHash: hash,
      title,
      decision: result.decision,
      reason: result.reason,
      targetPath: targetPath.replace(/\\/g, '/')
    });
  }

  const manifest = writeDecisionManifest(records);

  return {
    status: 'HB-SOS_DECISION_ENGINE_COMPLETE',
    decided: records.length,
    approved: records.filter(r => r.decision === 'APPROVED').length,
    rejected: records.filter(r => r.decision === 'REJECTED').length,
    held: records.filter(r => r.decision === 'HOLD').length,
    records,
    manifest
  };
}
