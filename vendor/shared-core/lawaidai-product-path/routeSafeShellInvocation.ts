import { LawAidAIShellRoute } from './shellBindingTargetMap';
import { ShellProductPathInput } from './shellViewContracts';
import { buildShellRenderPacket } from './shellRenderPacket';

export type RouteSafeInvocationResult = {
  status: 'ROUTE_SAFE_RENDER_PACKET_BUILT' | 'ROUTE_SAFE_RENDER_REFUSED';
  route: LawAidAIShellRoute;
  reason: string;
  packet?: ReturnType<typeof buildShellRenderPacket>;
};

export function invokeRouteSafeShellAdapter(
  route: LawAidAIShellRoute,
  input: ShellProductPathInput
): RouteSafeInvocationResult {
  try {
    const packet = buildShellRenderPacket(route, input);

    if (!packet.noAuthorityContract.uiMayRenderOnly) {
      return {
        status: 'ROUTE_SAFE_RENDER_REFUSED',
        route,
        reason: 'NO_AUTHORITY_CONTRACT_FAILED'
      };
    }

    if (!packet.renderOnly) {
      return {
        status: 'ROUTE_SAFE_RENDER_REFUSED',
        route,
        reason: 'RENDER_ONLY_REQUIRED'
      };
    }

    return {
      status: 'ROUTE_SAFE_RENDER_PACKET_BUILT',
      route,
      reason: 'ROUTE_SAFE_ADAPTER_INVOKED',
      packet
    };
  } catch (error: any) {
    return {
      status: 'ROUTE_SAFE_RENDER_REFUSED',
      route,
      reason: error?.message || String(error)
    };
  }
}
