import type { ChecklistTemplate } from '../../types/checklist';

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    key: 'trial_prep_core',
    label: 'Trial Prep Core',
    description: 'Core readiness checklist for upcoming hearing or trial pressure.',
    items: [
      {
        title: 'Confirm procedural posture',
        description: 'Verify hearing/trial status, pending deadlines, unresolved filings, and what the court is expecting next.',
        category: 'procedure',
        priority: 'critical',
      },
      {
        title: 'Build unresolved issue chart',
        description: 'List each unresolved issue and the current ask, support, and weakness for each one.',
        category: 'procedure',
        priority: 'high',
      },
      {
        title: 'Assemble exhibit index',
        description: 'Group records by issue, authentication value, and hearing usefulness.',
        category: 'evidence',
        priority: 'critical',
      },
      {
        title: 'Build witness preparation sheet',
        description: 'Identify who matters, why they matter, and what each witness supports or weakens.',
        category: 'witness',
        priority: 'high',
      },
      {
        title: 'Draft testimony modules',
        description: 'Break testimony into issue-linked modules instead of one long unstructured narrative.',
        category: 'testimony',
        priority: 'high',
      },
      {
        title: 'Prepare financial presentation',
        description: 'Organize fees, obligations, claims, and financial proof into one usable hearing packet.',
        category: 'financial',
        priority: 'high',
      },
      {
        title: 'Prepare hearing-ready packet',
        description: 'Gather the minimal complete set of materials needed for hearing or trial readiness.',
        category: 'packet',
        priority: 'critical',
      },
    ],
  },
  {
    key: 'settlement_path',
    label: 'Settlement Path',
    description: 'Governed settlement planning instead of loose drafting.',
    items: [
      {
        title: 'Map settlement issues',
        description: 'Identify issues that can be negotiated, escalated, or held for court fallback.',
        category: 'settlement',
        priority: 'high',
      },
      {
        title: 'Link evidence support',
        description: 'Attach support logic to each proposed term or fallback position.',
        category: 'evidence',
        priority: 'high',
      },
      {
        title: 'Draft proposal structure',
        description: 'Create proposal sections by issue, not by free-form drafting.',
        category: 'settlement',
        priority: 'high',
      },
      {
        title: 'Track response posture',
        description: 'Capture what was accepted, rejected, unanswered, or needs revision.',
        category: 'communication',
        priority: 'medium',
      },
    ],
  },
  {
    key: 'document_intake_review',
    label: 'Document Intake Review',
    description: 'Convert scattered material into structured reviewable workflow.',
    items: [
      {
        title: 'Import received materials',
        description: 'Load documents, binders, zip contents, or exported files into the working set.',
        category: 'evidence',
        priority: 'critical',
      },
      {
        title: 'Identify unreadable or unclear records',
        description: 'Separate what is readable from what still needs extraction or manual review.',
        category: 'evidence',
        priority: 'medium',
      },
      {
        title: 'Group by issue and chronology',
        description: 'Translate file piles into issue groups and usable date sequences.',
        category: 'evidence',
        priority: 'high',
      },
      {
        title: 'Surface missing pieces',
        description: 'Identify where chronology, proof, or communication still has gaps.',
        category: 'packet',
        priority: 'high',
      },
    ],
  },
];

export function getChecklistTemplate(templateKey: string): ChecklistTemplate | undefined {
  return CHECKLIST_TEMPLATES.find((template) => template.key === templateKey);
}
