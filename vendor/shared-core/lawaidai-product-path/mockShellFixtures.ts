import { ActivatedTransactionState, LawAidAIWorkspace, RevenueEvent } from './casePathContracts';
import { HumanComputerEntrySignal } from '../human-computer-continuity';

export function buildMockLawAidAIWorkspace(overrides: Partial<LawAidAIWorkspace> = {}): LawAidAIWorkspace {
  return {
    workspaceId: 'mock-lawaidai-workspace',
    userId: 'mock-user',
    caseType: 'family_case',
    currentStep: 'preview_ready',
    trialState: 'trial_active',
    paid: false,
    documents: ['petition.pdf'],
    timelineEntries: ['2026-04-01 intake event'],
    issueBuckets: ['parenting'],
    evidenceItems: ['petition.pdf#page1'],
    communications: ['2026-04-03 email to counsel'],
    expenses: ['Filing fee 400'],
    deadlines: ['2026-05-01 hearing'],
    tasks: ['Review packet'],
    notes: ['Ready for export after paid unlock'],
    userConfirmedFacts: ['User confirmed filing date', 'User confirmed issue bucket labels'],
    confidence: 0.92,
    outputStatus: 'export_ready',
    ...overrides
  };
}

export function buildMockContinuitySignal(overrides: Partial<HumanComputerEntrySignal> = {}): HumanComputerEntrySignal {
  return {
    signalId: 'mock-signal',
    dashboardSurface: 'law-aid-dashboard',
    source: 'market-entry',
    capturedAt: new Date().toISOString(),
    attentionCaptured: true,
    statedIntent: 'I need help organizing my case.',
    structuredIntent: 'organize_legal_case_documents',
    clarityStatement: 'User needs client-side organization, timeline, and export preparation.',
    soulMarkId: 'SOULMARK-MOCK-USER',
    authorshipVerified: true,
    humanApproved: true,
    artifactType: 'VerifiedOpportunity',
    ...overrides
  };
}

export function buildMockActivation(workspace: LawAidAIWorkspace): ActivatedTransactionState {
  return {
    artifactType: 'ActivatedTransactionState',
    transactionId: 'mock-transaction',
    workspaceId: workspace.workspaceId,
    userId: workspace.userId,
    productCode: 'LAWAIDAI_CASE_EXPORT_UNLOCK',
    status: 'activated',
    amount: 49,
    currency: 'USD',
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    fundTrackerSeal: 'FTAI-SEAL-MOCK-VALID',
    source: 'TEST_STUB'
  };
}

export function buildMockRevenueEvent(): RevenueEvent {
  return {
    eventId: 'mock-revenue-event',
    createdAt: new Date().toISOString(),
    source: 'search',
    campaign: 'legal-pressure-entry',
    keyword: 'organize legal case documents',
    adSpend: 100,
    visitorCount: 300,
    trialStarts: 60,
    paidConversions: 15,
    refunds: 0,
    aiCost: 20,
    hostingCost: 10,
    grossRevenue: 350
  };
}
