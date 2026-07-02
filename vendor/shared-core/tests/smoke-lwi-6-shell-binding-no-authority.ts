import {
  buildMockActivation,
  buildMockContinuitySignal,
  buildMockLawAidAIWorkspace,
  buildMockRevenueEvent,
  buildNoAuthorityUIContract,
  buildShellRenderPacket,
  getShellBindingTarget,
  invokeRouteSafeShellAdapter
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const workspace = buildMockLawAidAIWorkspace({
  paid: true,
  trialState: 'paid_unlocked'
});

const entrySignal = buildMockContinuitySignal();
const activation = buildMockActivation(workspace);
const revenueEvent = buildMockRevenueEvent();

const target = getShellBindingTarget('/lawaidai/export');
assert(target.route === '/lawaidai/export', 'Shell binding target resolves export route');
assert(target.adapterRequired === true, 'Shell route requires adapter');
assert(target.uiMayMutateState === false, 'Shell route cannot mutate state');
assert(target.blockedAuthorityClaims.includes('UI_UNLOCKS_EXPORT'), 'Export route blocks UI unlock authority');

const contract = buildNoAuthorityUIContract('/lawaidai/export');
assert(contract.uiMayRenderOnly === true, 'No-authority UI contract allows render only');
assert(contract.uiMayCreateAuthority === false, 'No-authority UI contract blocks authority creation');
assert(contract.uiMayUnlockExport === false, 'No-authority UI contract blocks export unlock');
assert(contract.uiMayCreatePaymentTruth === false, 'No-authority UI contract blocks payment truth creation');

const packet = buildShellRenderPacket('/lawaidai/export', {
  workspace,
  entrySignal,
  activation,
  revenueEvent
});

assert(packet.renderOnly === true, 'Shell render packet is render-only');
assert(packet.adapterStatus === 'ADAPTER_INVOKED', 'Shell render packet invokes adapter');
assert(packet.viewModels.workspace.shellState === 'export_ready', 'Shell render packet reflects export_ready state');
assert(packet.viewModels.exportLock.exportAllowed === true, 'Shell render packet reflects export allowed from governed state');
assert(packet.noAuthorityContract.boundary.includes('UI does not create authority.'), 'Render packet preserves no-authority boundary');

const safeInvocation = invokeRouteSafeShellAdapter('/lawaidai/export', {
  workspace,
  entrySignal,
  activation,
  revenueEvent
});

assert(safeInvocation.status === 'ROUTE_SAFE_RENDER_PACKET_BUILT', 'Route-safe adapter invocation succeeds');
assert(!!safeInvocation.packet, 'Route-safe invocation returns render packet');
assert(safeInvocation.packet?.renderOnly === true, 'Route-safe invocation returns render-only packet');

const lockedWorkspace = buildMockLawAidAIWorkspace({
  paid: false,
  trialState: 'trial_active'
});

const lockedInvocation = invokeRouteSafeShellAdapter('/lawaidai/export', {
  workspace: lockedWorkspace,
  entrySignal
});

assert(lockedInvocation.status === 'ROUTE_SAFE_RENDER_PACKET_BUILT', 'Locked state still renders safely');
assert(lockedInvocation.packet?.viewModels.exportLock.locked === true, 'Locked render packet reflects locked export');
assert(lockedInvocation.packet?.viewModels.exportLock.reasons.includes('ACTIVATED_TRANSACTION_STATE_REQUIRED'), 'Locked render packet reflects missing activation');

console.log('');
console.log('LWI_6_SHELL_BINDING_NO_AUTHORITY_SMOKE=PASS');









