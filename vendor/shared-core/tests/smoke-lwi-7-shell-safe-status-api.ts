import fs from 'fs';
import {
  assertUISurfaceDidNotAlterAuthority,
  buildAppRouteSmokePacketInput,
  buildShellSafeStatusAPIShape,
  writeStaticRenderDataExport
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const input = buildAppRouteSmokePacketInput('/lawaidai/export');
const statusPacket = buildShellSafeStatusAPIShape('/lawaidai/export', input);

assert(statusPacket.status === 'SHELL_SAFE_STATUS_PACKET', 'Shell-safe status API packet created');
assert(statusPacket.renderOnly === true, 'Shell-safe API packet is render-only');
assert(statusPacket.authority.uiMayMutateState === false, 'Shell-safe API blocks UI state mutation');
assert(statusPacket.authority.uiMayCreateAuthority === false, 'Shell-safe API blocks UI authority creation');
assert(statusPacket.authority.uiMayUnlockExport === false, 'Shell-safe API blocks UI export unlock');
assert(statusPacket.authority.uiMayCreatePaymentTruth === false, 'Shell-safe API blocks UI payment truth creation');
assert(statusPacket.packet.viewModels.workspace.shellState === 'export_ready', 'Shell-safe API reflects governed export_ready state');

const exported = writeStaticRenderDataExport('/lawaidai/export', input);
assert(exported.status === 'STATIC_RENDER_DATA_EXPORTED', 'Static render data export created');
assert(fs.existsSync(exported.jsonPath), 'Static render packet JSON exists');
assert(exported.immutableAuthorityFields.includes('authority.uiMayUnlockExport'), 'Static export lists immutable authority fields');

const receivedByUI = JSON.parse(JSON.stringify(statusPacket));
const accepted = assertUISurfaceDidNotAlterAuthority(statusPacket, receivedByUI);
assert(accepted.status === 'UI_SURFACE_ACCEPTED', 'Unaltered UI packet is accepted');

const tampered = JSON.parse(JSON.stringify(statusPacket));
tampered.authority.uiMayUnlockExport = true;
tampered.packet.renderOnly = false;

const refused = assertUISurfaceDidNotAlterAuthority(statusPacket, tampered);
assert(refused.status === 'UI_SURFACE_REFUSED', 'Tampered UI packet is refused');
assert(refused.refusedFields.includes('authority.uiMayUnlockExport'), 'Authority field mutation is detected');
assert(refused.refusedFields.includes('packet.renderOnly'), 'Render-only mutation is detected');

const revenueInput = buildAppRouteSmokePacketInput('/lawaidai/revenue');
const revenuePacket = buildShellSafeStatusAPIShape('/lawaidai/revenue', revenueInput);
assert(revenuePacket.packet.viewModels.revenueDashboard.status === 'PROFITABLE', 'Revenue route receives shell-safe profitable dashboard state');
assert(revenuePacket.packet.noAuthorityContract.uiMayCreatePaymentTruth === false, 'Revenue UI cannot create payment truth');

console.log('');
console.log('LWI_7_SHELL_SAFE_STATUS_API_SMOKE=PASS');









