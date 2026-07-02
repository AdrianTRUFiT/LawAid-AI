import fs from 'node:fs'
import path from 'node:path'
import type {
  HilEnforcementInput,
  HilEnforcementResult,
  HilEnforcementSeal
} from './hilEnforcementContracts'

const BASE = 'D:/DEV/AIVA/shared-data/hil-enforcement'
const FILE = 'append-only-enforcement.jsonl'

export function appendEnforcementRecord(
  input: HilEnforcementInput,
  result: HilEnforcementResult,
  seal?: HilEnforcementSeal
): string {
  if (!fs.existsSync(BASE)) {
    fs.mkdirSync(BASE, { recursive: true })
  }

  const file = path.join(BASE, FILE)

  const record = {
    timestamp: new Date().toISOString(),
    runtimeEnvelopeId: input.runtime.envelopeId,
    governanceEnvelopeId: input.governance.envelopeId,
    seal,
    runtimeTruthState: input.runtime.runtimeTruthState,
    packetState: input.governance.packetState,
    certified: input.governance.certified,
    enforcement: result
  }

  fs.appendFileSync(file, JSON.stringify(record) + '\n')
  return file
}
