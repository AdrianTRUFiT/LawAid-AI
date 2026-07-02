import fs from 'fs';
import path from 'path';

import { runHomebaseIntake } from './homebaseOperator';
import { runHomebaseDecisionEngine } from './homebaseDecisionEngine';
import { runHomebasePromotionEngine } from './homebasePromotionEngine';
import { runHomebaseQueueTruth } from './homebaseQueueTruth';
import { runGatedAutoRouter } from './homebaseGatedAutoRouter';
import { runHomebaseExecutor } from './homebaseExecutor';

const HB_ROOT = 'D:/DEV/AIVA/homebase';
const INBOX = path.join(HB_ROOT, 'INBOX');
const INDEX = path.join(HB_ROOT, 'INDEX');
const WATCHER_LOGS = path.join(HB_ROOT, 'WATCHER_LOGS');

let running = false;
let timer: NodeJS.Timeout | null = null;
let heartbeat: NodeJS.Timeout | null = null;

function ensureDirs() {
  fs.mkdirSync(INBOX, { recursive: true });
  fs.mkdirSync(INDEX, { recursive: true });
  fs.mkdirSync(WATCHER_LOGS, { recursive: true });
}

function nowStamp() {
  return new Date().toISOString();
}

function fileStamp() {
  return nowStamp().replace(/[:.]/g, '-');
}

function appendWatcherLog(line: string) {
  ensureDirs();
  const logPath = path.join(WATCHER_LOGS, 'hb-sos-watcher.log');
  fs.appendFileSync(logPath, '[' + nowStamp() + '] ' + line + '\n', 'utf8');
}

function writeRunLog(result: any) {
  ensureDirs();

  const jsonPath = path.join(INDEX, 'hb-sos-auto-run-' + fileStamp() + '.json');
  const latestJsonPath = path.join(INDEX, 'hb-sos-auto-run-latest.json');
  const mdPath = path.join(INDEX, 'hb-sos-auto-run-latest.md');

  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(latestJsonPath, JSON.stringify(result, null, 2), 'utf8');

  const md = [
    '# HB-SOS Auto Run Latest',
    '',
    'Generated: ' + result.completedAt,
    '',
    '## Status',
    '',
    '- Status: ' + result.status,
    '- Trigger: ' + result.trigger,
    '',
    '## Pipeline',
    '',
    '- Intake: ' + (result.intake || 'complete'),
    '- Decision Engine: ' + (result.decision ? 'complete' : 'not_run'),
    '- Promotion Engine: ' + (result.promotion ? 'complete' : 'not_run'),
    '- Queue Truth: ' + (result.queueTruth || 'complete'),
    '- Gated Router: ' + (result.routing ? 'complete' : 'not_run'),
    '- Executor: ' + (result.execution ? 'complete' : 'not_run'),
    '',
    '## Boundary',
    '',
    '- Auto-run does not bypass gates.',
    '- HOLD still blocks.',
    '- DENIED still blocks.',
    '- Executor remains final gate.',
    '- Live System Record remains the recognized outcome.',
    ''
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');
}

async function runPipeline(trigger: string) {
  if (running) {
    console.log('HB-SOS_AUTO_RUN=SKIPPED_ALREADY_RUNNING');
    appendWatcherLog('SKIPPED_ALREADY_RUNNING trigger=' + trigger);
    return;
  }

  running = true;

  console.log('HB-SOS_AUTO_RUN=START');
  console.log('TRIGGER=' + trigger);
  appendWatcherLog('PIPELINE_START trigger=' + trigger);

  try {
    runHomebaseIntake();
    const decision = runHomebaseDecisionEngine();
    const promotion = runHomebasePromotionEngine();
    runHomebaseQueueTruth();
    const routing = runGatedAutoRouter();
    const execution = runHomebaseExecutor();

    const result = {
      status: 'HB-SOS_AUTO_RUN_COMPLETE',
      trigger,
      completedAt: nowStamp(),
      intake: 'complete',
      queueTruth: 'complete',
      decision,
      promotion,
      routing,
      execution
    };

    writeRunLog(result);

    console.log(JSON.stringify({
      status: result.status,
      promoted: promotion?.promoted,
      promotionDenied: promotion?.denied,
      routed: routing?.routed,
      executed: execution?.executed,
      denied: execution?.denied
    }, null, 2));

    console.log('HB-SOS_AUTO_RUN=PASS');
    appendWatcherLog('PIPELINE_PASS trigger=' + trigger);
  } catch (error: any) {
    const result = {
      status: 'HB-SOS_AUTO_RUN_FAILED',
      trigger,
      failedAt: nowStamp(),
      completedAt: nowStamp(),
      error: error?.message || String(error),
      stack: error?.stack || ''
    };

    writeRunLog(result);

    console.error('HB-SOS_AUTO_RUN_FAILED');
    console.error(result);
    appendWatcherLog('PIPELINE_FAILED trigger=' + trigger + ' error=' + result.error);
  } finally {
    running = false;
    console.log('HB-SOS_AUTO_RUN=COMPLETE');
    appendWatcherLog('PIPELINE_COMPLETE trigger=' + trigger);
  }
}

function schedule(trigger: string) {
  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    runPipeline(trigger).catch((err) => {
      console.error('HB-SOS_AUTO_RUN_ERROR', err);
      appendWatcherLog('PIPELINE_UNHANDLED_ERROR trigger=' + trigger + ' error=' + (err?.message || String(err)));
    });
  }, 1500);
}

function startWatcher() {
  ensureDirs();

  console.log('HB-SOS_WATCHER=START');
  console.log('WATCHING=' + INBOX);
  console.log('DROP .md OR .txt FILES INTO INBOX');

  appendWatcherLog('WATCHER_START watching=' + INBOX);

  heartbeat = setInterval(() => {
    appendWatcherLog('WATCHER_HEARTBEAT running=' + running);
  }, 30000);

  fs.watch(INBOX, { persistent: true }, (eventType, filename) => {
    if (!filename) return;

    const lower = filename.toLowerCase();

    if (!lower.endsWith('.md') && !lower.endsWith('.txt')) return;

    console.log('HB-SOS_WATCHER_DETECTED=' + filename);
    appendWatcherLog('DETECTED event=' + eventType + ' filename=' + filename);

    schedule('FILE_DROP:' + filename);
  });
}

process.on('SIGINT', () => {
  appendWatcherLog('WATCHER_SIGINT');
  if (heartbeat) clearInterval(heartbeat);
  process.exit(0);
});

process.on('SIGTERM', () => {
  appendWatcherLog('WATCHER_SIGTERM');
  if (heartbeat) clearInterval(heartbeat);
  process.exit(0);
});

startWatcher();
