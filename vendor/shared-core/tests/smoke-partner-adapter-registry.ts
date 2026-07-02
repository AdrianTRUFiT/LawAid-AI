import fs from "fs";
import {
  checkPartnerAdapterUseGuard,
  createPartnerAdapterDefinition,
  getPartnerAdapterLedgerPath,
  recordPartnerAdapterRegistered,
  recordPartnerAdapterUseGuard,
  recordPartnerAdapterValidated,
  updatePartnerAdapterStatus,
  validatePartnerAdapter
} from "../partner-adapter-registry";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const partnerAdapter = createPartnerAdapterDefinition({
  partnerName: "Example Payment Partner",
  adapterName: "Payment Event Intake Adapter",
  adapterKind: "payment_processor",
  status: "DRAFT",
  priority: "HIGH",
  summary: "Adapter profile for receiving external payment events without treating processor output as transaction truth.",
  relatedModules: ["FundTrackerAI", "FinTechionAI", "shared-core"],
  connectionModes: ["api", "webhook"],
  capabilities: [
    {
      capabilityId: "payment-event-intake",
      label: "Payment Event Intake",
      description: "Receives external payment event metadata for governed verification.",
      connectionMode: "webhook",
      requiresCredential: true,
      requiresWebhookSecret: true,
      emitsExternalEvent: true,
      receivesInternalEvent: false
    },
    {
      capabilityId: "payment-status-lookup",
      label: "Payment Status Lookup",
      description: "Queries external processor status for comparison against governed transaction records.",
      connectionMode: "api",
      requiresCredential: true,
      requiresWebhookSecret: false,
      emitsExternalEvent: false,
      receivesInternalEvent: true
    }
  ],
  permissions: [
    "May receive external payment event metadata.",
    "May not create transaction truth.",
    "May not activate LawAidAI output.",
    "May not bypass FundTrackerAI verification."
  ],
  constraints: [
    "Processor event is transport, not truth.",
    "Partner output requires governed verification.",
    "FundTrackerAI remains transaction truth."
  ],
  dependencies: ["FundTrackerAI verification", "webhook secret custody"]
});

recordPartnerAdapterRegistered(partnerAdapter);

assert(partnerAdapter.authorityBoundary.partnerAdapterIsNotAuthority === true, "Partner adapter is not authority");
assert(partnerAdapter.authorityBoundary.partnerAdapterIsNotTrustProof === true, "Partner adapter is not trust proof");
assert(partnerAdapter.authorityBoundary.partnerAdapterIsNotTransactionTruth === true, "Partner adapter is not transaction truth");
assert(partnerAdapter.authorityBoundary.partnerAdapterIsNotActivationApproval === true, "Partner adapter is not activation approval");
assert(partnerAdapter.authorityBoundary.partnerAdapterIsNotProductCommitment === true, "Partner adapter is not product commitment");
assert(partnerAdapter.authorityBoundary.partnerOutputRequiresGovernedVerification === true, "Partner output requires governed verification");

const validation = validatePartnerAdapter(partnerAdapter);
recordPartnerAdapterValidated(partnerAdapter, validation);

assert(validation.valid === true, "Valid partner adapter passes validation");
assert(validation.nextAllowedStatus === "READY_FOR_REVIEW", "Valid adapter can become review-ready");
assert(validation.authorityBoundary.validationIsNotApproval === true, "Partner validation is not approval");
assert(validation.authorityBoundary.validationIsNotConnection === true, "Partner validation is not connection");

const draftUse = checkPartnerAdapterUseGuard(partnerAdapter);
recordPartnerAdapterUseGuard(partnerAdapter, draftUse);

assert(draftUse.allowed === false, "Draft partner adapter cannot connect");
assert(draftUse.reason === "DRAFT_ADAPTER_CANNOT_CONNECT", "Draft partner refusal reason is correct");

const testAdapter = updatePartnerAdapterStatus(partnerAdapter, "APPROVED_FOR_TEST");
const testUse = checkPartnerAdapterUseGuard(testAdapter);
recordPartnerAdapterUseGuard(testAdapter, testUse);

