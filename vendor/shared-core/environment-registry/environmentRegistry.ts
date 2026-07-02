export type AuthorityLevel =
  | "authoritative"
  | "development"
  | "staging"
  | "sandbox"
  | "mirror"
  | "portable"
  | "disposable";

export type PrivacyClass =
  | "public_shareable"
  | "proprietary"
  | "client_specific"
  | "sealed_private"
  | "archived"
  | "disposable_test";

export type ShutdownBehavior =
  | "continue"
  | "read_only"
  | "safe_hold"
  | "refuse"
  | "mirror_only";

export type EnvironmentZone = {
  id: string;
  path: string;
  role: string;
  authorityLevel: AuthorityLevel;
  allowedWrites: string[];
  allowedReads: string[];
  privacyClassesAllowed: PrivacyClass[];
  connectedModules: string[];
  backupStatus: "none" | "mirror" | "portable" | "offline";
  shutdownBehavior: ShutdownBehavior;
  corruptionBehavior: ShutdownBehavior;
  launchEligible: boolean;
};

export const AIVA_ENVIRONMENT_REGISTRY: EnvironmentZone[] = [
  {
    id: "SOUL_AUTHORITY",
    path: "S:\\SOUL",
    role: "identity_doctrine_registry_authority",
    authorityLevel: "authoritative",
    allowedWrites: ["HARD_APPROVED", "MARK_CUSTODY", "AUTHORIZED_HUMAN"],
    allowedReads: ["HARD", "PING", "PONG", "MARK"],
    privacyClassesAllowed: ["proprietary", "client_specific", "sealed_private", "archived"],
    connectedModules: ["SOUL", "SoulMark", "IdentityRegistry"],
    backupStatus: "offline",
    shutdownBehavior: "safe_hold",
    corruptionBehavior: "refuse",
    launchEligible: true
  },
  {
    id: "DEV_RUNTIME",
    path: "D:\\DEV",
    role: "active_development_runtime",
    authorityLevel: "development",
    allowedWrites: ["HARD", "PING", "PONG", "MARK", "AUTHORIZED_HUMAN"],
    allowedReads: ["HARD", "PING", "PONG", "MARK"],
    privacyClassesAllowed: ["public_shareable", "proprietary", "disposable_test"],
    connectedModules: ["shared-core", "AIVA", "runtime-tests"],
    backupStatus: "none",
    shutdownBehavior: "safe_hold",
    corruptionBehavior: "refuse",
    launchEligible: true
  },
  {
    id: "STAGING_SANDBOX",
    path: "E:\\",
    role: "staging_test_sandbox",
    authorityLevel: "staging",
    allowedWrites: ["HARD", "PING", "PONG", "MARK"],
    allowedReads: ["HARD", "PING", "PONG", "MARK"],
    privacyClassesAllowed: ["public_shareable", "proprietary", "disposable_test"],
    connectedModules: ["test-harness", "staging"],
    backupStatus: "none",
    shutdownBehavior: "read_only",
    corruptionBehavior: "refuse",
    launchEligible: false
  },
  {
    id: "PORTABLE_VAULT",
    path: "F:\\USB",
    role: "portable_offline_custody",
    authorityLevel: "portable",
    allowedWrites: ["MARK_CUSTODY", "AUTHORIZED_HUMAN"],
    allowedReads: ["HARD", "MARK", "AUTHORIZED_HUMAN"],
    privacyClassesAllowed: ["client_specific", "sealed_private", "archived"],
    connectedModules: ["SoulVault", "portable-custody"],
    backupStatus: "portable",
    shutdownBehavior: "safe_hold",
    corruptionBehavior: "refuse",
    launchEligible: true
  },
  {
    id: "GOOGLE_MIRROR",
    path: "G:\\GoogleDrive",
    role: "mirror_backup_only",
    authorityLevel: "mirror",
    allowedWrites: ["MIRROR_SYNC"],
    allowedReads: ["HARD", "MARK"],
    privacyClassesAllowed: ["public_shareable", "proprietary", "archived"],
    connectedModules: ["mirror-backup"],
    backupStatus: "mirror",
    shutdownBehavior: "mirror_only",
    corruptionBehavior: "read_only",
    launchEligible: false
  },
  {
    id: "LAPTOP_SURFACE",
    path: "C:\\Laptop",
    role: "thin_access_surface",
    authorityLevel: "sandbox",
    allowedWrites: ["CACHE_ONLY"],
    allowedReads: ["HARD", "PING", "PONG", "MARK"],
    privacyClassesAllowed: ["public_shareable", "proprietary", "disposable_test"],
    connectedModules: ["thin-client", "operator-surface"],
    backupStatus: "none",
    shutdownBehavior: "read_only",
    corruptionBehavior: "refuse",
    launchEligible: false
  },
  {
    id: "MOBILE_PRESENCE",
    path: "M:\\Mobile",
    role: "mobile_presence_cache",
    authorityLevel: "disposable",
    allowedWrites: ["CACHE_ONLY"],
    allowedReads: ["AUTHORIZED_HUMAN"],
    privacyClassesAllowed: ["public_shareable", "disposable_test"],
    connectedModules: ["mobile-presence"],
    backupStatus: "none",
    shutdownBehavior: "read_only",
    corruptionBehavior: "refuse",
    launchEligible: false
  }
];
