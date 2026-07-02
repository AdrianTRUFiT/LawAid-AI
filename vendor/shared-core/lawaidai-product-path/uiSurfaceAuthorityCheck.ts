import { ShellSafeStatusAPIShape } from './shellSafeStatusAPI';

export type UISurfaceAuthorityCheck = {
  status: 'UI_SURFACE_ACCEPTED' | 'UI_SURFACE_REFUSED';
  reason: string;
  refusedFields: string[];
};

export function assertUISurfaceDidNotAlterAuthority(
  original: ShellSafeStatusAPIShape,
  receivedByUI: ShellSafeStatusAPIShape
): UISurfaceAuthorityCheck {
  const refusedFields: string[] = [];

  if (receivedByUI.renderOnly !== original.renderOnly) refusedFields.push('renderOnly');
  if (receivedByUI.authority.uiMayMutateState !== original.authority.uiMayMutateState) refusedFields.push('authority.uiMayMutateState');
  if (receivedByUI.authority.uiMayCreateAuthority !== original.authority.uiMayCreateAuthority) refusedFields.push('authority.uiMayCreateAuthority');
  if (receivedByUI.authority.uiMayUnlockExport !== original.authority.uiMayUnlockExport) refusedFields.push('authority.uiMayUnlockExport');
  if (receivedByUI.authority.uiMayCreatePaymentTruth !== original.authority.uiMayCreatePaymentTruth) refusedFields.push('authority.uiMayCreatePaymentTruth');
  if (receivedByUI.packet.renderOnly !== original.packet.renderOnly) refusedFields.push('packet.renderOnly');

  const originalBoundary = JSON.stringify(original.packet.noAuthorityContract.boundary);
  const receivedBoundary = JSON.stringify(receivedByUI.packet.noAuthorityContract.boundary);
  if (receivedBoundary !== originalBoundary) refusedFields.push('packet.noAuthorityContract.boundary');

  if (refusedFields.length > 0) {
    return {
      status: 'UI_SURFACE_REFUSED',
      reason: 'UI attempted to alter immutable authority fields.',
      refusedFields
    };
  }

  return {
    status: 'UI_SURFACE_ACCEPTED',
    reason: 'UI received render packet without authority mutation.',
    refusedFields: []
  };
}
