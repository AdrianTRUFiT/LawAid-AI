import fs from 'fs';
import path from 'path';
import { runPaccWithControl } from '../pacc-control';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  processed: path.join(HB_ROOT, 'PROCESSED'),
  pacc: path.join(HB_ROOT, 'PACC'),
  paccAllow: path.join(HB_ROOT, 'PACC', 'ALLOW'),
  paccNudge: path.join(HB_ROOT, 'PACC', 'NUDGE'),
  paccPause: path.join(HB_ROOT, 'PACC', 'PAUSE'),
  paccReview: path.join(HB_ROOT, 'PACC', 'REVIEW'),
  paccLock: path.join(HB_ROOT, 'PACC', 'LOCK'),
  index: path.join(HB_ROOT, 'INDEX')
};

function ensureDirs() {
  for (const dir of Object.values(PATHS)) fs.mkdirSync(dir, { recursive: true });
}

function readProcessedFiles() {
  if (!fs.existsSync(PATHS.processed)) return [];
  return fs.readdirSync(PATHS.processed)
    .filter(f => f.endsWith('.md'))
    .sort();
}

function stripSafetyAndDoctrineContext(content: string) {
  return content
    .replace(/Boundary:[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/PACC Law[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/Promotion Law[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/Execution Law[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/Review Requirement[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/## Boundary[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '')
    .replace(/## .*Law[\s\S]*?(?=\n---|\n#|\n##|$)/gi, '');
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some(p => p.test(text));
}

function classifySignal(content: string, file: string) {
  const raw = content.toLowerCase();
  const stripped = stripSafetyAndDoctrineContext(content).toLowerCase();

  const isDoctrineOrReference =
    raw.includes('captured for hb-sos intake') ||
    raw.includes('official current-state update') ||
    raw.includes('knowledge base update') ||
    raw.includes('kb update') ||
    raw.includes('doctrine') ||
    raw.includes('law') ||
    raw.includes('boundary') ||
    raw.includes('definition') ||
    raw.includes('status: current working authority') ||
    raw.includes('status: captured') ||
    raw.includes('this document exists');

  const negatedOrProtectiveContext =
    stripped.includes('do not') ||
    stripped.includes('must not') ||
    stripped.includes('does not') ||
    stripped.includes('cannot') ||
    stripped.includes('should not') ||
    stripped.includes('never ') ||
    stripped.includes('without bypassing') ||
    stripped.includes('not execute') ||
    stripped.includes('not authorize') ||
    stripped.includes('not mutate');

  const commandLike = hasAny(stripped, [
    /\brun\s+(this|now|command|pipeline|executor|script)/,
    /\bexecute\s+(now|payment|release|transaction|production|action)/,
    /\btrigger\s+(execution|release|payment|production|activation)/,
    /\binitiate\s+(payment|release|transaction|activation|production)/,
    /\bperform\s+(action|execution|release|payment)/,
    /\bsend\s+to\s+production/,
    /\bpublish\s+externally/,
    /\bauto[-\s]?execute\b/,
    /\brelease\s+(access|funds|payment|production|public)/,
    /\bprocess\s+(payment|refund|charge|payout)/
  ]);

  const verifiedError =
    hasAny(stripped, [
      /\bverified error\b/,
      /\bconfirmed breach\b/,
      /\bconfirmed unsafe\b/,
      /\bconfirmed violation\b/
    ]);

  const missingProof =
    hasAny(stripped, [
      /\bno proof\b/,
      /\bunverified\b/,
      /\bunknown authority\b/,
      /\bmissing proof\b/,
      /\bmissing artifact\b/
    ]) && !isDoctrineOrReference;

  const stageSkipping =
    hasAny(stripped, [
      /\bbypass\b/,
      /\bskip\s+(review|approval|gate|human)/,
      /\bwithout\s+(review|approval|human custody|authorization)/,
      /\boverride\s+governance\b/
    ]) && commandLike;

  const abnormalPattern =
    hasAny(stripped, [
      /\brunaway\b/,
      /\buncontrollable\b/,
      /\bautomation going wrong\b/,
      /\bautomation drift\b/
    ]);

  const parentCustodyRequired =
    hasAny(stripped, [
      /\bchild\b/,
      /\bminor\b/,
      /\bparental\b/,
      /\bparent custody\b/
    ]);

  const consequenceBearing =
    verifiedError ||
    (
      commandLike &&
      !isDoctrineOrReference &&
      !negatedOrProtectiveContext
    );

  return {
    signalId: 'HB-PACC-' + file,
    source: 'HB-SOS_PROCESSED',
    actorType: 'AUTOMATION' as const,
    automationName: 'homebase-pipeline',
    actionRequested: consequenceBearing ? 'possible_action_request' : 'reference_or_doctrine_processing',
    reversible: true,
    consequenceBearing,
    userCustodyPresent: isDoctrineOrReference ? true : false,
    parentCustodyRequired,
    parentCustodyPresent: false,
    evidenceCount: verifiedError ? 2 : 1,
    driftDetected: abnormalPattern && !isDoctrineOrReference,
    missingProof,
    stageSkipping,
    abnormalPattern: abnormalPattern && !isDoctrineOrReference,
    verifiedError,
    notes: [
      'PACC V2 intent-aware classifier evaluated between intake and decision.',
      isDoctrineOrReference ? 'Classified as doctrine/reference context.' : 'Classified as possible action context.'
    ]
  };
}

function writeManifest(records: any[]) {
  const jsonPath = path.join(PATHS.index, 'hb-sos-pacc-manifest.json');
  const mdPath = path.join(PATHS.index, 'hb-sos-pacc-manifest.md');

  const manifest = {
    manifestType: 'HB-SOS_PACC_MANIFEST_V2_INTENT_AWARE',
    generatedAt: new Date().toISOString(),
    records
  };

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const md = [
    '# HB-SOS PACC Manifest V2',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## PACC Results',
    '',
    records.length
      ? records.map(r => '- ' + r.file + ' | ' + r.state + ' | ' + r.riskLevel + ' | ' + r.reason).join('\n')
      : '- None',
    '',
    '## PACC Law',
    '',
    '- PACC separates risk from error.',
    '- PACC evaluates intent, not vocabulary.',
    '- Doctrine/reference language is not treated as action intent.',
    '- Risk creates intervention.',
    '- Verified error creates consequence.',
    '- Automation may not outrun custody.',
    '- Consequence requires verified error.'
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

export function runHomebasePaccGate() {
  ensureDirs();

  const files = readProcessedFiles();
  const records: any[] = [];

  for (const file of files) {
    const sourcePath = path.join(PATHS.processed, file);
    const content = fs.readFileSync(sourcePath, 'utf8');
    const signal = classifySignal(content, file);
    const decision = runPaccWithControl(signal);

    const targetDir =
      decision.state === 'ALLOW' ? PATHS.paccAllow :
      decision.state === 'NUDGE' ? PATHS.paccNudge :
      decision.state === 'PAUSE' ? PATHS.paccPause :
      decision.state === 'REVIEW' ? PATHS.paccReview :
      decision.state === 'LOCK' ? PATHS.paccLock :
      PATHS.pacc;

    const targetPath = path.join(targetDir, file.replace('.md', '__PACC_' + decision.state + '.md'));

    const packet = [
      '---',
      'pacc_packet: "HB-SOS_PACC_PACKET_V2_INTENT_AWARE"',
      'decision_id: "' + decision.decisionId + '"',
      'source_file: "' + file + '"',
      'state: "' + decision.state + '"',
      'risk_level: "' + decision.riskLevel + '"',
      'allowed: "' + decision.allowed + '"',
      'consequence_allowed: "' + decision.consequenceAllowed + '"',
      'reason: "' + decision.reason + '"',
      'required_next_step: "' + decision.requiredNextStep + '"',
      'created_at: "' + decision.createdAt + '"',
      '---',
      '',
      '# HB-SOS PACC Packet V2',
      '',
      'State: ' + decision.state,
      '',
      'Risk Level: ' + decision.riskLevel,
      '',
      'Reason: ' + decision.reason,
      '',
      'Required Next Step: ' + decision.requiredNextStep,
      '',
      'Boundary:',
      '- This packet does not execute consequence.',
      '- This packet gates automation before downstream decision.',
      '- Risk creates intervention, not punishment.',
      '- Verified error is required for consequence.',
      '- Intent is evaluated before vocabulary.',
      '',
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(targetPath, packet, 'utf8');

    records.push({
      file,
      state: decision.state,
      riskLevel: decision.riskLevel,
      reason: decision.reason,
      allowed: decision.allowed,
      consequenceAllowed: decision.consequenceAllowed,
      targetPath: targetPath.replace(/\\/g, '/')
    });
  }

  const manifest = writeManifest(records);

  return {
    status: 'HB-SOS_PACC_GATE_V2_COMPLETE',
    evaluated: records.length,
    allow: records.filter(r => r.state === 'ALLOW').length,
    nudge: records.filter(r => r.state === 'NUDGE').length,
    pause: records.filter(r => r.state === 'PAUSE').length,
    review: records.filter(r => r.state === 'REVIEW').length,
    lock: records.filter(r => r.state === 'LOCK').length,
    records,
    manifest
  };
}
