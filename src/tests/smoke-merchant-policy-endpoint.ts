export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const listed = await fetch(`${base}/api/fundtracker/merchant-policies`).then((res) => res.json());
  const strictPolicy = await fetch(`${base}/api/fundtracker/merchant-policy/m_201`).then((res) => res.json());
  const flexiblePolicy = await fetch(`${base}/api/fundtracker/merchant-policy/m_202`).then((res) => res.json());

  console.log("POLICY_LIST_OK=", listed.ok);
  console.log("POLICY_LIST_COUNT=", listed.payload.length);
  console.log("STRICT_POLICY_PROFILE=", strictPolicy.payload.profileName);
  console.log("STRICT_POLICY_THRESHOLD=", strictPolicy.payload.highAmountThreshold);
  console.log("FLEX_POLICY_PROFILE=", flexiblePolicy.payload.profileName);
  console.log("FLEX_POLICY_ALLOW_NON_USD=", flexiblePolicy.payload.allowNonUsd);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

