import {
  canRoleAccessSurface,
  canSurfacePerformAction,
  frontendSurfaceLaunchStatus
} from './frontendSurfacePolicy';

const checks = [
  {
    name: "OPERATOR_COMMAND_CENTER_ACCESS",
    result: canRoleAccessSurface("COMMAND_CENTER", "operator")
  },
  {
    name: "EXTERNAL_COMMAND_CENTER_REFUSAL",
    result: canRoleAccessSurface("COMMAND_CENTER", "external_viewer")
  },
  {
    name: "CLIENT_PAID_ACCESS",
    result: canRoleAccessSurface("PAID", "client_user")
  },
  {
    name: "MOBILE_READ_ONLY_ACTION_REFUSAL",
    result: canSurfacePerformAction("MOBILE_VIEW", "mobile_presence_user", "trigger_allowed_actions")
  },
  {
    name: "LDB_ROUTE_STATUS_ACCESS",
    result: canSurfacePerformAction("LDB_SHELL", "buyer", "view_route_artifact")
  }
];

console.log("FRONTEND_SURFACE_REGISTRY_V1=START");

for (const c of checks) {
  console.log("----");
  console.log(c.name);
  console.log(c.result);
}

console.log("----");
console.log("FRONTEND_SURFACE_STATUS");
console.log(frontendSurfaceLaunchStatus());

console.log("FRONTEND_SURFACE_REGISTRY_V1=COMPLETE");
