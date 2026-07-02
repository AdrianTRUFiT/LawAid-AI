import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  index: path.join(HB_ROOT, 'INDEX'),
  executionQueue: path.join(HB_ROOT, 'EXECUTION_QUEUE'),
  executed: path.join(HB_ROOT, 'EXECUTED'),
  denied: path.join(HB_ROOT, 'EXECUTION_DENIED'),
  live: path.join(HB_ROOT, 'LIVE_RECORD'),
  archive: path.join(HB_ROOT, 'QUEUE_ARCHIVE'),
  completed: path.join(HB_ROOT, 'QUEUE_ARCHIVE', 'COMPLETED'),
  deniedArchive: path.join(HB_ROOT, 'QUEUE_ARCHIVE', 'DENIED'),
  duplicates: path.join(HB_ROOT, 'QUEUE_ARCHIVE', 'DUPLICATES')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function ensureDirs() {
  for (const dir of Object.values(PATHS)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeMove(source: string, targetDir: string) {
  fs.mkdirSync(targetDir, { recursive: true });

  const baseName = path.basename(source);
  let target = path.join(targetDir, baseName);

  if (fs.existsSync(target)) {
    const ext = path.extname(baseName);
    const stem = baseName.slice(0, baseName.length - ext.length);
    target = path.join(targetDir, stem + '__' + Date.now() + ext);
  }

  fs.renameSync(source, target);
  return target;
}

function readFiles(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f))
    .sort();
}

function collectKnownExecutionFingerprints() {
  const known = new Set<string>();

  for (const dir of [PATHS.executed, PATHS.denied, PATHS.live, PATHS.completed, PATHS.deniedArchive]) {
    for (const file of readFiles(dir)) {
      const raw = fs.readFileSync(file, 'utf8');
      known.add(sha(raw));
    }
  }

  return known;
}

function writeManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-queue-truth-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-queue-truth-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_QUEUE_TRUTH_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const lines = [
    '# HB-SOS Queue Truth Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Results',
    '',
    records.length
      ? records.map(r => '- ' + r.action + ' | ' + r.file + ' | ' + r.reason).join('\n')
      : '- None',
    '',
    '## Queue Truth Law',
    '',
    '- A processed execution packet should not remain endlessly executable.',
    '- Completed packets move to completed archive.',
    '- Denied packets move to denied archive.',
    '- Duplicate packets move to duplicate archive.',
    '- Queue state must represent current work, not historical noise.'
  ];

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');

  return { jsonPath, mdPath };
}

export function runHomebaseQueueTruth() {
  ensureDirs();

  const known = collectKnownExecutionFingerprints();
  const queueFiles = readFiles(PATHS.executionQueue);
  const records: any[] = [];

  for (const file of queueFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const fingerprint = sha(raw);
    const name = path.basename(file);

    if (known.has(fingerprint)) {
      const target = safeMove(file, PATHS.duplicates);
      records.push({
        file: name,
        action: 'MOVED_TO_DUPLICATES',
        reason: 'FINGERPRINT_ALREADY_EXECUTED_OR_DENIED',
        target
      });
      continue;
    }

    if (name.includes('__PACC_LOCK') || raw.includes('pacc_state: "LOCK"')) {
      const target = safeMove(file, PATHS.deniedArchive);
      records.push({
        file: name,
        action: 'MOVED_TO_DENIED_ARCHIVE',
        reason: 'PACC_LOCK_PACKET_CANNOT_REMAIN_IN_EXECUTION_QUEUE',
        target
      });
      continue;
    }

    if (name.includes('__PACC_REVIEW') || raw.includes('pacc_state: "REVIEW"')) {
      const target = safeMove(file, PATHS.deniedArchive);
      records.push({
        file: name,
        action: 'MOVED_TO_DENIED_ARCHIVE',
        reason: 'PACC_REVIEW_PACKET_CANNOT_REMAIN_IN_EXECUTION_QUEUE',
        target
      });
      continue;
    }

    if (name.includes('__PACC_PAUSE') || raw.includes('pacc_state: "PAUSE"')) {
      const target = safeMove(file, PATHS.deniedArchive);
      records.push({
        file: name,
        action: 'MOVED_TO_DENIED_ARCHIVE',
        reason: 'PACC_PAUSE_PACKET_CANNOT_REMAIN_IN_EXECUTION_QUEUE',
        target
      });
      continue;
    }

    records.push({
      file: name,
      action: 'KEPT_IN_QUEUE',
      reason: 'CURRENT_EXECUTION_CANDIDATE'
    });
  }

  const manifest = writeManifest(records);

  return {
    status: 'HB-SOS_QUEUE_TRUTH_COMPLETE',
    evaluated: records.length,
    kept: records.filter(r => r.action === 'KEPT_IN_QUEUE').length,
    duplicates: records.filter(r => r.action === 'MOVED_TO_DUPLICATES').length,
    archivedDenied: records.filter(r => r.action === 'MOVED_TO_DENIED_ARCHIVE').length,
    manifest
  };
}
