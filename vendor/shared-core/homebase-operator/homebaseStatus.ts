import fs from 'fs';
import path from 'path';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  inbox: path.join(HB_ROOT, 'INBOX'),
  processing: path.join(HB_ROOT, 'PROCESSING'),
  processed: path.join(HB_ROOT, 'PROCESSED'),
  review: path.join(HB_ROOT, 'REVIEW'),
  private: path.join(HB_ROOT, 'PRIVATE'),
  llmOutbox: path.join(HB_ROOT, 'LLM_OUTBOX'),
  llmInbox: path.join(HB_ROOT, 'LLM_INBOX'),
  export: path.join(HB_ROOT, 'EXPORT'),
  index: path.join(HB_ROOT, 'INDEX'),
  manifest: path.join(HB_ROOT, 'MANIFEST')
};

export function getHomebaseStatus() {
  const status: any = {};

  for (const [key, dir] of Object.entries(PATHS)) {
    if (!fs.existsSync(dir)) {
      status[key] = { exists: false, count: 0, files: [] };
      continue;
    }

    const files = fs.readdirSync(dir);

    status[key] = {
      exists: true,
      count: files.length,
      files
    };
  }

  return {
    status: 'HB-SOS_STATUS_V1',
    root: HB_ROOT,
    generatedAt: new Date().toISOString(),
    zones: status
  };
}
