import { createProjectBox } from './projectBoxFactory';
import { evaluateProjectBox } from './projectBoxEvaluator';
import { evaluateSmartUtilityReadiness } from './smartUtilityEvaluator';

const smartCityReady = createProjectBox({
  domain: "SMART_CITY",
  category: "autonomous_city_supply_chain_event",
  tags: [
    "custody",
    "routing",
    "schedule",
    "transaction",
    "provenance",
    "agent_policy",
    "human_override"
  ],
  custodyRequired: true,
  routingRequired: true,
  schedulingRequired: true,
  transactionRequired: true
});

const smartCityMissingOverride = createProjectBox({
  domain: "SMART_CITY",
  category: "autonomous_city_supply_chain_event",
  tags: [
    "custody",
    "routing",
    "schedule",
    "transaction",
    "provenance",
    "agent_policy"
  ],
  custodyRequired: true,
  routingRequired: true,
  schedulingRequired: true,
  transactionRequired: true
});

const supplyChainMissingProvenance = createProjectBox({
  domain: "SUPPLY_CHAIN",
  category: "sensor_verified_distribution_event",
  tags: [
    "custody",
    "routing",
    "schedule",
    "transaction",
    "agent_policy",
    "human_override"
  ],
  custodyRequired: true,
  routingRequired: true,
  schedulingRequired: true,
  transactionRequired: true
});

console.log("SMART_UTILITY_PROFILE_V1=START");

const cases = [
  { name: "SMART_CITY_READY", box: smartCityReady },
  { name: "SMART_CITY_MISSING_OVERRIDE", box: smartCityMissingOverride },
  { name: "SUPPLY_CHAIN_MISSING_PROVENANCE", box: supplyChainMissingProvenance }
];

for (const c of cases) {
  console.log("----");
  console.log(c.name);
  console.log("PROJECT_BOX=" + JSON.stringify(evaluateProjectBox(c.box)));
  console.log("SMART_PROFILE=" + JSON.stringify(evaluateSmartUtilityReadiness(c.box)));
}

console.log("SMART_UTILITY_PROFILE_V1=COMPLETE");
