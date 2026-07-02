import { writeSecurityLog } from 'D:/DEV/AIVA/shared-core/security/engine/security-log'
import { execSync } from 'child_process'

export function writeSecurityLogWithVerify(entry: any) {
  writeSecurityLog(entry)

  try {
    const result = execSync('npx tsx D:/DEV/scripts/verify-security-log.ts').toString()

    if (!result.includes('CHAIN VERIFIED')) {
      console.error('POST-WRITE VERIFICATION FAILED')
      process.exit(1)
    }

  } catch (err) {
    console.error('CHAIN VERIFICATION ERROR — SYSTEM HALT')
    process.exit(1)
  }
}
