import { LawAidAIWorkspace } from './casePathContracts';
import { scoreWorkspaceCompletion } from './workspaceCompletion';
import { shouldShowConversion } from './trialState';

export type ConversionMoment =
  | 'NONE'
  | 'TIMELINE_READY_UNLOCK_EXPORT'
  | 'PREVIEW_READY_COMPLETE_PACKET'
  | 'TRIAL_EXPIRING_SAVE_PROGRESS'
  | 'TRIAL_LOCKED_UPGRADE_TO_CONTINUE'
  | 'EXPORT_READY_UNLOCK_DOWNLOAD';

export type ConversionMomentDecision = {
  show: boolean;
  moment: ConversionMoment;
  message: string;
  reason: string;
};

export function classifyConversionMoment(workspace: LawAidAIWorkspace): ConversionMomentDecision {
  if (workspace.paid) {
    return {
      show: false,
      moment: 'NONE',
      message: '',
      reason: 'ALREADY_PAID'
    };
  }

  if (workspace.trialState === 'trial_locked') {
    return {
      show: true,
      moment: 'TRIAL_LOCKED_UPGRADE_TO_CONTINUE',
      message: 'Your workspace is preserved. Upgrade to continue editing and export your packet.',
      reason: 'TRIAL_LOCKED'
    };
  }

  if (workspace.trialState === 'trial_expiring') {
    return {
      show: true,
      moment: 'TRIAL_EXPIRING_SAVE_PROGRESS',
      message: 'Your trial is nearing the end. Upgrade to preserve full progress and unlock final outputs.',
      reason: 'TRIAL_EXPIRING'
    };
  }

  const completion = scoreWorkspaceCompletion(workspace);

  if (workspace.currentStep === 'timeline_generated') {
    return {
      show: true,
      moment: 'TIMELINE_READY_UNLOCK_EXPORT',
      message: 'Your timeline is taking shape. Unlock the full packet when you are ready to export.',
      reason: 'TIMELINE_VALUE_VISIBLE'
    };
  }

  if (completion.previewReady && shouldShowConversion(workspace)) {
    return {
      show: true,
      moment: 'PREVIEW_READY_COMPLETE_PACKET',
      message: 'Your case preview is ready. Upgrade to complete and export your organized case packet.',
      reason: 'PREVIEW_VALUE_VISIBLE'
    };
  }

  if (completion.exportCandidate) {
    return {
      show: true,
      moment: 'EXPORT_READY_UNLOCK_DOWNLOAD',
      message: 'Your case packet is ready for final validation. Upgrade to unlock export.',
      reason: 'EXPORT_VALUE_VISIBLE'
    };
  }

  return {
    show: false,
    moment: 'NONE',
    message: '',
    reason: 'VALUE_NOT_VISIBLE_YET'
  };
}
