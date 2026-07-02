import fs from 'fs';
import path from 'path';
import { RevenueEvent } from './casePathContracts';
import { calculateRevenueSnapshot } from './revenueTracking';

const HB_ROOT = 'D:/DEV/AIVA/homebase';
const INDEX = path.join(HB_ROOT, 'INDEX');

export type RevenueManifest = {
  status: 'LWI_REVENUE_MANIFEST_BUILT';
  generatedAt: string;
  event: RevenueEvent;
  snapshot: ReturnType<typeof calculateRevenueSnapshot>;
};

export function writeRevenueManifest(event: RevenueEvent): RevenueManifest {
  fs.mkdirSync(INDEX, { recursive: true });

  const snapshot = calculateRevenueSnapshot(event);

  const manifest: RevenueManifest = {
    status: 'LWI_REVENUE_MANIFEST_BUILT',
    generatedAt: new Date().toISOString(),
    event,
    snapshot
  };

  const jsonPath = path.join(INDEX, 'lwi-revenue-manifest.json');
  const mdPath = path.join(INDEX, 'lwi-revenue-manifest.md');

  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  const md = [
    '# LWI Revenue Manifest',
    '',
    'Generated: ' + manifest.generatedAt,
    '',
    '## Rule',
    '',
    '- $1 spend must return $2+ revenue from paid conversions.',
    '- Free users count economically only if they convert.',
    '',
    '## Metrics',
    '',
    '- Source: ' + event.source,
    '- Campaign: ' + (event.campaign || ''),
    '- Ad Spend: ' + event.adSpend,
    '- Gross Revenue: ' + event.grossRevenue,
    '- Paid Conversions: ' + event.paidConversions,
    '- ROAS: ' + snapshot.roas,
    '- CAC Paid Only: ' + snapshot.cacPaidOnly,
    '- Net Profit: ' + snapshot.netProfit,
    '- Status: ' + snapshot.status,
    ''
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return manifest;
}
