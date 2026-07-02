import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  approved: path.join(HB_ROOT, 'APPROVED'),
  hold: path.join(HB_ROOT, 'HOLD'),
  rejected: path.join(HB_ROOT, 'REJECTED'),
  gatedRoute: path.join(HB_ROOT, 'GATED_ROUTE'),
  blockedRoute: path.join(HB_ROOT, 'BLOCKED_ROUTE'),
  executionQueue: path.join(HB_ROOT, 'EXECUTION_QUEUE'),
  index: path.join(HB_ROOT, 'INDEX')
};

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function ensureDirs() {
  for (const dir of Object.values(PATHS)) fs.mkdirSync(dir, { recursive: true });
}

function readMdFiles(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md'));
}

function extractDecision(content: string) {
  const match = content.match(/decision:\s*"([^"]+)"/);
  return match ? match[1] : 'UNKNOWN';
}

function blockNonApproved() {
  const blocked:any[] = [];

  for (const source of [
    { dir: PATHS.hold, className: 'HOLD' },
    { dir: PATHS.rejected, className: 'REJECTED' }
  ]) {
    for (const file of readMdFiles(source.dir)) {
      const sourcePath = path.join(source.dir, file);
      const content = fs.readFileSync(sourcePath, 'utf8');
      const decision = extractDecision(content);
      const blockId = 'HBBLOCK-' + sha(file + content).slice(0, 12);
      const targetPath = path.join(PATHS.blockedRoute, file.replace('.md', '__BLOCKED_' + blockId + '.md'));

      const packet = [
        '---',
        'blocked_route_packet: "HB-SOS_GATED_ROUTE_BLOCK_V1"',
        'block_id: "' + blockId + '"',
        'source_file: "' + file + '"',
        'source_class: "' + source.className + '"',
        'decision: "' + decision + '"',
        'reason: "ONLY_APPROVED_PACKETS_MAY_AUTO_ROUTE"',
        'authority: "GATED_AUTO_ROUTE_REFUSAL"',
        'blocked_at: "' + new Date().toISOString() + '"',
        '---',
        '',
        '# HB-SOS Blocked Route Packet',
        '',
        'This packet was blocked from auto-routing because it is not APPROVED.',
        '',
        'Boundary: HOLD and REJECTED packets cannot enter EXECUTION_QUEUE.',
        '',
        '---',
        '',
        content
      ].join('\n');

      fs.writeFileSync(targetPath, packet, 'utf8');

      blocked.push({
        blockId,
        sourceFile: file,
        decision,
        sourceClass: source.className,
        targetPath: targetPath.replace(/\\/g, '/')
      });
    }
  }

  return blocked;
}

function routeApproved() {
  const routed:any[] = [];

  for (const file of readMdFiles(PATHS.approved)) {
    const sourcePath = path.join(PATHS.approved, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const decision = extractDecision(content);

    if (decision !== 'APPROVED') continue;

    const routeId = 'HBROUTE-' + sha(file + content).slice(0, 12);

    const routedName = file.replace('.md', '__ROUTED_' + routeId + '.md');
    const routePath = path.join(PATHS.gatedRoute, routedName);
    const execPath = path.join(PATHS.executionQueue, routedName);

    const packet = [
      '---',
      'gated_route_packet: "HB-SOS_GATED_AUTO_ROUTE_V1"',
      'route_id: "' + routeId + '"',
      'source_file: "' + file + '"',
      'decision: "APPROVED"',
      'route_status: "EXECUTION_CANDIDATE"',
      'authority: "APPROVED_PACKET_ONLY"',
      'executor_gate_required: "YES"',
      'routed_at: "' + new Date().toISOString() + '"',
      '---',
      '',
      '# HB-SOS Gated Route Packet',
      '',
      'This packet was approved for gated routing.',
      '',
      'Boundary:',
      '- This does not execute automatically.',
      '- This does not mutate doctrine.',
      '- This does not authorize public release.',
      '- This does not bypass executor gate.',
      '',
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(routePath, packet, 'utf8');
    fs.writeFileSync(execPath, packet, 'utf8');

    routed.push({
      routeId,
      sourceFile: file,
      decision,
      routeStatus: 'EXECUTION_CANDIDATE',
      routePath: routePath.replace(/\\/g, '/'),
      executionQueuePath: execPath.replace(/\\/g, '/')
    });
  }

  return routed;
}

function writeManifest(routed:any[], blocked:any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-gated-auto-route-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-gated-auto-route-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_GATED_AUTO_ROUTE_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    routed,
    blocked
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const md = [
    '# HB-SOS Gated Auto Route Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Routed To Execution Queue',
    '',
    routed.length ? routed.map(r => '- ' + r.routeId + ' | ' + r.sourceFile).join('\n') : '- None',
    '',
    '## Blocked From Auto Route',
    '',
    blocked.length ? blocked.map(b => '- ' + b.blockId + ' | ' + b.sourceClass + ' | ' + b.sourceFile).join('\n') : '- None',
    '',
    '## Gate Law',
    '',
    '- Only APPROVED packets may route.',
    '- HOLD packets cannot route.',
    '- REJECTED packets cannot route.',
    '- Auto route creates execution candidates only.',
    '- Executor gate remains required.'
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

export function runGatedAutoRouter() {
  ensureDirs();

  const blocked = blockNonApproved();
  const routed = routeApproved();
  const manifest = writeManifest(routed, blocked);

  return {
    status: 'HB-SOS_GATED_AUTO_ROUTER_COMPLETE',
    routed: routed.length,
    blocked: blocked.length,
    executionCandidates: routed.length,
    manifest
  };
}
