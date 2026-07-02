export type NavKey =
  | 'dashboard'
  | 'cases'
  | 'calendar'
  | 'events'
  | 'tasks'
  | 'documents'
  | 'expenses'
  | 'audit_trail'
  | 'activation_queue'
  | 'friction_audit'
  | 'workflow'
  | 'strategic_intake'
  | 'checklist'
  | 'wellness'
  | 'memory_hub'
  | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  description: string;
  isVisible: boolean;
  order: number;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Current position, status, and next actions.',
    isVisible: true,
    order: 10,
  },
  {
    key: 'cases',
    label: 'Cases',
    description: 'Case selection and matter-level control.',
    isVisible: true,
    order: 20,
  },
  {
    key: 'calendar',
    label: 'Calendar',
    description: 'Date-based matter scheduling and deadlines.',
    isVisible: true,
    order: 30,
  },
  {
    key: 'events',
    label: 'Events',
    description: 'Hearings, appointments, and chronology anchors.',
    isVisible: true,
    order: 40,
  },
  {
    key: 'tasks',
    label: 'Tasks',
    description: 'Action items and work assignments.',
    isVisible: true,
    order: 50,
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'Records, intake, and evidence-oriented organization.',
    isVisible: true,
    order: 60,
  },
  {
    key: 'expenses',
    label: 'Expenses',
    description: 'Financial records and legal-cost tracking.',
    isVisible: true,
    order: 70,
  },
  {
    key: 'audit_trail',
    label: 'Audit Trail',
    description: 'History, attribution, and change visibility.',
    isVisible: true,
    order: 80,
  },
  {
    key: 'activation_queue',
    label: 'Activation Queue',
    description: 'Governed activation visibility and review state.',
    isVisible: true,
    order: 90,
  },
  {
    key: 'friction_audit',
    label: 'Friction Audit',
    description: 'Real-use friction logging and refinement source.',
    isVisible: true,
    order: 100,
  },
  {
    key: 'workflow',
    label: 'Workflow',
    description: 'Operational workflow, refinement state, and outbox logic.',
    isVisible: true,
    order: 110,
  },
  {
    key: 'strategic_intake',
    label: 'Strategic Intake',
    description: 'Route incoming build or matter pressure into bounded buckets.',
    isVisible: true,
    order: 120,
  },
  {
    key: 'checklist',
    label: 'Checklist',
    description: 'Execution checklist for trial prep, packets, deadlines, and readiness.',
    isVisible: true,
    order: 130,
  },
  {
    key: 'wellness',
    label: 'Wellness',
    description: 'Pressure-awareness and stability support.',
    isVisible: true,
    order: 140,
  },
  {
    key: 'memory_hub',
    label: 'Memory Hub',
    description: 'Continuity and memory surfaces.',
    isVisible: true,
    order: 150,
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'App behavior and configuration.',
    isVisible: true,
    order: 160,
  },
];

export function getVisibleNavItems(): NavItem[] {
  return [...NAV_ITEMS]
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);
}