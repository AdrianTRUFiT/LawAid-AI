export type LawAidAIShellRoute =
  | '/lawaidai'
  | '/lawaidai/workspace'
  | '/lawaidai/timeline'
  | '/lawaidai/evidence'
  | '/lawaidai/issues'
  | '/lawaidai/export'
  | '/lawaidai/revenue';

export type ShellBindingTarget = {
  route: LawAidAIShellRoute;
  surface: string;
  adapterRequired: true;
  uiMayMutateState: false;
  allowedViewModels: string[];
  blockedAuthorityClaims: string[];
};

export const LAWAIDAI_SHELL_BINDING_TARGETS: ShellBindingTarget[] = [
  {
    route: '/lawaidai',
    surface: 'entry-dashboard',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['continuity', 'workspace', 'trialBanner', 'conversionPrompt'],
    blockedAuthorityClaims: ['UI_CREATES_ENTRY_AUTHORITY', 'UI_CREATES_VERIFIED_OPPORTUNITY']
  },
  {
    route: '/lawaidai/workspace',
    surface: 'case-workspace',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['workspace', 'trialBanner', 'conversionPrompt'],
    blockedAuthorityClaims: ['UI_CREATES_WORKSPACE_STATE', 'UI_APPROVES_EXPORT']
  },
  {
    route: '/lawaidai/timeline',
    surface: 'timeline',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['workspace', 'trialBanner'],
    blockedAuthorityClaims: ['UI_CREATES_FACTS', 'UI_CONFIRMS_FACTS_WITHOUT_USER']
  },
  {
    route: '/lawaidai/evidence',
    surface: 'evidence',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['workspace', 'trialBanner'],
    blockedAuthorityClaims: ['UI_CREATES_EVIDENCE_AUTHORITY']
  },
  {
    route: '/lawaidai/issues',
    surface: 'issues',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['workspace', 'trialBanner'],
    blockedAuthorityClaims: ['UI_CREATES_LEGAL_ADVICE', 'UI_CREATES_ISSUE_AUTHORITY']
  },
  {
    route: '/lawaidai/export',
    surface: 'export-center',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['workspace', 'trialBanner', 'exportLock', 'conversionPrompt'],
    blockedAuthorityClaims: ['UI_UNLOCKS_EXPORT', 'UI_CREATES_PAYMENT_TRUTH', 'UI_BYPASSES_ACTIVATION']
  },
  {
    route: '/lawaidai/revenue',
    surface: 'revenue-dashboard',
    adapterRequired: true,
    uiMayMutateState: false,
    allowedViewModels: ['revenueDashboard'],
    blockedAuthorityClaims: ['UI_DECLARES_CHANNEL_AUTHORITY', 'UI_OVERRIDES_REVENUE_TRUTH']
  }
];

export function getShellBindingTarget(route: LawAidAIShellRoute): ShellBindingTarget {
  const target = LAWAIDAI_SHELL_BINDING_TARGETS.find(item => item.route === route);

  if (!target) {
    throw new Error('SHELL_BINDING_TARGET_NOT_FOUND: ' + route);
  }

  return target;
}
