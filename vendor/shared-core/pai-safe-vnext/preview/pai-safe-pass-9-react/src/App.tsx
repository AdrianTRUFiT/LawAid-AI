import type { ReactNode } from "react";

import safeFixture from "./fixtures/pai_safe_fixture_safe.json";
import holdFixture from "./fixtures/pai_safe_fixture_hold.json";
import refusedFixture from "./fixtures/pai_safe_fixture_refused.json";
import emptyFixture from "./fixtures/pai_safe_fixture_empty.json";
import loadingFixture from "./fixtures/pai_safe_fixture_loading.json";
import unavailableFixture from "./fixtures/pai_safe_fixture_unavailable.json";
import manifest from "./fixtures/manifest.json";

type Tone = "success" | "warning" | "danger" | "neutral";

type Screen = {
  screenRole: string;
  screenMode: string;
  stateKind: string;
  transactionId: string | null;
  decision: string | null;
  tone: Tone;
  headline: string;
  primaryMessage: string;
  proofLabel: string | null;
  reasonLabel: string | null;
  nextStepLabel: string | null;
  timelineLabels: string[];
  allowedActions: string[];
  blockedActions: string[];
  sourceSurface: string;
  fulfillmentLabel?: string | null;
  disputeSupportLabel?: string | null;
  userMessage?: string | null;
  riskCodes?: string[];
  hashes?: {
    requestHash: string | null;
    decisionHash: string | null;
    recordHash: string | null;
    receiptHash: string | null;
  };
  reviewRequired?: boolean | null;
};

type FixtureRecord = {
  scenario: string;
  fixtureId: string;
  generatedAt: string;
  authority: {
    createsTruth: boolean;
    mutatesState: boolean;
    authorizesPayment: boolean;
    writesCustody: boolean;
    promotesDoctrine: boolean;
    uiRendersLater: boolean;
  };
  uiState: {
    transactionId: string | null;
    decision: string | null;
    merchantScreen: Screen;
    consumerScreen: Screen;
    internalReviewScreen: Screen;
    uiAuthority: {
      createsTruth: boolean;
      mutatesState: boolean;
      authorizesPayment: boolean;
      writesCustody: boolean;
    };
  };
};

const fixtures = [
  safeFixture,
  holdFixture,
  refusedFixture,
  emptyFixture,
  loadingFixture,
  unavailableFixture
] as FixtureRecord[];

function toneClass(tone: Tone): string {
  if (tone === "success") return "tone-success";
  if (tone === "warning") return "tone-warning";
  if (tone === "danger") return "tone-danger";
  return "tone-neutral";
}

function actionList(actions: string[]): ReactNode {
  if (!actions || actions.length === 0) {
    return <li>None</li>;
  }

  return actions.map((action) => (
    <li key={action}>{action}</li>
  ));
}

function timelineList(labels: string[]): ReactNode {
  if (!labels || labels.length === 0) {
    return <li>No timeline visible</li>;
  }

  return labels.map((label) => (
    <li key={label}>{label}</li>
  ));
}

function MerchantCard({ screen }: { screen: Screen }) {
  return (
    <section className={`card ${toneClass(screen.tone)}`} data-role="merchant-preview">
      <p className="eyebrow">Merchant Preview</p>
      <h3>{screen.headline}</h3>
      <p>{screen.primaryMessage}</p>

      <dl>
        <dt>Transaction</dt>
        <dd>{screen.transactionId ?? "none"}</dd>

        <dt>Decision</dt>
        <dd>{screen.decision ?? "none"}</dd>

        <dt>State</dt>
        <dd>{screen.stateKind}</dd>

        <dt>Fulfillment</dt>
        <dd>{screen.fulfillmentLabel ?? "none"}</dd>

        <dt>Proof</dt>
        <dd>{screen.proofLabel ?? "none"}</dd>

        <dt>Reason</dt>
        <dd>{screen.reasonLabel ?? "none"}</dd>

        <dt>Dispute</dt>
        <dd>{screen.disputeSupportLabel ?? "none"}</dd>
      </dl>

      <h4>Allowed Actions</h4>
      <ul>{actionList(screen.allowedActions)}</ul>

      <h4>Timeline</h4>
      <ul>{timelineList(screen.timelineLabels)}</ul>

      <p className="readOnly">Read-only. Merchant preview cannot mutate transaction truth.</p>
    </section>
  );
}

