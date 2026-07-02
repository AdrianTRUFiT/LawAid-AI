import fs from 'fs';
import path from 'path';
import { LawAidAIShellRoute } from './shellBindingTargetMap';
import { ShellProductPathInput } from './shellViewContracts';
import { buildShellSafeStatusAPIShape } from './shellSafeStatusBuilder';
import { StaticRenderDataExport } from './shellSafeStatusAPI';

const ROOT = 'D:/DEV/AIVA';
const FIXTURE_ROOT = path.join(ROOT, 'shared-data', 'lawaidai-ui-fixtures');

function safeRouteName(route: LawAidAIShellRoute) {
  return route.replace(/^\//, '').replace(/\//g, '__');
}

export function writeStaticRenderDataExport(
  route: LawAidAIShellRoute,
  input: ShellProductPathInput
): StaticRenderDataExport {
  fs.mkdirSync(FIXTURE_ROOT, { recursive: true });

  const packet = buildShellSafeStatusAPIShape(route, input);
  const jsonPath = path.join(FIXTURE_ROOT, safeRouteName(route) + '.render-packet.json');

  fs.writeFileSync(jsonPath, JSON.stringify(packet, null, 2), 'utf8');

  return {
    status: 'STATIC_RENDER_DATA_EXPORTED',
    route,
    generatedAt: new Date().toISOString(),
    jsonPath: jsonPath.replace(/\\/g, '/'),
    publicSafe: true,
    immutableAuthorityFields: [
      'renderOnly',
      'authority.uiMayMutateState',
      'authority.uiMayCreateAuthority',
      'authority.uiMayUnlockExport',
      'authority.uiMayCreatePaymentTruth',
      'packet.noAuthorityContract',
      'packet.renderOnly',
      'packet.blockedAuthorityClaims'
    ]
  };
}
