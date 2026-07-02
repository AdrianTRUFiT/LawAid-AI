import fs from 'fs';
import { intakeToMarkdownAndKnowledge } from './runtimeBridge';

console.log('UNIVERSAL_INTAKE_MD_V1=START');

const result = intakeToMarkdownAndKnowledge({
  inputType: 'session_extraction',
  title: 'Universal Intake to Markdown Adapter Test',
  submittedBy: 'ADRIAN-TRUFIT-MCKENZIE',
  entryMode: 'PAID',
  sourceLabel: 'SYSTEM_TEST',
  body: 'This source confirms that all inputs must become markdown artifacts, receive intake marks, route through PAID, preserve source lineage, and avoid unauthorized doctrine mutation. It also affects frontend dashboard visibility, continuity, knowledge intake, and runtime registry behavior.'
});

console.log('----');
console.log('MD_ARTIFACT');
console.log(JSON.stringify(result.mdArtifact, null, 2));

console.log('----');
console.log('KNOWLEDGE_ENTRY');
console.log(JSON.stringify(result.knowledge, null, 2));

const fileExistsOk = fs.existsSync(result.mdArtifact.markdownPath);
const intakeMarkOk =
  result.mdArtifact.intakeMark.traceable === true &&
  result.mdArtifact.intakeMark.authoritative === false &&
  result.mdArtifact.intakeMark.soulmarkStatus === 'NOT_SEALED';

const routeOk =
  result.mdArtifact.routeTargets.includes('Knowledge_Intake') &&
  result.mdArtifact.routeTargets.includes('PAID') &&
  result.mdArtifact.routeTargets.includes('PONG') &&
  result.mdArtifact.routeTargets.includes('MARK');

const knowledgeOk =
  !!result.knowledge.entry.entryId &&
  result.knowledge.entry.signal.sourceLabel === 'SYSTEM_TEST';

const noAuthorityOk =
  result.mdArtifact.intakeMark.verificationStatus === 'UNVERIFIED' &&
  result.mdArtifact.intakeMark.soulmarkStatus === 'NOT_SEALED';

console.log('---- VERIFICATION ----');
console.log({
  fileExistsOk,
  intakeMarkOk,
  routeOk,
  knowledgeOk,
  noAuthorityOk
});

if (!fileExistsOk || !intakeMarkOk || !routeOk || !knowledgeOk || !noAuthorityOk) {
  throw new Error('UNIVERSAL_INTAKE_MD_V1_FAILED');
}

console.log('UNIVERSAL_INTAKE_MD_V1=PASS');
console.log('UNIVERSAL_INTAKE_MD_V1=COMPLETE');
