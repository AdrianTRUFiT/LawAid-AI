import type { IssueDraftInput, IssueFactoryResult } from '../../types/issues';
import type { ManagedIssue, PressureDomain, PriorityLevel } from '../../types/substrate';

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function inferPressureDomains(input: IssueDraftInput): PressureDomain[] {
  const hay = `${input.title} ${input.summary} ${input.nextAction ?? ''}`.toLowerCase();
  const out = new Set<PressureDomain>();

  if (/(home|house|rent|mortgage|shelter)/.test(hay)) out.add('shelter_and_home');
  if (/(job|income|work|employment)/.test(hay)) out.add('work_and_income');
  if (/(insurance|coverage)/.test(hay)) out.add('insurance_and_coverage');
  if (/(money|payment|fee|expense|support|obligation)/.test(hay)) out.add('money_and_obligations');
  if (/(child|children|family|custody|parenting|pickup|dropoff)/.test(hay)) out.add('children_and_family');
  if (/(doctor|medical|injury|recovery|health)/.test(hay)) out.add('medical_and_recovery');
  if (/(privacy|identity|reputation)/.test(hay)) out.add('privacy_identity_reputation');
  if (/(stress|fog|overwhelm|stability|anxiety)/.test(hay)) out.add('cognitive_emotional_stability');
  if (/(deadline|hearing|trial|filing|procedure|motion)/.test(hay)) out.add('procedure_and_deadlines');
  if (/(email|text|call|response|reply|communication)/.test(hay)) out.add('communication_continuity');

  return [...out];
}

function inferPriority(input: IssueDraftInput): PriorityLevel {
  const hay = `${input.title} ${input.summary}`.toLowerCase();

  if (/(urgent|trial|hearing|deadline|today|tomorrow)/.test(hay)) return 'critical';
  if (/(important|motion|evidence|fees|court)/.test(hay)) return 'high';
  if (/(follow up|review|collect)/.test(hay)) return 'medium';
  return 'low';
}

function buildWhyThisMatters(input: IssueDraftInput, pressureDomains: PressureDomain[]): string {
  if (input.whyThisMatters?.trim()) return input.whyThisMatters.trim();

  if (pressureDomains.includes('procedure_and_deadlines')) {
    return 'This affects procedural posture and should not drift under deadline pressure.';
  }

  if (pressureDomains.includes('children_and_family')) {
    return 'This affects family-related position and should stay organized and supportable.';
  }

  if (pressureDomains.includes('money_and_obligations')) {
    return 'This affects financial exposure and should be tracked clearly for later proof and presentation.';
  }

  return 'This issue should remain visible so it can be managed before it creates downstream friction.';
}

export function createManagedIssue(input: IssueDraftInput): IssueFactoryResult {
  const now = new Date().toISOString();
  const inferredPressureDomains = input.pressureDomains?.length
    ? input.pressureDomains
    : inferPressureDomains(input);

  const priority = input.priority ?? inferPriority(input);
  const whyThisMatters = buildWhyThisMatters(input, inferredPressureDomains);

  const issue: ManagedIssue = {
    id: createId('issue'),
    matterId: input.matterId,
    title: input.title.trim(),
    summary: input.summary.trim(),
    pressureDomains: inferredPressureDomains,
    priority,
    clarityState: input.clarityState ?? 'partial',
    taskType: input.taskType ?? 'unknown',
    nextAction: input.nextAction ?? 'Review and decide next move.',
    dueAt: input.dueAt ?? null,
    blockedBy: input.blockedBy ?? [],
    positionImpact: input.positionImpact ?? (priority === 'critical' || priority === 'high' ? 'high' : 'medium'),
    stabilityImpact: input.stabilityImpact ?? (inferredPressureDomains.includes('cognitive_emotional_stability') ? 'high' : 'medium'),
    downstreamRiskNote:
      input.downstreamRiskNote ??
      'If ignored, this may create more confusion, weaker continuity, or greater effort later.',
    whyThisMatters,
    linkedRecordIds: input.linkedRecordIds ?? [],
    linkedTaskIds: input.linkedTaskIds ?? [],
    linkedEventIds: input.linkedEventIds ?? [],
    linkedExpenseIds: input.linkedExpenseIds ?? [],
    linkedPerspectiveTags: [],
    createdAt: now,
    updatedAt: now,
  };

  const reasons = [
    `priority set to ${issue.priority}`,
    `pressure domains: ${issue.pressureDomains.join(', ') || 'none'}`,
    `position impact: ${issue.positionImpact}`,
    `stability impact: ${issue.stabilityImpact}`,
  ];

  return { issue, reasons };
}
