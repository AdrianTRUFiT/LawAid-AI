import { importHandoffDrop } from './homebaseHandoffImporter';

console.log('HB-SOS_HANDOFF_IMPORT=START');

const result = importHandoffDrop();

console.log(JSON.stringify(result, null, 2));

const completeOk =
  result.status === 'HB-SOS_HANDOFF_IMPORT_COMPLETE' ||
  result.status === 'HB-SOS_HANDOFF_IMPORT_NO_FILES';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  imported: result.imported,
  rejected: result.rejected
});

if (!completeOk) {
  throw new Error('HB_SOS_HANDOFF_IMPORT_FAILED');
}

console.log('HB-SOS_HANDOFF_IMPORT=PASS');
console.log('HB-SOS_HANDOFF_IMPORT=COMPLETE');
