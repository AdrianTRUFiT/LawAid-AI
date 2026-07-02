import type {
  CandidatePerspective,
  NarrowedPerspectiveResult,
  PerspectiveTag,
  ProcessStage,
  QueryContext,
  QueryIntentType,
  ViewCapability,
} from '../../types/substrate';

const VIEW_REGISTRY: ViewCapability[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    perspectiveTags: ['workflow', 'stability', 'deadlines', 'timeline'],
    supportsEvidence: false,
    supportsCustody: false,
    supportsWorkflow: true,
    supportsAssistant: true,
  },
  {
    key: 'documents',
    label: 'Documents',
    perspectiveTags: ['evidence', 'communication', 'timeline', 'counsel'],
    supportsEvidence: true,
    supportsCustody: true,
    supportsWorkflow: false,
    supportsAssistant: true,
  },
  {
    key: 'workflow',
    label: 'Workflow',
    perspectiveTags: ['workflow', 'deadlines', 'stability', 'timeline'],
    supportsEvidence: false,
    supportsCustody: false,
    supportsWorkflow: true,
    supportsAssistant: true,
  },
  {
    key: 'tasks',
    label: 'Tasks',
    perspectiveTags: ['workflow', 'deadlines'],
    supportsEvidence: false,
    supportsCustody: false,
    supportsWorkflow: true,
    supportsAssistant: false,
  },
  {
    key: 'events',
    label: 'Events',
    perspectiveTags: ['timeline', 'deadlines', 'court'],
    supportsEvidence: false,
    supportsCustody: false,
    supportsWorkflow: true,
    supportsAssistant: false,
  },
  {
    key: 'expenses',
    label: 'Expenses',
    perspectiveTags: ['finance', 'timeline'],
    supportsEvidence: false,
    supportsCustody: false,
    supportsWorkflow: false,
    supportsAssistant: true,
  },
  {
    key: 'audit_trail',
    label: 'Audit Trail',
    perspectiveTags: ['communication', 'timeline', 'evidence'],
    supportsEvidence: true,
    supportsCustody: true,
    supportsWorkflow: false,
    supportsAssistant: false,
  },
  {
    key: 'assistant',
    label: 'Assistant',
    perspectiveTags: ['workflow', 'stability', 'communication'],
    supportsEvidence: true,
    supportsCustody: false,
    supportsWorkflow: true,
    supportsAssistant: true,
  },
  {
    key: 'evidence',
    label: 'Evidence',
    perspectiveTags: ['evidence', 'timeline', 'court'],
    supportsEvidence: true,
    supportsCustody: true,
    supportsWorkflow: false,
    supportsAssistant: true,
  },
  {
    key: 'custody',
    label: 'Custody',
    perspectiveTags: ['evidence', 'stability'],
    supportsEvidence: true,
    supportsCustody: true,
    supportsWorkflow: false,
    supportsAssistant: false,
  },
];

function detectIntentType(query: string): QueryIntentType {
  const q = query.toLowerCase();

  if (/(how do i|what do i do|steps|should i file|what is required)/.test(q)) return 'procedural';
  if (/(prove|evidence|exhibit|admission|contradiction|show what happened)/.test(q)) return 'evidentiary';
  if (/(timeline|when did|what happened first|chronology|last month)/.test(q)) return 'timeline';
  if (/(packet|complaint|motion|prepare|assemble)/.test(q)) return 'packet_building';
  if (/(send|file|submit|share|respond)/.test(q)) return 'action_taking';
  return 'informational';
}

function detectProcessStage(query: string): ProcessStage {
  const q = query.toLowerCase();

  if (/(don.t know|overwhelmed|confused|what do i do|help me start)/.test(q)) return 'confused_starting';
  if (/(gather|collect|find|search)/.test(q)) return 'gathering';
  if (/(organize|sort|bucket|group)/.test(q)) return 'organizing';
  if (/(prove|evidence|contradiction|admission)/.test(q)) return 'proving';
  if (/(prepare|packet|trial|hearing|outline)/.test(q)) return 'preparing_output';
  if (/(file|submit|send|share)/.test(q)) return 'sharing_filing';

  return 'unknown';
}

function detectPerspectiveTags(query: string): PerspectiveTag[] {
  const q = query.toLowerCase();
  const tags = new Set<PerspectiveTag>();

  if (/(fee|invoice|expense|payment|legal fees|billing)/.test(q)) tags.add('finance');
  if (/(email|text|call|communication|respond|reply|lawyer)/.test(q)) tags.add('communication');
  if (/(deadline|hearing|trial|calendar|date|last month)/.test(q)) tags.add('deadlines');
  if (/(child|children|custody|pickup|dropoff|family|parenting)/.test(q)) tags.add('children');
  if (/(doctor|medical|health|injury|treatment)/.test(q)) tags.add('medical');
  if (/(evidence|proof|exhibit|admission|contradiction)/.test(q)) tags.add('evidence');
  if (/(workflow|task|next step|what do i do)/.test(q)) tags.add('workflow');
  if (/(stress|stability|overwhelmed|fog)/.test(q)) tags.add('stability');
  if (/(timeline|chronology|when did|sequence)/.test(q)) tags.add('timeline');
  if (/(court|judge|motion|filing|order)/.test(q)) tags.add('court');
  if (/(counsel|attorney|lawyer|firm)/.test(q)) tags.add('counsel');

  return [...tags];
}

function scoreView(
  view: ViewCapability,
  perspectiveTags: PerspectiveTag[],
  intentType: QueryIntentType,
): CandidatePerspective {
  let score = 0;
  const reasons: string[] = [];

  for (const tag of perspectiveTags) {
    if (view.perspectiveTags.includes(tag)) {
      score += 5;
      reasons.push(`matched perspective tag: ${tag}`);
    }
  }

  if (intentType === 'evidentiary' && view.supportsEvidence) {
    score += 4;
    reasons.push('supports evidence');
  }

  if (intentType === 'procedural' && view.supportsWorkflow) {
    score += 4;
    reasons.push('supports workflow');
  }

  if (intentType === 'timeline' && view.perspectiveTags.includes('timeline')) {
    score += 4;
    reasons.push('supports timeline');
  }

  if (intentType === 'packet_building' && (view.supportsEvidence || view.supportsWorkflow)) {
    score += 3;
    reasons.push('supports packet-building path');
  }

  return {
    view: view.key,
    score,
    reasons,
  };
}

export function narrowPerspectives(context: QueryContext): NarrowedPerspectiveResult {
  const intentType = context.intentHint ?? detectIntentType(context.query);
  const processStage = context.processStageHint ?? detectProcessStage(context.query);

  const perspectiveTags = [
    ...new Set([
      ...(context.perspectiveHints ?? []),
      ...detectPerspectiveTags(context.query),
    ]),
  ];

  const candidates = VIEW_REGISTRY
    .map((view) => scoreView(view, perspectiveTags, intentType))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const selectedViews = candidates.slice(0, 4).map((c) => c.view);

  const explanation = [
    `intent detected: ${intentType}`,
    `process stage detected: ${processStage}`,
    `perspective tags: ${perspectiveTags.join(', ') || 'none'}`,
    `selected views: ${selectedViews.join(', ') || 'none'}`,
  ];

  return {
    query: context.query,
    intentType,
    processStage,
    candidates,
    selectedViews,
    perspectiveTags,
    explanation,
  };
}