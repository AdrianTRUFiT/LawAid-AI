import { createProjectBox } from './projectBoxFactory';
import { evaluateProjectBox } from './projectBoxEvaluator';

const cases = [
  {
    name: "SMART_CITY_READY",
    box: createProjectBox({
      domain: "SMART_CITY",
      category: "verified_infrastructure_movement",
      tags: ["custody", "routing", "schedule", "transaction"],
      custodyRequired: true,
      routingRequired: true,
      schedulingRequired: true,
      transactionRequired: true
    })
  },
  {
    name: "SUPPLY_CHAIN_HELD_MISSING_TRANSACTION",
    box: createProjectBox({
      domain: "SUPPLY_CHAIN",
      category: "containerized_distribution_event",
      tags: ["custody", "routing", "schedule"],
      custodyRequired: true,
      routingRequired: true,
      schedulingRequired: true,
      transactionRequired: true
    })
  },
  {
    name: "GENERAL_BLOCKED_NO_TAGS",
    box: createProjectBox({
      domain: "GENERAL",
      category: "unclassified_event",
      tags: [],
      custodyRequired: false,
      routingRequired: false,
      schedulingRequired: false,
      transactionRequired: false
    })
  }
];

console.log("UTILITY_CONTAINER_V1=START");

for (const c of cases) {
  console.log("----");
  console.log(c.name);
  console.log(c.box);
  console.log(evaluateProjectBox(c.box));
}

console.log("UTILITY_CONTAINER_V1=COMPLETE");
