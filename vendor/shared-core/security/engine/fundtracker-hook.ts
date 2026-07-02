import { broadcastSecurityEvent } from './broadcast'

export function recordFundTrackerEvent(tx: {
  transactionId: string
  amount?: number
  counterparty?: string
  reference?: string
  reason?: string
}) {
  broadcastSecurityEvent({
    artifactId: tx.transactionId,
    artifactType: 'ActivatedTransactionState',
    stage: 'Transact',
    decision: 'FUNDTRACKER_EVENT',
    threat: 'NONE',
    reason: tx.reason ?? 'VALID_TRANSACTION',
    enforcement: 'RECORDED',
    amount: tx.amount,
    counterparty: tx.counterparty,
    reference: tx.reference
  })
}
