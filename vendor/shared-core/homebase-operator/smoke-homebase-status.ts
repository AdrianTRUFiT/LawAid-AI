import { getHomebaseStatus } from './homebaseStatus';

console.log('HB-SOS_STATUS=START');
console.log(JSON.stringify(getHomebaseStatus(), null, 2));
console.log('HB-SOS_STATUS=COMPLETE');
