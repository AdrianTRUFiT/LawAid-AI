import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPaccMode } from '../pacc-control';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  pacc: path.join(HB_ROOT, 'PACC'),
  routed: path.join(HB_ROOT, 'ROUTED'),
  hold: path.join(HB_ROOT, 'HOLD'),
  review: path.join(HB_ROOT, 'REVIEW'),
  denied: path.join(HB_ROOT, 'EXECUTION_DENIED'),
  executionQueue: path.join(HB_ROOT, 'EXECUTION_QUEUE'),
  index: path.join(HB_ROOT, 'INDEX')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function ensureDirs() {
  for (const dir of Object.values(PATHS)) fs.mkdirSync(dir, { recursive: true });
}

function extract(content: string, key: string) {
  const regex = new RegExp(key + ':\\\\s*\"([^\"]+)\"');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function readPaccPackets() {
  if (!fs.existsSync(PATHS.pacc)) return [];

  return fs.readdirSync(PATHS.pacc, { recursive: true })
    .map(f => String(f))
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(PATHS.pacc, f))
    .sort();
}

function targetForState(state: string) {
  const mode = getPaccMode();

  if (mode === 'OFF') return PATHS.executionQueue;

  if (state === 'PAUSE') return PATHS.hold;
  if (state === 'REVIEW') return PATHS.review;
  if (state === 'LOCK') return PATHS.denied;

  return PATHS.executionQueue;
}

function writeManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-router-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-router-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_ROUTER_MANIFEST_CLEAN_V1',
    generatedAt: new Date().toISOString(),
    mode: getPaccMode(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const md = [
    '# HB-SOS Router Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    'Mode: ' + manifest.mode,
    '',
    '## Routed Records',
    '',
    records.length
      ? records.map(r => '- ' + r.sourceFile + ' | ' + r.paccState + ' | ' + r.route).join('\\n')
      : '- None'
  ].join('\\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

export function runHomebaseRouter() {
  ensureDirs();

  const files = readPaccPackets();
  const records: any[] = [];

  for (const sourcePath of files) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    const sourceFile = path.basename(sourcePath);
    let state = (extract(content, 'state') || '').toUpperCase();

if (!state || state === 'ALLOW') {
  const fileUpper = sourceFile.toUpperCase();

  if (fileUpper.includes('PACC_LOCK')) state = 'LOCK';
  else if (fileUpper.includes('PACC_REVIEW')) state = 'REVIEW';
  else if (fileUpper.includes('PACC_PAUSE')) state = 'PAUSE';
  else state = 'ALLOW';
}
    const routeTarget = targetForState(state);
    const routeId = 'HBROUTE-' + sha(sourcePath + content + getPaccMode()).slice(0, 12);

    const routedName = sourceFile.replace('.md', '__ROUTED_' + routeId + '.md');
    const targetPath = path.join(routeTarget, routedName);

    const packet = [
      '---',
      'router_packet: "HB-SOS_ROUTER_PACKET_CLEAN_V1"',
      'route_id: "' + routeId + '"',
      'source_file: "' + sourceFile + '"',
      'pacc_state: "' + state + '"',
      'pacc_mode: "' + getPaccMode() + '"',
      'route: "' + path.basename(routeTarget) + '"',
      'created_at: "' + new Date().toISOString() + '"',
      '---',
      '',
      '# HB-SOS Routed Packet',
      '',
      'PACC State: ' + state,
      '',
      'Route: ' + path.basename(routeTarget),
      '',
      '---',
      '',
      content
    ].join('\\n');

    fs.writeFileSync(targetPath, packet, 'utf8');

    records.push({
      routeId,
      sourceFile,
      paccState: state,
      route: path.basename(routeTarget),
      targetPath: targetPath.replace(/\\\\/g, '/')
    });
  }

  const manifest = writeManifest(records);

  return {
    status: 'HB-SOS_ROUTER_COMPLETE',
    evaluated: records.length,
    toExecution: records.filter(r => r.route === 'EXECUTION_QUEUE').length,
    toHold: records.filter(r => r.route === 'HOLD').length,
    toReview: records.filter(r => r.route === 'REVIEW').length,
    toDenied: records.filter(r => r.route === 'EXECUTION_DENIED').length,
    records,
    manifest
  };
}
