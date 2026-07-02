import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  drop: path.join(HB_ROOT, 'HANDOFF_DROP'),
  imported: path.join(HB_ROOT, 'HANDOFF_IMPORTED'),
  rejected: path.join(HB_ROOT, 'HANDOFF_REJECTED'),
  inbox: path.join(HB_ROOT, 'INBOX'),
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

function isPlaceholder(content: string) {
  const t = content.trim().toLowerCase();
  return (
    t.includes('[paste session handoff here]') ||
    t.length < 500 ||
    !t.includes('session extraction handoff')
  );
}

function safeName(file: string) {
  return file
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-');
}

function writeManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-handoff-import-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-handoff-import-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_HANDOFF_IMPORT_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const lines = [
    '# HB-SOS Handoff Import Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Records',
    '',
    ...records.map(r =>
      '- ' + r.status + ' | ' + r.file + ' | ' + r.reason + ' | ' + (r.intakeFile || 'no-intake-file')
    )
  ];

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');

  return { jsonPath, mdPath };
}

export function importHandoffDrop() {
  ensureDirs();

  const files = fs.readdirSync(PATHS.drop)
    .filter(f => f.endsWith('.md') || f.endsWith('.txt'));

  const records: any[] = [];

  if (files.length === 0) {
    return {
      status: 'HB-SOS_HANDOFF_IMPORT_NO_FILES',
      imported: 0,
      rejected: 0,
      records: [],
      manifest: writeManifest([])
    };
  }

  for (const file of files) {
    const sourcePath = path.join(PATHS.drop, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const hash = sha(content).slice(0, 14);

    if (isPlaceholder(content)) {
      const rejectedName = safeName(file).replace(/\.(md|txt)$/i, '') + '__REJECTED_' + hash + '.md';
      const rejectedPath = path.join(PATHS.rejected, rejectedName);

      fs.writeFileSync(rejectedPath, [
        '---',
        'rejection_packet: "HB-SOS_HANDOFF_REJECTION_V1"',
        'source_file: "' + file + '"',
        'reason: "PLACEHOLDER_OR_INVALID_HANDOFF"',
        'content_hash: "' + hash + '"',
        'rejected_at: "' + new Date().toISOString() + '"',
        '---',
        '',
        '# Rejected Handoff',
        '',
        'This file was not imported because it appears to be a placeholder, too short, or not a session extraction handoff.',
        '',
        '---',
        '',
        content
      ].join('\n'), 'utf8');

      fs.unlinkSync(sourcePath);

      records.push({
        status: 'REJECTED',
        file,
        reason: 'PLACEHOLDER_OR_INVALID_HANDOFF',
        hash,
        rejectedPath: rejectedPath.replace(/\\/g, '/')
      });

      continue;
    }

    const importedName = safeName(file).replace(/\.(md|txt)$/i, '') + '__IMPORTED_' + hash + '.md';
    const importedPath = path.join(PATHS.imported, importedName);
    const inboxPath = path.join(PATHS.inbox, importedName);

    const wrapped = [
      '---',
      'intake_type: "SESSION_HANDOFF"',
      'source_file: "' + file + '"',
      'content_hash: "' + hash + '"',
      'submitted_by: "HB-SOS_BATCH_HANDOFF_IMPORTER"',
      'review_required: "YES"',
      'route_targets: "HARD,MARK,PONG,PING,GOVERNANCE_REVIEW"',
      'imported_at: "' + new Date().toISOString() + '"',
      '---',
      '',
      '# Imported Session Handoff',
      '',
      'This handoff was imported through HB-SOS Batch Handoff Importer.',
      'It requires intake, review, routing, and index rebuild before use.',
      '',
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(importedPath, wrapped, 'utf8');
    fs.writeFileSync(inboxPath, wrapped, 'utf8');

    fs.unlinkSync(sourcePath);

    records.push({
      status: 'IMPORTED',
      file,
      reason: 'VALID_SESSION_HANDOFF',
      hash,
      intakeFile: importedName,
      importedPath: importedPath.replace(/\\/g, '/'),
      inboxPath: inboxPath.replace(/\\/g, '/')
    });
  }

  const manifest = writeManifest(records);

  return {
    status: 'HB-SOS_HANDOFF_IMPORT_COMPLETE',
    imported: records.filter(r => r.status === 'IMPORTED').length,
    rejected: records.filter(r => r.status === 'REJECTED').length,
    records,
    manifest
  };
}
