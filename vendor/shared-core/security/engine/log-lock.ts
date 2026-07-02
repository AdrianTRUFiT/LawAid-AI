import fs from 'fs'
import path from 'path'

const LOCK_FILE = 'D:/DEV/AIVA/shared-data/security-logs/.lock'

export function acquireLock() {
  while (true) {
    try {
      const fd = fs.openSync(LOCK_FILE, 'wx')
      return fd
    } catch {
      // wait until lock is free
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10)
    }
  }
}

export function releaseLock(fd: number) {
  fs.closeSync(fd)
  fs.unlinkSync(LOCK_FILE)
}
