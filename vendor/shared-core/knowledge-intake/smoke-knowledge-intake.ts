import { intakeKnowledge } from './index';
import {
  getHighestFinancialLeakPatterns,
  getKnowledgeByDomain,
  getKnowledgeForWorkspace,
  getKnowledgeAffectingArtifactStage,
  getRelevantKnowledgeForPromptContext
} from './knowledgeQuery';

console.log('KNOWLEDGE_INTAKE_V1=START');

const source = intakeKnowledge({
  sourceType: 'session_extraction',
  title: 'Runtime Knowledge Intake Infrastructure',
  submittedBy: 'ADRIAN-TRUFIT-MCKENZIE',
  sourceLabel: 'MESSAGE_TO_HARD',
  body: "Strategic insights are still being created as documents. Content must be captured, parsed, classified, indexed, routed, reused, and exposed. Prevent doctrine mutation and workflow failure. Every signal must complete into a verified outcome and close as a live system record."
});

const roi = intakeKnowledge({
  sourceType: 'external_llm_output',
  title: 'Governed ROI Mechanics',
  submittedBy: 'ADRIAN-TRUFIT-MCKENZIE',
  sourceLabel: 'COPILOT',
  body: "Governed workflows create measurable ROI through time savings, error reduction, risk avoidance, and throughput gains. Payment finality risk and verification gaps create financial leakage."
});

const byDomain = getKnowledgeByDomain('ecosystem_architecture');
const forHard = getKnowledgeForWorkspace('HARD');
const liveRecordImpact = getKnowledgeAffectingArtifactStage('LIVE_SYSTEM_RECORD');
const leaks = getHighestFinancialLeakPatterns();
const markContext = getRelevantKnowledgeForPromptContext({
  workspace: 'MARK',
  riskClass: 'payment_finality_risk'
});

console.log('----');
console.log('SOURCE_ENTRY');
console.log(JSON.stringify(source, null, 2));

console.log('----');
console.log('ROI_ENTRY');
console.log(JSON.stringify(roi, null, 2));

console.log('---- VERIFICATION ----');

const sourceStoredOk =
  !!source.entry.entryId &&
  source.entry.reviewStatus === 'NEEDS_REVIEW' &&
  !!source.reviewPacket;

const roiStoredOk =
  !!roi.entry.entryId &&
  roi.entry.economicImpact.riskAvoidance === 'high';

const queryOk =
  forHard.length >= 2 &&
  leaks.length >= 1 &&
  liveRecordImpact.length >= 1;

const contextOk =
  markContext.some(e => e.entryId === roi.entry.entryId);

console.log({
  sourceStoredOk,
  roiStoredOk,
  queryOk,
  contextOk
});

if (!sourceStoredOk || !roiStoredOk || !queryOk || !contextOk) {
  throw new Error('KNOWLEDGE_INTAKE_V1_FAILED');
}

console.log('KNOWLEDGE_INTAKE_V1=PASS');
console.log('KNOWLEDGE_INTAKE_V1=COMPLETE');

