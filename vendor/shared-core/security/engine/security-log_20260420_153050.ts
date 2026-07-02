import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const LOG_PATH = 'D:/DEV/AIVA/shared-data/security-logs'
const LOG_FILE = 'security-log.jsonl'

function hash(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function safeReadLines(file: string): string[] {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf-8')
    .split('\\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
}

function createGenesis(file: string): string {
  const base = {
    timestamp: new Date().toISOString(),
    type: 'GENESIS',
    prevHash: 'NONE'
  }

  const h = hash(JSON.stringify(base))

  const entry = {
    ...base,
    hash: h
  }

  fs.writeFileSync(file, JSON.stringify(entry) + '\\n')

  return h
}

function getLastHash(file: string): string {
  const lines = safeReadLines(file)

  if (lines.length === 0) {
    return createGenesis(file)
  }

  try {
    const last = JSON.parse(lines[lines.length - 1])
    return last.hash
  } catch {
    fs.unlinkSync(file)
    return createGenesis(file)
  }
}

export function writeSecurityLog(entry: any) {
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

  const entryHash = hash(JSON.stringify(baseEntry))

  const finalEntry = {
    ...baseEntry,
    hash: entryHash
  }

  fs.appendFileSync(file, JSON.stringify(finalEntry) + '\\n')
}
