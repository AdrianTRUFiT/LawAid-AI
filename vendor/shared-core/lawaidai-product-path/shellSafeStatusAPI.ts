import { LawAidAIShellRoute } from './shellBindingTargetMap';
import { ShellRenderPacket } from './shellRenderPacket';

export type ShellSafeStatusAPIShape = {
  status: 'SHELL_SAFE_STATUS_PACKET';
  route: LawAidAIShellRoute;
  generatedAt: string;
  renderOnly: true;
  source: 'shared-core/lawaidai-product-path';
  authority: {
    uiMayMutateState: false;
    uiMayCreateAuthority: false;
    uiMayUnlockExport: false;
    uiMayCreatePaymentTruth: false;
  };
  packet: ShellRenderPacket;
};

export type StaticRenderDataExport = {
  status: 'STATIC_RENDER_DATA_EXPORTED';
  route: LawAidAIShellRoute;
  generatedAt: string;
  jsonPath: string;
  publicSafe: boolean;
  immutableAuthorityFields: string[];
};
