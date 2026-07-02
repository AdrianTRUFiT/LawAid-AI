import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixtureDir = join(root, "fixtures", "pai-safe-pass-6");
const previewDir = join(root, "preview", "pai-safe-pass-7");
const previewPath = join(previewDir, "index.html");
const previewManifestPath = join(previewDir, "preview-manifest.json");

const fixtureFiles = [
  "pai_safe_fixture_safe.json",
  "pai_safe_fixture_hold.json",
  "pai_safe_fixture_refused.json",
  "pai_safe_fixture_empty.json",
  "pai_safe_fixture_loading.json",
  "pai_safe_fixture_unavailable.json"
];

for (const fileName of fixtureFiles) {
  const filePath = join(fixtureDir, fileName);
  if (!existsSync(filePath)) {
    throw new Error(`Missing fixture file: ${filePath}`);
  }
}

mkdirSync(previewDir, { recursive: true });

const fixtures = fixtureFiles.map((fileName) => {
  const filePath = join(fixtureDir, fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toneClass(tone) {
  if (tone === "success") return "tone-success";
  if (tone === "warning") return "tone-warning";
  if (tone === "danger") return "tone-danger";
  return "tone-neutral";
}

function actionList(actions) {
  if (!actions || actions.length === 0) return "<li>None</li>";
  return actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
}

function timelineList(labels) {
  if (!labels || labels.length === 0) return "<li>No timeline visible</li>";
  return labels.map((label) => `<li>${escapeHtml(label)}</li>`).join("");
}

function merchantCard(fixture) {
  const merchant = fixture.uiState.merchantScreen;

  return `
    <section class="card ${toneClass(merchant.tone)}" data-role="merchant" data-scenario="${escapeHtml(fixture.scenario)}">
      <div class="eyebrow">Merchant Preview</div>
      <h2>${escapeHtml(merchant.headline)}</h2>
      <p>${escapeHtml(merchant.primaryMessage)}</p>
      <dl>
        <dt>Transaction</dt><dd>${escapeHtml(merchant.transactionId ?? "none")}</dd>
        <dt>Decision</dt><dd>${escapeHtml(merchant.decision ?? "none")}</dd>
        <dt>State</dt><dd>${escapeHtml(merchant.stateKind)}</dd>
        <dt>Fulfillment</dt><dd>${escapeHtml(merchant.fulfillmentLabel ?? "none")}</dd>
        <dt>Proof</dt><dd>${escapeHtml(merchant.proofLabel ?? "none")}</dd>
        <dt>Reason</dt><dd>${escapeHtml(merchant.reasonLabel ?? "none")}</dd>
        <dt>Dispute Support</dt><dd>${escapeHtml(merchant.disputeSupportLabel ?? "none")}</dd>
      </dl>
      <h3>Allowed Actions</h3>
      <ul>${actionList(merchant.allowedActions)}</ul>
      <h3>Timeline</h3>
      <ul>${timelineList(merchant.timelineLabels)}</ul>
      <p class="read-only">Read-only. No payment, custody, or trust mutation authority.</p>
    </section>
  `;
}

function consumerCard(fixture) {
  const consumer = fixture.uiState.consumerScreen;

  return `
    <section class="card ${toneClass(consumer.tone)}" data-role="consumer" data-scenario="${escapeHtml(fixture.scenario)}">
      <div class="eyebrow">Consumer Preview</div>
      <h2>${escapeHtml(consumer.headline)}</h2>
      <p>${escapeHtml(consumer.userMessage ?? consumer.primaryMessage)}</p>
      <dl>
        <dt>Transaction</dt><dd>${escapeHtml(consumer.transactionId ?? "none")}</dd>
        <dt>Decision</dt><dd>${escapeHtml(consumer.decision ?? "none")}</dd>
        <dt>State</dt><dd>${escapeHtml(consumer.stateKind)}</dd>
        <dt>Proof</dt><dd>${escapeHtml(consumer.proofLabel ?? "none")}</dd>
        <dt>Reason</dt><dd>${escapeHtml(consumer.reasonLabel ?? "none")}</dd>
        <dt>Next Step</dt><dd>${escapeHtml(consumer.nextStepLabel ?? "none")}</dd>
      </dl>
      <h3>Allowed Actions</h3>
      <ul>${actionList(consumer.allowedActions)}</ul>
      <h3>Timeline</h3>
      <ul>${timelineList(consumer.timelineLabels)}</ul>
      <p class="read-only">Read-only. No internal risk logic exposed.</p>
    </section>
  `;
}

function internalCard(fixture) {
  const internal = fixture.uiState.internalReviewScreen;

  return `
    <section class="card internal ${toneClass(internal.tone)}" data-role="internal-review" data-scenario="${escapeHtml(fixture.scenario)}">
      <div class="eyebrow">Internal Review Preview</div>
      <h2>${escapeHtml(internal.headline)}</h2>
      <p>${escapeHtml(internal.primaryMessage)}</p>
      <dl>
        <dt>Transaction</dt><dd>${escapeHtml(internal.transactionId ?? "none")}</dd>
        <dt>Decision</dt><dd>${escapeHtml(internal.decision ?? "none")}</dd>
        <dt>State</dt><dd>${escapeHtml(internal.stateKind)}</dd>
        <dt>Review Required</dt><dd>${escapeHtml(internal.reviewRequired ?? "none")}</dd>
        <dt>Risk Codes</dt><dd>${escapeHtml((internal.riskCodes || []).join(", ") || "none")}</dd>
        <dt>Request Hash</dt><dd>${escapeHtml(internal.hashes?.requestHash ?? "none")}</dd>
        <dt>Decision Hash</dt><dd>${escapeHtml(internal.hashes?.decisionHash ?? "none")}</dd>
        <dt>Record Hash</dt><dd>${escapeHtml(internal.hashes?.recordHash ?? "none")}</dd>
        <dt>Receipt Hash</dt><dd>${escapeHtml(internal.hashes?.receiptHash ?? "none")}</dd>
      </dl>
      <h3>Blocked Authority</h3>
      <ul>${actionList(internal.blockedActions)}</ul>
      <h3>Timeline</h3>
      <ul>${timelineList(internal.timelineLabels)}</ul>
      <p class="read-only">Internal visibility only. Still cannot authorize payment, write custody, promote doctrine, or mutate trust.</p>
    </section>
  `;
}

function scenarioBlock(fixture) {
  return `
    <article class="scenario" id="scenario-${escapeHtml(fixture.scenario.toLowerCase())}">
      <header>
        <p class="eyebrow">Fixture Scenario</p>
        <h1>${escapeHtml(fixture.scenario)}</h1>
        <p>Fixture ID: ${escapeHtml(fixture.fixtureId)}</p>
      </header>
      <div class="grid">
        ${merchantCard(fixture)}
        ${consumerCard(fixture)}
        ${internalCard(fixture)}
      </div>
    </article>
  `;
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PAI-SAFE Pass 7 Read-Only Preview Harness</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #090b10;
      color: #eef2f7;
    }

    body {
      margin: 0;
      background: radial-gradient(circle at top left, rgba(55, 65, 81, 0.45), transparent 34rem), #090b10;
    }

    main {
      width: min(1440px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 64px;
    }

    .top {
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.76);
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 24px;
    }

    .top h1 {
      margin: 0 0 12px;
      font-size: clamp(28px, 4vw, 48px);
      letter-spacing: -0.04em;
    }

    .top p {
      margin: 6px 0;
      color: #cbd5e1;
      max-width: 980px;
      line-height: 1.6;
    }

    .sequence {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .sequence span {
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 999px;
      padding: 8px 12px;
      color: #dbeafe;
      background: rgba(30, 41, 59, 0.8);
      font-size: 13px;
    }

    .scenario {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(2, 6, 23, 0.54);
      border-radius: 24px;
      padding: 24px;
      margin: 24px 0;
    }

    .scenario > header {
      margin-bottom: 18px;
    }

    .scenario h1 {
      margin: 4px 0;
      font-size: 28px;
      letter-spacing: -0.03em;
    }

    .scenario header p {
      margin: 0;
      color: #94a3b8;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .card {
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 20px;
      padding: 18px;
      background: rgba(15, 23, 42, 0.78);
      min-width: 0;
    }

    .card h2 {
      margin: 4px 0 10px;
      font-size: 20px;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .card h3 {
      margin: 18px 0 8px;
      font-size: 13px;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .card p, .card li, .card dd {
      color: #cbd5e1;
      line-height: 1.45;
    }

    .eyebrow {
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin: 0;
    }

    dl {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 8px 12px;
      margin: 18px 0 0;
    }

    dt {
      color: #94a3b8;
      font-size: 12px;
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
      font-size: 13px;
    }

    ul {
      margin: 0;
      padding-left: 18px;
    }

    .read-only {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      font-size: 13px;
    }

    .tone-success {
      box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.2);
    }

    .tone-warning {
      box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.22);
    }

    .tone-danger {
      box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.24);
    }

    .tone-neutral {
      box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
    }

    .internal {
      background: rgba(17, 24, 39, 0.92);
    }

    @media (max-width: 1100px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="top">
      <p class="eyebrow">PAI-SAFE Pass 7</p>
      <h1>Read-Only Preview Harness</h1>
      <p>This static preview consumes exported Pass 6 fixture JSON. It does not run transaction logic, create truth, authorize payment, write custody, call external APIs, or mutate ProofBack Protection records.</p>
      <div class="sequence">
        <span>Circuit decides</span>
        <span>Projection reflects</span>
        <span>Surface contract maps</span>
        <span>Screen state prepares</span>
        <span>Fixture packet exports</span>
        <span>Preview reads fixtures</span>
        <span>UI renders later</span>
      </div>
    </section>

    ${fixtures.map(scenarioBlock).join("\n")}
  </main>
</body>
</html>
`;

writeFileSync(previewPath, html, "utf8");

const previewManifest = {
  generatedAt: "2026-05-11T17:00:00.000Z",
  sourceFixtureDir: "fixtures/pai-safe-pass-6",
  previewPath: "preview/pai-safe-pass-7/index.html",
  scenarioCount: fixtures.length,
  scenarios: fixtures.map((fixture) => fixture.scenario),
  authority: {
    createsTruth: false,
    mutatesState: false,
    authorizesPayment: false,
    writesCustody: false,
    promotesDoctrine: false,
    runsBusinessLogic: false,
    consumesFixturesOnly: true
  },
  boundary: {
    noReactUi: true,
    noDashboardApp: true,
    noPayments: true,
    noExternalApis: true,
    noCustody: true,
    noSoulWritePath: true,
    noFundTrackerBridge: true
  }
};

writeFileSync(previewManifestPath, JSON.stringify(previewManifest, null, 2) + "\n", "utf8");

console.log("PAI_SAFE_PASS_7_PREVIEW_BUILD=PASS");
console.log(JSON.stringify(previewManifest, null, 2));