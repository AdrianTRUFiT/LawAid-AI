import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  executionQueue: path.join(HB_ROOT, 'EXECUTION_QUEUE'),
  active: path.join(HB_ROOT, 'ACTIVE'),
  closed: path.join(HB_ROOT, 'CLOSED'),
  index: path.join(HB_ROOT, 'INDEX')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function ensureDirs() {
  fs.mkdirSync(PATHS.executionQueue, { recursive: true });
  fs.mkdirSync(PATHS.active, { recursive: true });
  fs.mkdirSync(PATHS.closed, { recursive: true });
  fs.mkdirSync(PATHS.index, { recursive: true });
}

function readFirstQueuedPacket() {
  const files = fs.readdirSync(PATHS.executionQueue)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) return null;

  const file = files[0];
  const fullPath = path.join(PATHS.executionQueue, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  return { file, fullPath, content };
}

function extractField(content: string, field: string) {
  const re = new RegExp(field + ':\\s*"([^"]+)"');
  const match = content.match(re);
  return match ? match[1] : null;
}

function replaceField(content: string, field: string, value: string) {
  const re = new RegExp(field + ':\\s*"[^"]+"');
  if (re.test(content)) {
    return content.replace(re, field + ': "' + value + '"');
  }
  return content;
}

function writeCloseManifest(record: any) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-close-record.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-close-record.md');

  fs.writeFileSync(jsonPath, JSON.stringify(record, null, 2), 'utf8');

  const md = [
    '# HB-SOS Close Record',
    '',
    'Closed At: ' + record.closedAt,
    '',
    '## Record',
    '',
    '- Close ID: ' + record.closeId,
    '- Execution ID: ' + record.executionId,
    '- Source File: ' + record.sourceFile,
    '- Active Hash: ' + record.activeHash,
    '- Closed Hash: ' + record.closedHash,
    '- Final Status: ' + record.finalStatus,
    '- Authority: ' + record.authority,
    '',
    '## Law',
    '',
    'This close record proves local HB-SOS finality only.',
    'It does not mutate doctrine, release public content, or authorize runtime execution outside HB-SOS.'
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

export function activateAndCloseOnePacket() {
  ensureDirs();

  const queued = readFirstQueuedPacket();

  if (!queued) {
    return {
      status: 'HB-SOS_NO_EXECUTION_PACKET',
      message: 'No packet found in EXECUTION_QUEUE'
    };
  }

  const executionId =
    extractField(queued.content, 'execution_id') ||
    'HBEXEC-' + sha(queued.content).slice(0, 12);

  const sourceFile =
    extractField(queued.content, 'source_file') ||
    queued.file;

  const activeName = queued.file.replace('.md', '__ACTIVE.md');
  const activePath = path.join(PATHS.active, activeName);

  let activeContent = replaceField(
    queued.content,
    'execution_status',
    'ACTIVE'
  );

  activeContent += [
    '',
    '---',
    '## HB-SOS Active State',
    '',
    'Activated At: ' + new Date().toISOString(),
    'Active Authority: HUMAN_REVIEW_REQUIRED',
    'Active Note: This packet entered ACTIVE state for local review and closure proof.'
  ].join('\n');

  fs.writeFileSync(activePath, activeContent, 'utf8');

  const activeHash = sha(activeContent);

  const closeId = 'HBCLOSE-' + sha(executionId + activeHash).slice(0, 12);
  const closedName = queued.file.replace('.md', '__CLOSED.md');
  const closedPath = path.join(PATHS.closed, closedName);

  let closedContent = replaceField(
    activeContent,
    'execution_status',
    'CLOSED'
  );

  closedContent += [
    '',
    '---',
    '## HB-SOS Closed State',
    '',
    'Close ID: ' + closeId,
    'Closed At: ' + new Date().toISOString(),
    'Final Status: CLOSED',
    'Closure Authority: LOCAL_HB_SOS_FINALITY_ONLY',
    'Closure Note: Packet completed HB-SOS local movement loop.',
    '',
    '## Closure Boundary',
    '',
    'This closure proves HB-SOS local finality only.',
    'It does not authorize doctrine mutation, external release, public publication, payment, legal action, or production runtime change.'
  ].join('\n');

  fs.writeFileSync(closedPath, closedContent, 'utf8');

  const closedHash = sha(closedContent);

  fs.unlinkSync(queued.fullPath);

  const record = {
    recordType: 'HB-SOS_CLOSE_RECORD_V1',
    closeId,
    executionId,
    sourceFile,
    queuedFile: queued.file,
    activePath: activePath.replace(/\\/g, '/'),
    closedPath: closedPath.replace(/\\/g, '/'),
    activeHash,
    closedHash,
    finalStatus: 'CLOSED',
    authority: 'LOCAL_HB_SOS_FINALITY_ONLY',
    closedAt: new Date().toISOString()
  };

  const manifest = writeCloseManifest(record);

  return {
    status: 'HB-SOS_ACTIVE_CLOSE_COMPLETE',
    record,
    manifest
  };
}
