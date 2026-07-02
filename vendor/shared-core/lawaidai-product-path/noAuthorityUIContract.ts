import { LawAidAIShellRoute, getShellBindingTarget } from './shellBindingTargetMap';

export type NoAuthorityUIContract = {
  route: LawAidAIShellRoute;
  uiMayMutateState: false;
  uiMayCreateAuthority: false;
  uiMayUnlockExport: false;
  uiMayCreatePaymentTruth: false;
  uiMayRenderOnly: true;
  requiredAdapter: 'buildShellProductPathAdapter';
  boundary: string[];
};

export function buildNoAuthorityUIContract(route: LawAidAIShellRoute): NoAuthorityUIContract {
  const target = getShellBindingTarget(route);

  return {
    route,
    uiMayMutateState: target.uiMayMutateState,
    uiMayCreateAuthority: false,
    uiMayUnlockExport: false,
    uiMayCreatePaymentTruth: false,
    uiMayRenderOnly: true,
    requiredAdapter: 'buildShellProductPathAdapter',
    boundary: [
      'UI renders governed view models only.',
      'UI does not create authority.',
      'UI does not mutate source truth.',
      'UI does not unlock export.',
      'UI does not create payment truth.',
      'UI cannot bypass continuity, artifact law, or Activated Transaction State.'
    ]
  };
}
