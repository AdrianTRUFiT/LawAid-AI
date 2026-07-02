import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  hold: path.join(HB_ROOT, 'HOLD'),
  approved: path.join(HB_ROOT, 'APPROVED'),
  promoted: path.join(HB_ROOT, 'PROMOTED'),
  denied: path.join(HB_ROOT, 'PROMOTION_DENIED'),
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

function readHoldFiles() {
  if (!fs.existsSync(PATHS.hold)) return [];
  return fs.readdirSync(PATHS.hold).filter(f => f.endsWith('.md')).sort();
}

function extractTitle(content: string) {
  const line = content.split('\n').find(l => l.trim().startsWith('#'));
  return line ? line.replace(/^#+\s*/, '').trim() : 'Untitled Hold Packet';
}

function stripKnownSafetyDisclaimers(content: string) {
  return content
    .replace(/Boundary:[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/Promotion Law[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/This decision packet recommends movement[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/This promotes a HOLD packet[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/This does not execute automatically\./gi, '')
    .replace(/This does not mutate doctrine\./gi, '')
    .replace(/This does not authorize public release\./gi, '')
    .replace(/Router and executor gates still remain required\./gi, '')
    .replace(/It does not mutate doctrine, authorize public release, approve runtime execution, or bypass human custody\./gi, '');
}

function hasRequiredProof(content: string) {
  const text = content.toLowerCase();

  const checks = {
    hasDecisionPacket: text.includes('decision_packet: "hb-sos_decision_packet_v1"'),
    wasHeld: text.includes('decision: "hold"'),
    hasBoundary: text.includes('boundary:'),
    hasSource: text.includes('source_file:'),
    hasHash: text.includes('source_hash:'),
    hasReviewReason: text.includes('governance_review_required')
  };

  return {
    ...checks,
    passed: Object.values(checks).every(Boolean)
  };
}

function isUnsafeForPromotion(content: string) {
  const stripped = stripKnownSafetyDisclaimers(content).toLowerCase();

  const unsafeInstructionPatterns = [
    /authorize\s+public\s+release/,
    /approve\s+public\s+release/,
    /execute\s+payment/,
    /process\s+payment/,
    /run\s+production\s+change/,
    /mutate\s+doctrine/,
    /change\s+doctrine/,
    /bypass\s+human\s+custody/,
    /skip\s+human\s+approval/,
    /override\s+governance/,
    /auto[-\s]?execute/,
    /send\s+to\s+production/,
    /publish\s+externally/
  ];

  const hits = unsafeInstructionPatterns
    .filter(p => p.test(stripped))
    .map(p => p.toString());

  return {
    unsafe: hits.length > 0,
    hits
  };
}

function promotionClass(content: string) {
  const text = content.toLowerCase();

  if (
    text.includes('kb update') ||
    text.includes('captured for hb-sos intake') ||
    text.includes('official current-state update') ||
    text.includes('external pattern intake') ||
    text.includes('expanded operating doctrine')
  ) {
    return 'APPROVED_FOR_REFERENCE_AND_ROUTING';
  }

  return 'REQUIRES_MAIN_REVIEW_BEFORE_PROMOTION';
}

function writeManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-promotion-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-promotion-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_PROMOTION_MANIFEST_V2',
    generatedAt: new Date().toISOString(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const md = [
    '# HB-SOS Promotion Manifest V2',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Promotions',
    '',
    records.length
      ? records.map(r => '- ' + r.promotionId + ' | ' + r.status + ' | ' + r.reason + ' | ' + r.sourceFile).join('\n')
      : '- None',
    '',
    '## Promotion Law',
    '',
    '- HOLD may promote only with required proof.',
    '- Unsafe instructions deny promotion.',
    '- Safety disclaimers do not falsely block promotion.',
    '- Promotion creates APPROVED reference/routing packets only.',
    '- Promotion does not execute.',
    '- Promotion does not mutate doctrine.',
    '- Promotion does not authorize public release.',
    '- Router and executor gates still remain required.'
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

export function runHomebasePromotionEngine() {
  ensureDirs();

  const files = readHoldFiles();
  const records: any[] = [];

  for (const file of files) {
    const sourcePath = path.join(PATHS.hold, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const sourceHash = sha(content).slice(0, 16);
    const title = extractTitle(content);
    const proof = hasRequiredProof(content);
    const unsafe = isUnsafeForPromotion(content);
    const pClass = promotionClass(content);

    const promotionId = 'HBPROMO-' + sha(file + sourceHash + 'v2').slice(0, 12);

    if (!proof.passed) {
      const targetName = file.replace('.md', '__PROMOTION_DENIED_' + promotionId + '.md');
      const targetPath = path.join(PATHS.denied, targetName);

      const packet = [
        '---',
        'promotion_packet: "HB-SOS_PROMOTION_DENIAL_V2"',
        'promotion_id: "' + promotionId + '"',
        'source_file: "' + file + '"',
        'source_hash: "' + sourceHash + '"',
        'status: "DENIED"',
        'reason: "REQUIRED_PROOF_MISSING"',
        'authority: "PROMOTION_REFUSAL"',
        'created_at: "' + new Date().toISOString() + '"',
        '---',
        '',
        '# HB-SOS Promotion Denied',
        '',
        'Title: ' + title,
        '',
        'Reason: REQUIRED_PROOF_MISSING',
        '',
        'Proof Check:',
        JSON.stringify(proof, null, 2),
        '',
        '---',
        '',
        content
      ].join('\n');

      fs.writeFileSync(targetPath, packet, 'utf8');

      records.push({
        promotionId,
        sourceFile: file,
        sourceHash,
        status: 'DENIED',
        reason: 'REQUIRED_PROOF_MISSING',
        targetPath: targetPath.replace(/\\/g, '/')
      });

      continue;
    }

    if (unsafe.unsafe) {
      const targetName = file.replace('.md', '__PROMOTION_DENIED_' + promotionId + '.md');
      const targetPath = path.join(PATHS.denied, targetName);

      const packet = [
        '---',
        'promotion_packet: "HB-SOS_PROMOTION_DENIAL_V2"',
        'promotion_id: "' + promotionId + '"',
        'source_file: "' + file + '"',
        'source_hash: "' + sourceHash + '"',
        'status: "DENIED"',
        'reason: "UNSAFE_INSTRUCTION_PRESENT"',
        'unsafe_hits: "' + unsafe.hits.join(', ') + '"',
        'authority: "PROMOTION_REFUSAL"',
        'created_at: "' + new Date().toISOString() + '"',
        '---',
        '',
        '# HB-SOS Promotion Denied',
        '',
        'Title: ' + title,
        '',
        'Reason: UNSAFE_INSTRUCTION_PRESENT',
        '',
        'Unsafe Instruction Hits: ' + unsafe.hits.join(', '),
        '',
        '---',
        '',
        content
      ].join('\n');

      fs.writeFileSync(targetPath, packet, 'utf8');

      records.push({
        promotionId,
        sourceFile: file,
        sourceHash,
        status: 'DENIED',
        reason: 'UNSAFE_INSTRUCTION_PRESENT',
        unsafeHits: unsafe.hits,
        targetPath: targetPath.replace(/\\/g, '/')
      });

      continue;
    }

    if (pClass !== 'APPROVED_FOR_REFERENCE_AND_ROUTING') {
      const targetName = file.replace('.md', '__PROMOTION_DENIED_' + promotionId + '.md');
      const targetPath = path.join(PATHS.denied, targetName);

      const packet = [
        '---',
        'promotion_packet: "HB-SOS_PROMOTION_DENIAL_V2"',
        'promotion_id: "' + promotionId + '"',
        'source_file: "' + file + '"',
        'source_hash: "' + sourceHash + '"',
        'status: "DENIED"',
        'reason: "MAIN_REVIEW_REQUIRED"',
        'authority: "PROMOTION_REFUSAL"',
        'created_at: "' + new Date().toISOString() + '"',
        '---',
        '',
        '# HB-SOS Promotion Denied',
        '',
        'Title: ' + title,
        '',
        'Reason: MAIN_REVIEW_REQUIRED',
        '',
        '---',
        '',
        content
      ].join('\n');

      fs.writeFileSync(targetPath, packet, 'utf8');

      records.push({
        promotionId,
        sourceFile: file,
        sourceHash,
        status: 'DENIED',
        reason: 'MAIN_REVIEW_REQUIRED',
        targetPath: targetPath.replace(/\\/g, '/')
      });

      continue;
    }

    const approvedName = file.replace('.md', '__APPROVED_' + promotionId + '.md');
    const approvedPath = path.join(PATHS.approved, approvedName);
    const promotedPath = path.join(PATHS.promoted, approvedName);

    const packet = [
      '---',
      'promotion_packet: "HB-SOS_HOLD_TO_APPROVED_PROMOTION_V2"',
      'promotion_id: "' + promotionId + '"',
      'source_file: "' + file + '"',
      'source_hash: "' + sourceHash + '"',
      'decision: "APPROVED"',
      'promotion_class: "' + pClass + '"',
      'authority: "LOCAL_HB_SOS_PROMOTION_ONLY"',
      'router_gate_required: "YES"',
      'executor_gate_required: "YES"',
      'created_at: "' + new Date().toISOString() + '"',
      '---',
      '',
      '# HB-SOS Promoted Approval Packet',
      '',
      'Title: ' + title,
      '',
      'Decision: APPROVED',
      '',
      'Promotion Class: ' + pClass,
      '',
      'Boundary:',
      '- This promotes a HOLD packet into APPROVED reference/routing status.',
      '- This does not execute automatically.',
      '- This does not mutate doctrine.',
      '- This does not authorize public release.',
      '- Router and executor gates still remain required.',
      '',
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(approvedPath, packet, 'utf8');
    fs.writeFileSync(promotedPath, packet, 'utf8');

    records.push({
      promotionId,
      sourceFile: file,
      sourceHash,
      status: 'PROMOTED',
      reason: pClass,
      approvedPath: approvedPath.replace(/\\/g, '/'),
      promotedPath: promotedPath.replace(/\\/g, '/')
    });
  }

  const manifest = writeManifest(records);

  return {
    status: 'HB-SOS_PROMOTION_ENGINE_V2_COMPLETE',
    evaluated: records.length,
    promoted: records.filter(r => r.status === 'PROMOTED').length,
    denied: records.filter(r => r.status === 'DENIED').length,
    records,
    manifest
  };
}
