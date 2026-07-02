import { runPaccCheck } from '../pacc';
import { writePaccRecord } from '../pacc/paccRecord';

export function triggerPaccButton(input: any) {
  const decision = runPaccCheck(input);
  const record = writePaccRecord(input, decision);

  return {
    trigger: 'PACC_BUTTON',
    decision,
    record
  };
}
