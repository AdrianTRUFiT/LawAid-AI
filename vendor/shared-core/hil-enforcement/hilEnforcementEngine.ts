import type {
  HilEnforcementInput,
  HilEnforcementResult
} from './hilEnforcementContracts'
import { appendEnforcementRecord } from './appendOnlyEnforcementLog'
import { sealEnforcementInput } from './sealEnforcementInput'

export function enforceHilClosure(input: HilEnforcementInput): HilEnforcementResult {
  const seal = sealEnforcementInput(input)

  if (!seal || !seal.combinedHash) {
    const result: HilEnforcementResult = {
      enforcedCloseState: 'ENFORCE_REFUSE',
      enforcementReasons: ['ENFORCEMENT_INPUT_UNSEALED'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  let result: HilEnforcementResult

  if (input.protectedWriteBypassAttempted) {
    result = {
      enforcedCloseState: 'ENFORCE_REFUSE',
      enforcementReasons: ['PROTECTED_WRITE_BYPASS_ATTEMPTED'],
      appendOnlyRecorded: false,
      protectedWriteIntact: false,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (!input.governance.certified || input.governance.certificationStatus !== 'CERTIFIED') {
    result = {
      enforcedCloseState: 'ENFORCE_REFUSE_UNCERTIFIED',
      enforcementReasons: ['GOVERNANCE_UNCERTIFIED'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (
    input.governance.packetState === 'I_FACT_FAILED_MUTATION' ||
    input.governance.mutationDetected
  ) {
    result = {
      enforcedCloseState: 'ENFORCE_REFUSE_MUTATION',
      enforcementReasons: ['GOVERNANCE_MUTATION_DETECTED'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (
    input.governance.packetState === 'I_FACT_FAILED_INCOMPLETE' ||
    input.governance.incompleteDetected
  ) {
    result = {
      enforcedCloseState: 'ENFORCE_REFUSE_INCOMPLETE',
      enforcementReasons: ['GOVERNANCE_INCOMPLETE_TRANSFER'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (input.governance.governanceDecisionState === 'GOVERNANCE_REFUSED') {
    result = {
      enforcedCloseState: 'ENFORCE_REFUSE',
      enforcementReasons: ['GOVERNANCE_REFUSED_PATH'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (
    input.runtime.runtimeTruthState === 'RUNTIME_REFUSED' ||
    input.runtime.runtimeTruthState === 'RUNTIME_HELD'
  ) {
    result = {
      enforcedCloseState: 'ENFORCE_HOLD',
      enforcementReasons: ['RUNTIME_NOT_CLOSABLE'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  if (
    input.runtime.runtimeTruthState === 'RUNTIME_DEGRADED' ||
    input.governance.governanceDecisionState === 'GOVERNANCE_HOLD'
  ) {
    result = {
      enforcedCloseState: 'ENFORCE_HOLD',
      enforcementReasons: ['VALID_BUT_NOT_READY'],
      appendOnlyRecorded: false,
      protectedWriteIntact: true,
      finalPathClosed: false
    }
    appendEnforcementRecord(input, result, seal)
    return { ...result, appendOnlyRecorded: true }
  }

  result = {
    enforcedCloseState: 'ENFORCE_ALLOW',
    enforcementReasons: [],
    appendOnlyRecorded: false,
    protectedWriteIntact: true,
    finalPathClosed: true
  }

  appendEnforcementRecord(input, result, seal)
  return { ...result, appendOnlyRecorded: true }
}
