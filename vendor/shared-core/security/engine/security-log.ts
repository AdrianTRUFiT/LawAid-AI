import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const LOG_PATH = 'D:/DEV/AIVA/shared-data/security-logs'
const LOG_FILE = 'security-log.jsonl'

function hash(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function getLastHash(file: string): string {
  if (!fs.existsSync(file)) return 'GENESIS'
  const raw = fs.readFileSync(file, 'utf8').trim()
  if (!raw) return 'GENESIS'
  const lines = raw.split('\n')
  const last = JSON.parse(lines[lines.length - 1])
  return last.hash || 'GENESIS'
}

export function writeSecurityLog(entry: Record<string, unknown>) {
  if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH, { recursive: true })
  }

  const file = path.join(LOG_PATH, LOG_FILE)
  const prevHash = getLastHash(file)

  const baseEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
    prevHash
  }

  const entryString = JSON.stringify(baseEntry)
  const entryHash = hash(entryString)

  const finalEntry = {
    ...baseEntry,
    hash: entryHash
  }

  fs.appendFileSync(file, JSON.stringify(finalEntry) + '\n')
}
