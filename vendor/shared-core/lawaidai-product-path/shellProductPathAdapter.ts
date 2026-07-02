import {
  buildDeviceDashboardContinuityViewModel
} from '../human-computer-continuity';
import { ShellProductPathInput } from './shellViewContracts';
import { buildWorkspaceViewModel } from './workspaceViewModel';
import { buildTrialBannerViewModel } from './trialBannerViewModel';
import { buildExportLockViewModel } from './exportLockViewModel';
import { buildConversionPromptViewModel } from './conversionPromptViewModel';
import { buildRevenueDashboardViewModel } from './revenueDashboardViewModel';

export function buildShellProductPathAdapter(input: ShellProductPathInput) {
  return {
    continuity: buildDeviceDashboardContinuityViewModel(input.entrySignal),
    workspace: buildWorkspaceViewModel(input.workspace, input.entrySignal, input.activation),
    trialBanner: buildTrialBannerViewModel(input.workspace),
    exportLock: buildExportLockViewModel(input.workspace, input.activation),
    conversionPrompt: buildConversionPromptViewModel(input.workspace),
    revenueDashboard: buildRevenueDashboardViewModel(input.revenueEvent),
    boundary: [
      'Shell reflects governed state only.',
      'UI does not create authority.',
      'Activated Transaction State is required before paid export unlock.',
      'Continuity conditions govern initial human/computer movement.'
    ]
  };
}
