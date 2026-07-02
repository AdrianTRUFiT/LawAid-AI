import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  inbox: path.join(HB_ROOT, 'INBOX'),
  processing: path.join(HB_ROOT, 'PROCESSING'),
  processed: path.join(HB_ROOT, 'PROCESSED'),
  review: path.join(HB_ROOT, 'REVIEW'),
  private: path.join(HB_ROOT, 'PRIVATE'),
  llmOutbox: path.join(HB_ROOT, 'LLM_OUTBOX'),
  llmInbox: path.join(HB_ROOT, 'LLM_INBOX'),
  export: path.join(HB_ROOT, 'EXPORT'),
  index: path.join(HB_ROOT, 'INDEX'),
  manifest: path.join(HB_ROOT, 'MANIFEST')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readTextSafe(filePath: string) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function extractMeta(content: string) {
  const meta: any = {};

  if (!content.startsWith('---')) return meta;

  const end = content.indexOf('---', 3);
  if (end === -1) return meta;

  const block = content.slice(3, end).trim();

  for (const line of block.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');

    meta[key] = value;
  }

  return meta;
}

function classifyZone(zone: string) {
  if (zone === 'REVIEW') return 'NEEDS_REVIEW';
  if (zone === 'PROCESSED') return 'PROCESSED';
  if (zone === 'PRIVATE') return 'PRIVATE';
  if (zone === 'LLM_OUTBOX') return 'READY_FOR_LLM';
  if (zone === 'LLM_INBOX') return 'LLM_RESPONSE_RECEIVED';
  if (zone === 'EXPORT') return 'READY_FOR_EXPORT';
  if (zone === 'INBOX') return 'WAITING_FOR_INTAKE';
  if (zone === 'PROCESSING') return 'PROCESSING';
  return 'UNKNOWN';
}

function listZone(zoneName: string, dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => !file.startsWith('.'))
    .map(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const content = stat.isFile() ? readTextSafe(filePath) : '';
      const meta = content ? extractMeta(content) : {};

      return {
        file,
        zone: zoneName,
        path: filePath.replace(/\\/g, '/'),
        bytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        state: classifyZone(zoneName),
        hash: stat.isFile() ? sha(content).slice(0, 24) : null,
        artifactId: meta.artifact_id || null,
        intakeMark: meta.intake_mark || null,
        sourceType: meta.source_type || null,
        entryMode: meta.entry_mode || null,
        verificationStatus: meta.verification_status || null,
        soulmarkStatus: meta.soulmark_status || null,
        routeTargets: meta.route_targets || null
      };
    });
}

export function buildHomebaseIndex() {
  fs.mkdirSync(PATHS.index, { recursive: true });

  const zones = Object.entries(PATHS)
    .filter(([zone]) => zone !== 'index')
    .map(([zone, dir]) => {
      const zoneName = zone.toUpperCase();
      const files = listZone(zoneName, dir);

      return {
        zone: zoneName,
        path: dir.replace(/\\/g, '/'),
        exists: fs.existsSync(dir),
        count: files.length,
        files
      };
    });

  const allFiles = zones.flatMap(z => z.files);

  const index = {
    indexType: 'HB-SOS_INDEX_V1',
    generatedAt: new Date().toISOString(),
    root: HB_ROOT,
    totals: {
      zones: zones.length,
      files: allFiles.length,
      inbox: zones.find(z => z.zone === 'INBOX')?.count || 0,
      processing: zones.find(z => z.zone === 'PROCESSING')?.count || 0,
      processed: zones.find(z => z.zone === 'PROCESSED')?.count || 0,
      review: zones.find(z => z.zone === 'REVIEW')?.count || 0,
      private: zones.find(z => z.zone === 'PRIVATE')?.count || 0,
      llmOutbox: zones.find(z => z.zone === 'LLMOUTBOX')?.count || 0,
      llmInbox: zones.find(z => z.zone === 'LLMINBOX')?.count || 0,
      export: zones.find(z => z.zone === 'EXPORT')?.count || 0
    },
    queues: {
      needsReview: allFiles.filter(f => f.state === 'NEEDS_REVIEW'),
      waitingForIntake: allFiles.filter(f => f.state === 'WAITING_FOR_INTAKE'),
      readyForLLM: allFiles.filter(f => f.state === 'READY_FOR_LLM'),
      llmResponses: allFiles.filter(f => f.state === 'LLM_RESPONSE_RECEIVED'),
      readyForExport: allFiles.filter(f => f.state === 'READY_FOR_EXPORT')
    },
    zones
  };

  const jsonPath = path.join(PATHS.index, 'hb-sos-index.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-index.md');

  fs.writeFileSync(jsonPath, JSON.stringify(index, null, 2), 'utf8');

  const md = [
    '# HB-SOS Index',
    '',
    'Generated: ' + index.generatedAt,
    '',
    '## Totals',
    '',
    '- Total Files: ' + index.totals.files,
    '- INBOX: ' + index.totals.inbox,
    '- PROCESSING: ' + index.totals.processing,
    '- PROCESSED: ' + index.totals.processed,
    '- REVIEW: ' + index.totals.review,
    '- PRIVATE: ' + index.totals.private,
    '- LLM_OUTBOX: ' + index.totals.llmOutbox,
    '- LLM_INBOX: ' + index.totals.llmInbox,
    '- EXPORT: ' + index.totals.export,
    '',
    '## Needs Review',
    '',
    ...(index.queues.needsReview.length
      ? index.queues.needsReview.map(f => '- ' + f.file + ' | ' + (f.artifactId || 'no-artifact-id'))
      : ['- None']),
    '',
    '## Waiting For Intake',
    '',
    ...(index.queues.waitingForIntake.length
      ? index.queues.waitingForIntake.map(f => '- ' + f.file)
      : ['- None']),
    '',
    '## Ready For LLM',
    '',
    ...(index.queues.readyForLLM.length
      ? index.queues.readyForLLM.map(f => '- ' + f.file)
      : ['- None']),
    '',
    '## Ready For Export',
    '',
    ...(index.queues.readyForExport.length
      ? index.queues.readyForExport.map(f => '- ' + f.file)
      : ['- None'])
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return {
    status: 'HB-SOS_INDEX_BUILT',
    jsonPath: jsonPath.replace(/\\/g, '/'),
    mdPath: mdPath.replace(/\\/g, '/'),
    totals: index.totals,
    queues: {
      needsReview: index.queues.needsReview.length,
      waitingForIntake: index.queues.waitingForIntake.length,
      readyForLLM: index.queues.readyForLLM.length,
      llmResponses: index.queues.llmResponses.length,
      readyForExport: index.queues.readyForExport.length
    }
  };
}
