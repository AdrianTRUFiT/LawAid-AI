export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const subjectAccess = await fetch(`${base}/api/privacy/subject-access/cust_block13_001`).then((res) => res.json());
  const retention = await fetch(`${base}/api/privacy/retention/dispute`).then((res) => res.json());
  const deletion = await fetch(`${base}/api/privacy/deletion/ReviewQueueItem`).then((res) => res.json());
  const role = await fetch(`${base}/api/privacy/role-assignment/ReviewQueueItem`).then((res) => res.json());

  console.log("SUBJECT_ACCESS_OK=", subjectAccess.ok);
  console.log("SUBJECT_QUEUE_COUNT=", subjectAccess.payload.summary.reviewQueueCount);
  console.log("RETENTION_ACTION=", retention.payload.deletionAction);
  console.log("DELETION_ACTION=", deletion.payload.action);
  console.log("ROLE_PRIMARY=", role.payload.primaryRole);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