assert(testUse.allowed === true, "Approved test adapter can surface for test");
assert(testUse.reason === "APPROVED_ADAPTER_CAN_SURFACE_FOR_TEST", "Approved test reason is correct");
assert(testUse.authorityBoundary.useGuardIsNotExecution === true, "Partner use guard is not execution");
assert(testUse.authorityBoundary.useGuardIsNotActivation === true, "Partner use guard is not activation");
assert(testUse.authorityBoundary.useGuardIsNotTransactionTruth === true, "Partner use guard is not transaction truth");

const productionAdapter = updatePartnerAdapterStatus(partnerAdapter, "APPROVED_FOR_PRODUCTION");
const productionUse = checkPartnerAdapterUseGuard(productionAdapter);
recordPartnerAdapterUseGuard(productionAdapter, productionUse);

assert(productionUse.allowed === true, "Approved production adapter can surface for production");
assert(productionUse.reason === "APPROVED_ADAPTER_CAN_SURFACE_FOR_PRODUCTION", "Approved production reason is correct");

const supersededAdapter = updatePartnerAdapterStatus(partnerAdapter, "SUPERSEDED");
const supersededUse = checkPartnerAdapterUseGuard(supersededAdapter);
recordPartnerAdapterUseGuard(supersededAdapter, supersededUse);

assert(supersededUse.allowed === false, "Superseded partner adapter cannot connect");
assert(supersededUse.reason === "SUPERSEDED_ADAPTER_CANNOT_CONNECT", "Superseded partner refusal reason is correct");

const invalidAdapter = createPartnerAdapterDefinition({
  partnerName: "",
  adapterName: "",
  adapterKind: "other",
  status: "DRAFT",
  priority: "LOW",
  summary: "",
  relatedModules: [],
  connectionModes: ["api"],
  capabilities: [
    {
      capabilityId: "",
      label: "",
      description: "",
      connectionMode: "webhook",
      requiresCredential: false,
      requiresWebhookSecret: true,
      emitsExternalEvent: false,
      receivesInternalEvent: false
    }
  ],
  permissions: [],
  constraints: [],
  dependencies: []
});

const invalidValidation = validatePartnerAdapter(invalidAdapter);
recordPartnerAdapterValidated(invalidAdapter, invalidValidation);

assert(invalidValidation.valid === false, "Invalid partner adapter fails validation");
assert(invalidValidation.blockedReasons.includes("PARTNER_NAME_REQUIRED"), "Invalid adapter requires partner name");
assert(invalidValidation.blockedReasons.includes("ADAPTER_NAME_REQUIRED"), "Invalid adapter requires adapter name");
assert(invalidValidation.blockedReasons.includes("ADAPTER_SUMMARY_REQUIRED"), "Invalid adapter requires summary");
assert(invalidValidation.blockedReasons.includes("RELATED_MODULE_REQUIRED"), "Invalid adapter requires related module");
assert(invalidValidation.blockedReasons.includes("PERMISSION_BOUNDARY_REQUIRED"), "Invalid adapter requires permission boundary");
assert(invalidValidation.blockedReasons.includes("CONSTRAINTS_REQUIRED"), "Invalid adapter requires constraints");
assert(invalidValidation.blockedReasons.includes("CAPABILITY_CONNECTION_MODE_NOT_DECLARED"), "Invalid adapter detects undeclared capability connection mode");
assert(invalidValidation.blockedReasons.includes("WEBHOOK_SECRET_REQUIRES_WEBHOOK_OR_HYBRID_MODE"), "Invalid adapter detects webhook secret mode mismatch");

const ledgerPath = getPartnerAdapterLedgerPath();
assert(fs.existsSync(ledgerPath), "Partner adapter ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "Partner adapter ledger contains entries");

console.log("");
console.log("PARTNER_ADAPTER_REGISTRY_SMOKE=PASS");









