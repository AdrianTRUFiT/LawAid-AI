import { LawAidAIShellRoute } from './shellBindingTargetMap';
import { ShellProductPathInput } from './shellViewContracts';
import { buildShellRenderPacket } from './shellRenderPacket';
import { ShellSafeStatusAPIShape } from './shellSafeStatusAPI';

export function buildShellSafeStatusAPIShape(
  route: LawAidAIShellRoute,
  input: ShellProductPathInput
): ShellSafeStatusAPIShape {
  const packet = buildShellRenderPacket(route, input);

  return {
    status: 'SHELL_SAFE_STATUS_PACKET',
    route,
    generatedAt: new Date().toISOString(),
    renderOnly: true,
    source: 'shared-core/lawaidai-product-path',
    authority: {
      uiMayMutateState: false,
      uiMayCreateAuthority: false,
      uiMayUnlockExport: false,
      uiMayCreatePaymentTruth: false
    },
    packet
  };
}
