import {
  buildMockActivation,
  buildMockContinuitySignal,
  buildMockLawAidAIWorkspace,
  buildMockRevenueEvent
} from './mockShellFixtures';
import { LawAidAIShellRoute } from './shellBindingTargetMap';
import { ShellProductPathInput } from './shellViewContracts';

export function buildAppRouteSmokePacketInput(route: LawAidAIShellRoute): ShellProductPathInput {
  const workspace = buildMockLawAidAIWorkspace({
    paid: route === '/lawaidai/export' ? true : false,
    trialState: route === '/lawaidai/export' ? 'paid_unlocked' : 'trial_active'
  });

  const entrySignal = buildMockContinuitySignal();
  const activation = route === '/lawaidai/export' ? buildMockActivation(workspace) : undefined;
  const revenueEvent = route === '/lawaidai/revenue' ? buildMockRevenueEvent() : undefined;

  return {
    workspace,
    entrySignal,
    activation,
    revenueEvent
  };
}
