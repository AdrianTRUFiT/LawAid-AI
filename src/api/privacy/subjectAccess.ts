import { getDeletionPolicy } from "../../lib/privacy/deletion";
import { getPrivacyRoleAssignment } from "../../lib/privacy/roles";
import { evaluateRetentionClass } from "../../lib/privacy/retention";
import { buildSubjectAccessBundle } from "../../lib/privacy/subjectAccess";

export function getSubjectAccessBundleApi(subjectId: string) {
  return {
    ok: true,
    artifactType: "SubjectAccessBundle",
    payload: buildSubjectAccessBundle(subjectId),
  };
}

export function getRetentionEvaluationApi(
  retentionClass: "ephemeral" | "operational" | "compliance" | "dispute" | "archival",
  createdAt?: string,
) {
  return {
    ok: true,
    artifactType: "RetentionEvaluation",
    payload: evaluateRetentionClass(retentionClass, createdAt),
  };
}

export function getDeletionPolicyApi(artifactType: string) {
  return {
    ok: true,
    artifactType: "DeletionPolicy",
    payload: getDeletionPolicy(artifactType),
  };
}

export function getRoleAssignmentApi(artifactType: string) {
  return {
    ok: true,
    artifactType: "PrivacyRoleAssignment",
    payload: getPrivacyRoleAssignment(artifactType),
  };
}
