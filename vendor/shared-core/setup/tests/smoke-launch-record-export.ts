import {
  exportConsumerLaunchRecord,
  exportMerchantLaunchRecord,
  writeLaunchRecord
} from "../engine/launchRecordExportEngine";

function assertPass(label: string, condition: boolean) {
  if (!condition) {
    console.error(`${label}=FAIL`);
    process.exit(1);
  }
  console.log(`${label}=PASS`);
}

const consumer = exportConsumerLaunchRecord();
const merchant = exportMerchantLaunchRecord();

assertPass("CONSUMER_LAUNCH_EXPORT_CREATED", consumer.lane === "CONSUMER");
assertPass("MERCHANT_LAUNCH_EXPORT_CREATED", merchant.lane === "MERCHANT");

assertPass("CONSUMER_TS_REFERENCE_PRESENT", consumer.tsReference.startsWith("TS-AUTH-"));
assertPass("MERCHANT_TS_REFERENCE_PRESENT", merchant.tsReference.startsWith("TS-REC-"));

assertPass("CONSUMER_FUNDTRACKER_REQUIRED", consumer.fundTrackerRequired === true);
assertPass("MERCHANT_FUNDTRACKER_REQUIRED", merchant.fundTrackerRequired === true);

assertPass("NO_CONSUMER_FINANCIAL_AUTHORITY", consumer.financialAuthorityGranted === false);
assertPass("NO_MERCHANT_FINANCIAL_AUTHORITY", merchant.financialAuthorityGranted === false);

assertPass("NO_PAYMENT_RAILS_CONNECTED", consumer.paymentRailsConnected === false && merchant.paymentRailsConnected === false);
assertPass("NO_WALLET_CREATED", consumer.walletCreated === false && merchant.walletCreated === false);

const consumerFile = writeLaunchRecord(consumer);
const merchantFile = writeLaunchRecord(merchant);

assertPass("CONSUMER_RECORD_WRITTEN", consumerFile.endsWith(".json"));
assertPass("MERCHANT_RECORD_WRITTEN", merchantFile.endsWith(".json"));

console.log("AIVA_LAUNCH_RECORD_EXPORT_V1=PASS");
console.log("");
console.log("LAUNCH RECORD FILES:");
console.log(consumerFile);
console.log(merchantFile);