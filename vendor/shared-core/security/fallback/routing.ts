import fs from 'node:fs'
import path from 'node:path'

const BASE = 'D:/DEV/AIVA/shared-data/security-fallback'

export function routeFallback(
  type: 'QUARANTINE' | 'REVIEW_QUEUE' | 'SAFE_HOLD',
  payload: Record<string, unknown>
) {
  const dir = path.join(BASE, type)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const id = String(payload.artifactId ?? 'unknown')

  const filename = Date.now().toString() + "_" + id + ".json"
  const file = path.join(dir, filename)

  fs.writeFileSync(file, JSON.stringify(payload, null, 2))
}
