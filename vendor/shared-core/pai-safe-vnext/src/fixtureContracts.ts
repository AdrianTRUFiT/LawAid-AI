import type {
  PaiSafeUiStatePacket
} from "./uiStateContracts.js";

export type PaiSafeFixtureScenario =
  | "SAFE"
  | "HOLD"
  | "REFUSED"
  | "EMPTY"
  | "LOADING"
  | "UNAVAILABLE";

export interface PaiSafeFixtureExportRecord {
  scenario: PaiSafeFixtureScenario;
  fixtureId: string;
  generatedAt: string;
  source: "PAI_SAFE_PASS_6_FIXTURE_EXPORT_PACKET";
  authority: {
    createsTruth: false;
    mutatesState: false;
    authorizesPayment: false;
    writesCustody: false;
    promotesDoctrine: false;
    uiRendersLater: true;
  };
  uiState: PaiSafeUiStatePacket;
}

export interface PaiSafeFixtureExportManifest {
  generatedAt: string;
  fixtureCount: number;
  scenarios: PaiSafeFixtureScenario[];
  files: string[];
  boundary: {
    noUi: true;
    noPayments: true;
    noExternalApis: true;
    noCustody: true;
    noSoulWritePath: true;
    noFundTrackerBridge: true;
  };
}