function ConsumerCard({ screen }: { screen: Screen }) {
  return (
    <section className={`card ${toneClass(screen.tone)}`} data-role="consumer-preview">
      <p className="eyebrow">Consumer Preview</p>
      <h3>{screen.headline}</h3>
      <p>{screen.userMessage ?? screen.primaryMessage}</p>

      <dl>
        <dt>Transaction</dt>
        <dd>{screen.transactionId ?? "none"}</dd>

        <dt>Decision</dt>
        <dd>{screen.decision ?? "none"}</dd>

        <dt>State</dt>
        <dd>{screen.stateKind}</dd>

        <dt>Proof</dt>
        <dd>{screen.proofLabel ?? "none"}</dd>

        <dt>Reason</dt>
        <dd>{screen.reasonLabel ?? "none"}</dd>

        <dt>Next Step</dt>
        <dd>{screen.nextStepLabel ?? "none"}</dd>
      </dl>

      <h4>Allowed Actions</h4>
      <ul>{actionList(screen.allowedActions)}</ul>

      <h4>Timeline</h4>
      <ul>{timelineList(screen.timelineLabels)}</ul>

      <p className="readOnly">Read-only. Consumer preview does not expose internal review logic.</p>
    </section>
  );
}

function InternalReviewCard({ screen }: { screen: Screen }) {
  return (
    <section className={`card internal ${toneClass(screen.tone)}`} data-role="internal-review-preview">
      <p className="eyebrow">Internal Review Preview</p>
      <h3>{screen.headline}</h3>
      <p>{screen.primaryMessage}</p>

      <dl>
        <dt>Transaction</dt>
        <dd>{screen.transactionId ?? "none"}</dd>

        <dt>Decision</dt>
        <dd>{screen.decision ?? "none"}</dd>

        <dt>State</dt>
        <dd>{screen.stateKind}</dd>

        <dt>Review</dt>
        <dd>{String(screen.reviewRequired ?? "none")}</dd>

        <dt>Risk Codes</dt>
        <dd>{screen.riskCodes?.join(", ") || "none"}</dd>

        <dt>Request Hash</dt>
        <dd>{screen.hashes?.requestHash ?? "none"}</dd>

        <dt>Decision Hash</dt>
        <dd>{screen.hashes?.decisionHash ?? "none"}</dd>

        <dt>Record Hash</dt>
        <dd>{screen.hashes?.recordHash ?? "none"}</dd>

        <dt>Receipt Hash</dt>
        <dd>{screen.hashes?.receiptHash ?? "none"}</dd>
      </dl>

      <h4>Blocked Authority</h4>
      <ul>{actionList(screen.blockedActions)}</ul>

      <h4>Timeline</h4>
      <ul>{timelineList(screen.timelineLabels)}</ul>

      <p className="readOnly">
        Internal visibility only. Still cannot authorize payment, write custody, promote doctrine, or mutate trust.
      </p>
    </section>
  );
}

function ScenarioBlock({ fixture }: { fixture: FixtureRecord }) {
  const { uiState } = fixture;

  return (
    <article className="scenario" data-scenario={fixture.scenario}>
      <header className="scenarioHeader">
        <p className="eyebrow">Fixture Scenario</p>
        <h2>{fixture.scenario}</h2>
        <p>{fixture.fixtureId}</p>
      </header>

      <div className="grid">
        <MerchantCard screen={uiState.merchantScreen} />
        <ConsumerCard screen={uiState.consumerScreen} />
        <InternalReviewCard screen={uiState.internalReviewScreen} />
      </div>
    </article>
  );
}

export function App() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">PAI-SAFE Pass 9</p>
        <h1>Minimal React UI Preview</h1>
        <p>
          This bounded React preview consumes verified Pass 6 fixture JSON only. It does not run transaction logic,
          create truth, mutate state, authorize payment, write custody, call external APIs, or modify ProofBack Protection records.
        </p>

        <div className="sequence" aria-label="governing sequence">
          <span>Circuit decides</span>
          <span>Projection reflects</span>
          <span>Surface contract maps</span>
          <span>Screen state prepares</span>
          <span>Fixture packet exports</span>
          <span>React preview reads fixtures</span>
          <span>UI renders later</span>
        </div>

        <div className="manifest">
          <span>Fixture count: {manifest.fixtureCount}</span>
          <span>No payments</span>
          <span>No custody</span>
          <span>No external APIs</span>
        </div>
      </section>

      {fixtures.map((fixture) => (
        <ScenarioBlock key={fixture.fixtureId} fixture={fixture} />
      ))}
    </main>
  );
}