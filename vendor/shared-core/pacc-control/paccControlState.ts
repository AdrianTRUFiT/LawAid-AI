import fs from 'fs';
import path from 'path';

const CONTROL_PATH = 'D:/DEV/AIVA/shared-data/pacc-control.json';

export type PaccMode = 'ON' | 'OFF' | 'LIMITED';

export function getPaccMode(): PaccMode {
  if (!fs.existsSync(CONTROL_PATH)) return 'ON';

  const raw = fs.readFileSync(CONTROL_PATH, 'utf8');
  const parsed = JSON.parse(raw);

  return parsed.mode || 'ON';
}

export function setPaccMode(mode: PaccMode) {
  fs.mkdirSync(path.dirname(CONTROL_PATH), { recursive: true });

  fs.writeFileSync(
    CONTROL_PATH,
    JSON.stringify({ mode, updatedAt: new Date().toISOString() }, null, 2),
    'utf8'
  );

  return mode;
}
