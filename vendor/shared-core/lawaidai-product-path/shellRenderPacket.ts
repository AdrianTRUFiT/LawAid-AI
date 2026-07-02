import { LawAidAIShellRoute, getShellBindingTarget } from './shellBindingTargetMap';
import { buildNoAuthorityUIContract } from './noAuthorityUIContract';
import { ShellProductPathInput } from './shellViewContracts';
import { buildShellProductPathAdapter } from './shellProductPathAdapter';

export type ShellRenderPacket = {
  route: LawAidAIShellRoute;
  surface: string;
  renderOnly: true;
  adapterStatus: 'ADAPTER_INVOKED';
  allowedViewModels: string[];
  blockedAuthorityClaims: string[];
  noAuthorityContract: ReturnType<typeof buildNoAuthorityUIContract>;
  viewModels: ReturnType<typeof buildShellProductPathAdapter>;
};

export function buildShellRenderPacket(
  route: LawAidAIShellRoute,
  input: ShellProductPathInput
): ShellRenderPacket {
  const target = getShellBindingTarget(route);
  const noAuthorityContract = buildNoAuthorityUIContract(route);
  const viewModels = buildShellProductPathAdapter(input);

  return {
    route,
    surface: target.surface,
    renderOnly: true,
    adapterStatus: 'ADAPTER_INVOKED',
    allowedViewModels: target.allowedViewModels,
    blockedAuthorityClaims: target.blockedAuthorityClaims,
    noAuthorityContract,
    viewModels
  };
}
