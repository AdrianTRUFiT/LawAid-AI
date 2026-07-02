export type UtilityCapability =
  | "DEMAND_SENSING"
  | "PROCUREMENT_AGENT"
  | "LOCAL_PRODUCTION"
  | "AUTONOMOUS_LOGISTICS"
  | "SMART_WAREHOUSING"
  | "MACHINE_TRANSACTION"
  | "CITYWIDE_OS"
  | "EMERGENCY_MODE"
  | "GOVERNANCE_OVERRIDE";

export type SmartUtilityProfile = {
  domain: "SMART_CITY" | "SUPPLY_CHAIN" | "DISTRIBUTION" | "FINANCIAL" | "LEGAL";
  requiredCapabilities: UtilityCapability[];
  requiredTags: string[];
  humanOverrideRequired: boolean;
  autonomousTransactionAllowed: boolean;
  emergencyModeSupported: boolean;
};

export const SMART_CITY_SUPPLY_CHAIN_PROFILE: SmartUtilityProfile = {
  domain: "SMART_CITY",
  requiredCapabilities: [
    "DEMAND_SENSING",
    "PROCUREMENT_AGENT",
    "LOCAL_PRODUCTION",
    "AUTONOMOUS_LOGISTICS",
    "SMART_WAREHOUSING",
    "MACHINE_TRANSACTION",
    "CITYWIDE_OS",
    "EMERGENCY_MODE",
    "GOVERNANCE_OVERRIDE"
  ],
  requiredTags: [
    "custody",
    "routing",
    "schedule",
    "transaction",
    "provenance",
    "agent_policy",
    "human_override"
  ],
  humanOverrideRequired: true,
  autonomousTransactionAllowed: true,
  emergencyModeSupported: true
};

export const SUPPLY_CHAIN_PROFILE: SmartUtilityProfile = {
  domain: "SUPPLY_CHAIN",
  requiredCapabilities: [
    "DEMAND_SENSING",
    "PROCUREMENT_AGENT",
    "AUTONOMOUS_LOGISTICS",
    "SMART_WAREHOUSING",
    "MACHINE_TRANSACTION",
    "GOVERNANCE_OVERRIDE"
  ],
  requiredTags: [
    "custody",
    "routing",
    "schedule",
    "transaction",
    "provenance",
    "agent_policy",
    "human_override"
  ],
  humanOverrideRequired: true,
  autonomousTransactionAllowed: true,
  emergencyModeSupported: false
};

export const FINANCIAL_PROFILE: SmartUtilityProfile = {
  domain: "FINANCIAL",
  requiredCapabilities: [
    "MACHINE_TRANSACTION",
    "GOVERNANCE_OVERRIDE"
  ],
  requiredTags: [
    "custody",
    "routing",
    "schedule",
    "transaction"
  ],
  humanOverrideRequired: false,
  autonomousTransactionAllowed: false,
  emergencyModeSupported: false
};

export const LEGAL_PROFILE: SmartUtilityProfile = {
  domain: "LEGAL",
  requiredCapabilities: [
    "GOVERNANCE_OVERRIDE"
  ],
  requiredTags: [
    "custody",
    "routing",
    "schedule",
    "transaction"
  ],
  humanOverrideRequired: false,
  autonomousTransactionAllowed: false,
  emergencyModeSupported: false
};
