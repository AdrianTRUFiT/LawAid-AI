import { LawAidAIWorkspace, RevenueEvent } from './casePathContracts';
import { ActivatedTransactionState } from './paidActivationContracts';
import { HumanComputerEntrySignal } from '../human-computer-continuity';

export type ShellSurfaceState =
  | 'entry_blocked'
  | 'needs_clarity'
  | 'needs_authorship'
  | 'needs_authority'
  | 'workspace_active'
  | 'trial_locked'
  | 'export_locked'
  | 'export_ready'
  | 'paid_unlocked';

export type TrialBannerViewModel = {
  show: boolean;
  state: LawAidAIWorkspace['trialState'];
  message: string;
  severity: 'info' | 'warning' | 'locked' | 'success';
};

export type ExportLockViewModel = {
  locked: boolean;
  exportAllowed: boolean;
  reasons: string[];
  message: string;
};

export type ConversionPromptViewModel = {
  show: boolean;
  message: string;
  reason: string;
  moment: string;
};

export type WorkspaceViewModel = {
  workspaceId: string;
  caseType: string;
  currentStep: string;
  shellState: ShellSurfaceState;
  completionScore: number;
  previewReady: boolean;
  exportCandidate: boolean;
  paid: boolean;
  trialState: LawAidAIWorkspace['trialState'];
  outputStatus: LawAidAIWorkspace['outputStatus'];
  missingItems: string[];
  continuityStatus: string;
  movementAllowed: boolean;
  visibleMessage: string;
};

export type RevenueDashboardViewModel = {
  status: string;
  roas: number;
  cacPaidOnly: number;
  netProfit: number;
  message: string;
};

export type ShellProductPathInput = {
  workspace: LawAidAIWorkspace;
  entrySignal: HumanComputerEntrySignal;
  activation?: ActivatedTransactionState;
  revenueEvent?: RevenueEvent;
};
