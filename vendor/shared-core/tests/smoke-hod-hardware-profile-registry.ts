import fs from "fs";
import {
  checkHODHardwareUseGuard,
  createHODHardwareProfile,
  getHODHardwareLedgerPath,
  recordHODHardwareProfileRegistered,
  recordHODHardwareProfileValidated,
  recordHODHardwareUseGuard,
  updateHODHardwareProfileStatus,
  validateHODHardwareProfile
} from "../hod-hardware-profile-registry";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const localProfile = createHODHardwareProfile({
  deviceName: "Operator Desktop Authority Surface",
  deviceClass: "desktop",
  custodyPlane: "local_custody",
  authoritySurface: "desktop_authority_surface",
  status: "DRAFT",
  priority: "HIGH",
  intendedUse: "Local custody and operator authority surface for governed AIVA development.",
  relatedModules: ["AIVA", "AI Coding Lab", "shared-core"],
  capabilityProfile: {
    cpu: "local-cpu",
    memoryGb: 32,
    storageGb: 1000,
    gpu: "optional",
    os: "Windows",
    networkModes: ["local", "tailscale"],
    supportsLocalCustody: true,
    supportsPortableContainer: true,
    supportsOfflineOperation: true,
    supportsEncryptedStorage: true
  },
  constraints: [
    "Device presence does not create permission.",
    "Local custody does not create source truth.",
    "Runtime use requires authorized profile approval."
  ],
  dependencies: ["shared-core", "local custody path"]
});

recordHODHardwareProfileRegistered(localProfile);

assert(localProfile.authorityBoundary.hardwareProfileIsNotAuthority === true, "Hardware profile is not authority");
assert(localProfile.authorityBoundary.hardwareProfileIsNotIdentity === true, "Hardware profile is not identity");
assert(localProfile.authorityBoundary.hardwareProfileIsNotDeploymentApproval === true, "Hardware profile is not deployment approval");
assert(localProfile.authorityBoundary.hardwareProfileIsNotRuntimeExecution === true, "Hardware profile is not runtime execution");
assert(localProfile.authorityBoundary.devicePresenceDoesNotCreatePermission === true, "Device presence does not create permission");

const validation = validateHODHardwareProfile(localProfile);
recordHODHardwareProfileValidated(localProfile, validation);

assert(validation.valid === true, "Valid hardware profile passes validation");
assert(validation.nextAllowedStatus === "PROFILE_READY", "Valid hardware profile can become profile-ready");
assert(validation.authorityBoundary.validationIsNotApproval === true, "Hardware validation is not approval");
assert(validation.authorityBoundary.validationIsNotRuntimeUse === true, "Hardware validation is not runtime use");

const draftUse = checkHODHardwareUseGuard(localProfile);
recordHODHardwareUseGuard(localProfile, draftUse);

assert(draftUse.allowed === false, "Draft hardware profile cannot be used");
assert(draftUse.reason === "DRAFT_PROFILE_CANNOT_BE_USED", "Draft hardware use refusal reason is correct");

const approvedProfile = updateHODHardwareProfileStatus(localProfile, "APPROVED_FOR_LOCAL_USE");
const approvedUse = checkHODHardwareUseGuard(approvedProfile);
recordHODHardwareUseGuard(approvedProfile, approvedUse);

assert(approvedUse.allowed === true, "Approved hardware profile can surface for local use");
assert(approvedUse.reason === "APPROVED_HARDWARE_PROFILE_CAN_SURFACE_FOR_LOCAL_USE", "Approved hardware use reason is correct");
assert(approvedUse.authorityBoundary.useGuardIsNotExecution === true, "Use guard is not execution");
assert(approvedUse.authorityBoundary.useGuardIsNotDeployment === true, "Use guard is not deployment");
assert(approvedUse.authorityBoundary.useGuardIsNotIdentityAuthority === true, "Use guard is not identity authority");

const supersededProfile = updateHODHardwareProfileStatus(localProfile, "SUPERSEDED");
const supersededUse = checkHODHardwareUseGuard(supersededProfile);
recordHODHardwareUseGuard(supersededProfile, supersededUse);

assert(supersededUse.allowed === false, "Superseded hardware profile cannot be used");
assert(supersededUse.reason === "SUPERSEDED_PROFILE_CANNOT_BE_USED", "Superseded hardware refusal reason is correct");

const invalidProfile = createHODHardwareProfile({
  deviceName: "Invalid Custody Device",
  deviceClass: "desktop",
  custodyPlane: "local_custody",
  authoritySurface: "unknown",
  status: "DRAFT",
  intendedUse: "",
  relatedModules: [],
  capabilityProfile: {
    os: "",
    networkModes: [],
    supportsLocalCustody: false,
    supportsPortableContainer: false,
    supportsOfflineOperation: false,
    supportsEncryptedStorage: false
  },
  constraints: [],
  dependencies: []
});

const invalidValidation = validateHODHardwareProfile(invalidProfile);
recordHODHardwareProfileValidated(invalidProfile, invalidValidation);

assert(invalidValidation.valid === false, "Invalid hardware profile fails validation");
assert(invalidValidation.blockedReasons.includes("INTENDED_USE_REQUIRED"), "Invalid profile requires intended use");
assert(invalidValidation.blockedReasons.includes("AUTHORITY_SURFACE_REQUIRED"), "Invalid profile requires authority surface");
assert(invalidValidation.blockedReasons.includes("OS_REQUIRED"), "Invalid profile requires OS");
assert(invalidValidation.blockedReasons.includes("NETWORK_MODE_REQUIRED"), "Invalid profile requires network mode");
assert(invalidValidation.blockedReasons.includes("LOCAL_CUSTODY_SUPPORT_REQUIRED"), "Local custody requires local custody support");
assert(invalidValidation.blockedReasons.includes("ENCRYPTED_STORAGE_REQUIRED_FOR_CUSTODY"), "Local custody requires encrypted storage");

const ledgerPath = getHODHardwareLedgerPath();
assert(fs.existsSync(ledgerPath), "HOD hardware ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "HOD hardware ledger contains entries");

console.log("");
console.log("HOD_HARDWARE_PROFILE_REGISTRY_SMOKE=PASS");









