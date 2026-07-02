import crypto from 'crypto';

type LedgerEntry = {
  eventId: string;
  artifactId: string;
  type: string;
  timestamp: number;
  prevHash: string;
  hash: string;
};

function sha(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

let lastHash = "GENESIS";

export function writeLedger(eventId: string, artifactId: string, type: string): LedgerEntry {
  const timestamp = Date.now();

  const payload = JSON.stringify({
    eventId,
    artifactId,
    type,
    timestamp,
    prevHash: lastHash
  });

  const hash = sha(payload);

  const entry = {
    eventId,
    artifactId,
    type,
    timestamp,
    prevHash: lastHash,
    hash
  };

  lastHash = hash;

  return entry;
}
