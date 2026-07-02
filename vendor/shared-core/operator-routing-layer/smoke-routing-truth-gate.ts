import { routingTruthGate } from './routingTruthGate'

function test(label: string, result: unknown) {
  console.log(label + '=' + JSON.stringify(result))
}

test(
  'VALID_FLOW',
  routingTruthGate(
    {
      runtimeClosureState: 'VALID',
      deterministicReplayStable: true,
      hilStateTags: [],
      degradedSupportCount: 0,
      overlapPairCount: 1,
      reasons: [],
      isStale: false
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: 'route',
      decisionRecordId: 'dec-1',
      state: 'final'
    },
    {
      replayDetected: false,
      isSuperseded: false
    }
  )
)

test(
  'DEGRADED_HOLD',
  routingTruthGate(
    {
      runtimeClosureState: 'DEGRADED',
      deterministicReplayStable: true,
      hilStateTags: [],
      degradedSupportCount: 2,
      overlapPairCount: 1,
      reasons: ['support degradation'],
      isStale: false
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: '',
      decisionRecordId: 'dec-2',
      state: 'final'
    },
    {
      replayDetected: false,
      isSuperseded: false
    }
  )
)

test(
  'REPLAY_REFUSE',
  routingTruthGate(
    {
      runtimeClosureState: 'VALID',
      deterministicReplayStable: false,
      hilStateTags: [],
      degradedSupportCount: 0,
      overlapPairCount: 1,
      reasons: [],
      isStale: false
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: '',
      decisionRecordId: 'dec-3',
      state: 'final'
    },
    {
      replayDetected: true,
      isSuperseded: false
    }
  )
)

test(
  'INCONSISTENT_REFUSE',
  routingTruthGate(
    {
      runtimeClosureState: 'INCONSISTENT',
      deterministicReplayStable: true,
      hilStateTags: [],
      degradedSupportCount: 0,
      overlapPairCount: 1,
      reasons: [],
      isStale: false
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: '',
      decisionRecordId: 'dec-4',
      state: 'final'
    },
    {
      replayDetected: false,
      isSuperseded: false
    }
  )
)

test(
  'SUPERSEDED_BLOCK',
  routingTruthGate(
    {
      runtimeClosureState: 'SUPERSEDED',
      deterministicReplayStable: true,
      hilStateTags: [],
      degradedSupportCount: 0,
      overlapPairCount: 1,
      reasons: [],
      isStale: false
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: '',
      decisionRecordId: 'dec-5',
      state: 'final'
    },
    {
      replayDetected: false,
      isSuperseded: true
    }
  )
)

test(
  'STALE_REFUSE',
  routingTruthGate(
    {
      runtimeClosureState: 'VALID',
      deterministicReplayStable: true,
      hilStateTags: [],
      degradedSupportCount: 0,
      overlapPairCount: 1,
      reasons: [],
      isStale: true
    },
    {
      triggerClassification: 'normal',
      branchResult: 'CONTINUE',
      nextAction: '',
      decisionRecordId: 'dec-6',
      state: 'final'
    },
    {
      replayDetected: false,
      isSuperseded: false
    }
  )
)
