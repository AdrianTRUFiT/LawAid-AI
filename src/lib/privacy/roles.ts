export type PrivacyRoleType = "controller" | "processor" | "joint_controller" | "subprocessor";

export interface PrivacyRoleAssignment {
  artifactType: string;
  primaryRole: PrivacyRoleType;
  secondaryRole?: PrivacyRoleType;
  controllerEntity: string;
  processorEntity?: string;
  notes: string[];
}

export function getPrivacyRoleAssignment(
  artifactType: string,
): PrivacyRoleAssignment {
  switch (artifactType) {
    case "ReviewQueueItem":
    case "ReviewAuditRecord":
    case "PermanentRefusalRecord":
    case "ApprovedReviewRecord":
      return {
        artifactType,
        primaryRole: "controller",
        secondaryRole: "processor",
        controllerEntity: "FundTrackerAI",
        processorEntity: "FinTechionAI",
        notes: [
          "Controller/processor mapping is provisional and must be finalized per deployment.",
          "No external processor role should be assumed without contract review.",
        ],
      };

    case "VerifiedOpportunity":
      return {
        artifactType,
        primaryRole: "controller",
        controllerEntity: "FundTrackerAI",
        notes: [
          "Verification artifacts should remain purpose-bound to transaction governance.",
        ],
      };

    default:
      return {
        artifactType,
        primaryRole: "controller",
        controllerEntity: "FundTrackerAI",
        notes: [
          "Unclassified artifact. Confirm actual role allocation before production use.",
        ],
      };
  }
}
