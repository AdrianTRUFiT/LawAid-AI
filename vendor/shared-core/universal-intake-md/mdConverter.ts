import fs from 'fs';
import path from 'path';
import { MdIntakeArtifact, UniversalRawInput } from './intakeMdContracts';
import { assignIntakeMark } from './intakeMark';
import { runSoul256Scan } from './soul256Scan';
import { makeId, safeFileName, sha } from './intakeMdUtils';

const mdStore = 'D:/DEV/AIVA/shared-data/intake-md';

function ensureStore() {
  fs.mkdirSync(mdStore, { recursive: true });
}

function escapeYaml(value: string) {
  return String(value || '').replace(/"/g, '\\"');
}

export function convertToMarkdownArtifact(input: UniversalRawInput): MdIntakeArtifact {
  if (!input.body || input.body.trim().length < 5) {
    throw new Error('INTAKE_BODY_REQUIRED');
  }

  ensureStore();

  const intakeMark = assignIntakeMark(input);
  const scan = runSoul256Scan(input);
  const artifactId = makeId('MDART', { input, intakeMark, scan });
  const createdAt = Date.now();
  const fileName = safeFileName(input.title) + '-' + artifactId + '.md';
  const markdownPath = path.join(mdStore, fileName).replace(/\\/g, '/');

  const md = [
    '---',
    'artifact_id: "' + artifactId + '"',
    'source_type: "' + input.inputType + '"',
    'captured_at: "' + new Date(createdAt).toISOString() + '"',
    'entry_mode: "' + input.entryMode + '"',
    'submitted_by: "' + escapeYaml(input.submittedBy) + '"',
    'source_label: "' + escapeYaml(input.sourceLabel || '') + '"',
    'conversion_status: "converted_to_md"',
    'processing_status: "captured"',
    'intake_mark: "' + intakeMark.intakeMarkId + '"',
    'verification_status: "' + intakeMark.verificationStatus + '"',
    'soulmark_status: "' + intakeMark.soulmarkStatus + '"',
    'authoritative: false',
    'traceable: true',
    'body_hash: "' + sha(input.body) + '"',
    'scan_id: "' + scan.scanId + '"',
    'route_targets: "' + scan.recommendedRoutes.join(',') + '"',
    '---',
    '',
    '# ' + input.title,
    '',
    '## Raw Capture',
    '',
    input.body,
    '',
    '## SOUL256 Scan',
    '',
    '- Purpose: ' + scan.purpose,
    '- Risk Flags: ' + scan.riskFlags.join(', '),
    '- Continuity Flags: ' + scan.continuityFlags.join(', '),
    '- Recommended Routes: ' + scan.recommendedRoutes.join(', '),
    '',
    '## Intake Law',
    '',
    'All inputs are traceable. Not all inputs are authoritative.',
    'This artifact does not create truth, authority, release, or consequence by itself.',
    ''
  ].join('\n');

  fs.writeFileSync(markdownPath, md, 'utf8');

  return {
    artifactId,
    intakeMark,
    scan,
    markdownPath,
    routeTargets: scan.recommendedRoutes,
    createdAt
  };
}
